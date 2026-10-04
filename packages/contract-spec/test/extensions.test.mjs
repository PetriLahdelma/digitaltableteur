import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { checkContract, checkExtensions } from "../src/index.mjs";

// RFC 0001 (draft): x-temporal and x-consequence.
const EXAMPLES = fileURLToPath(new URL("../examples/", import.meta.url));
const NOW = new Date("2026-10-04T12:00:00.000Z");
const testRoot = mkdtempSync(join(tmpdir(), "contract-ext-"));
writeFileSync(
  join(testRoot, "save.test.tsx"),
  ["pending-locks-immediately", "clear-undo-window"]
    .map((id) => `it(${JSON.stringify(id)}, () => {});`)
    .join("\n"),
);
const base = () =>
  JSON.parse(readFileSync(join(EXAMPLES, "Button.contract.json"), "utf8"));
const check = (extensions) =>
  checkExtensions({ ...base(), ...extensions }, { now: NOW, testRoot });

const lock = {
  id: "pending-locks-immediately",
  statement: "Repeat activations are ignored while the action is pending.",
  from: "pending",
  to: "locked",
  afterMs: 0,
  guarantees: ["no-duplicate-action"],
  verification: "automated",
  test: "save.test.tsx",
};

test("a well-formed temporal claim backed by a naming test has no findings", () => {
  const result = check({ "x-temporal": { transitions: [lock] } });
  assert.deepEqual(result.findings, []);
  assert.deepEqual(result.claims, { automated: 1, manual: 0, unverified: 0 });
});

test("an automated claim whose test does not name it is a finding", () => {
  const result = check({
    "x-temporal": { transitions: [{ ...lock, id: "renamed-claim" }] },
  });
  assert.ok(
    result.findings.some(
      (f) =>
        f.includes("does not name the claim id") && f.includes("renamed-claim"),
    ),
  );
});

test("an automated claim with a missing test file is a finding", () => {
  const result = check({
    "x-temporal": { transitions: [{ ...lock, test: "gone.test.tsx" }] },
  });
  assert.ok(result.findings.some((f) => f.includes("does not exist")));
});

test("a transition needs exactly one of afterMs and on", () => {
  const both = check({
    "x-temporal": { transitions: [{ ...lock, on: "settled" }] },
  });
  assert.ok(both.findings.length > 0);
  const { afterMs, ...neither } = lock;
  assert.equal(afterMs, 0);
  assert.ok(
    check({ "x-temporal": { transitions: [neither] } }).findings.length > 0,
  );
});

test("a stale manual temporal review is a finding", () => {
  const result = check({
    "x-temporal": {
      validity: [
        {
          id: "cached-journey-stale",
          statement:
            "A cached journey is marked possibly out of date after two minutes.",
          state: "cached",
          staleAfterMs: 120000,
          then: "mark-stale",
          verification: "manual",
          reviewedAt: "2025-01-01",
        },
      ],
    },
  });
  assert.ok(result.findings.some((f) => f.includes("manual review is")));
});

test("an irreversible action without explicit confirmation is below the floor", () => {
  const result = check({
    "x-consequence": {
      actions: [
        {
          id: "delete-account",
          class: "irreversible",
          statement: "Deleting the account removes all data.",
          confirmation: "review",
          recovery: "none",
          verification: "unverified",
        },
      ],
    },
  });
  assert.ok(
    result.findings.some(
      (f) => f.includes("needs confirmation") && f.includes("explicit"),
    ),
  );
});

test("a reversible action needs a recovery path", () => {
  const result = check({
    "x-consequence": {
      actions: [
        {
          id: "clear-undo-window",
          class: "reversible",
          statement: "Clearing can be undone for ten seconds.",
          confirmation: "none",
          recovery: "undo",
          verification: "automated",
          test: "save.test.tsx",
        },
      ],
    },
  });
  assert.deepEqual(result.findings, []);
  const broken = check({
    "x-consequence": {
      actions: [
        {
          id: "clear-undo-window",
          class: "reversible",
          statement: "Clearing is permanent.",
          confirmation: "none",
          recovery: "none",
          verification: "unverified",
        },
      ],
    },
  });
  assert.ok(broken.findings.some((f) => f.includes("needs recovery")));
});

test("identity needs authentication; financial only recommends step-up", () => {
  const identity = check({
    "x-consequence": {
      actions: [
        {
          id: "change-email",
          class: "identity",
          statement: "Changing the sign-in email.",
          confirmation: "explicit",
          recovery: "none",
          verification: "unverified",
        },
      ],
    },
  });
  assert.ok(
    identity.findings.some(
      (f) => f.includes("needs authentication") && f.includes("recent"),
    ),
  );
  const financial = check({
    "x-consequence": {
      actions: [
        {
          id: "buy-ticket",
          class: "financial",
          statement: "Paying for a ticket.",
          confirmation: "explicit",
          recovery: "none",
          verification: "unverified",
        },
      ],
    },
  });
  assert.deepEqual(financial.findings, []);
  assert.ok(financial.warnings.some((w) => w.includes("step-up")));
});

test("prop mode needs a union prop whose every class has a policy", () => {
  const contract = base();
  contract.props.consequence = {
    type: "union",
    values: ["reversible", "irreversible"],
  };
  const result = checkExtensions(
    {
      ...contract,
      "x-consequence": {
        prop: "consequence",
        policies: {
          irreversible: { confirmation: "explicit", recovery: "none" },
        },
      },
    },
    { now: NOW, testRoot },
  );
  assert.ok(
    result.findings.some(
      (f) =>
        f.includes("class") &&
        f.includes("reversible") &&
        f.includes("is allowed by the prop but has no policy"),
    ),
  );
});

test("a policy naming a rule that does not exist is a finding", () => {
  const contract = base();
  contract.props.consequence = { type: "union", values: ["irreversible"] };
  const result = checkExtensions(
    {
      ...contract,
      "x-consequence": {
        prop: "consequence",
        policies: {
          irreversible: {
            confirmation: "explicit",
            recovery: "none",
            rule: "no-such-rule",
          },
        },
      },
    },
    { now: NOW, testRoot },
  );
  assert.ok(
    result.findings.some(
      (f) =>
        f.includes("rule") &&
        f.includes("no-such-rule") &&
        f.includes("is not in rules"),
    ),
  );
});

test("extension findings never change the 1.0 conformance level", () => {
  const contract = {
    ...base(),
    "x-temporal": { transitions: [{ id: "BAD ID" }] },
  };
  const plain = checkContract(base(), {
    root: EXAMPLES,
    now: new Date("2026-09-25T12:00:00.000Z"),
  });
  const extended = checkContract(contract, {
    root: EXAMPLES,
    now: new Date("2026-09-25T12:00:00.000Z"),
    testRoot,
  });
  assert.equal(extended.level, plain.level);
  assert.ok(extended.extensions.findings.length > 0);
});

test("unknown x- fields are still ignored", () => {
  const result = check({ "x-vendor-thing": { anything: true } });
  assert.deepEqual(result.present, []);
  assert.deepEqual(result.findings, []);
});
