import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkContract,
  checkSystem,
  evaluateRules,
  findContractFiles,
} from "../src/index.mjs";

const EXAMPLES = fileURLToPath(new URL("../examples/", import.meta.url));
const NOW = new Date("2026-09-25T12:00:00.000Z");
const example = () =>
  JSON.parse(readFileSync(join(EXAMPLES, "Button.contract.json"), "utf8"));
const check = (contract, options = {}) =>
  checkContract(contract, { root: EXAMPLES, now: NOW, ...options });

test("a deprecation without a migration path stops at Level 1", () => {
  const contract = example();
  contract.props.kind.deprecated = { reason: "Split into variant and tone." };
  const result = check(contract);
  assert.equal(result.level, 1);
  assert.match(result.findings[2][0], /replacement or removeIn/);
});

test("the shipped example is Level 3", () => {
  const result = check(example());
  assert.equal(result.level, 3, JSON.stringify(result.findings));
  assert.deepEqual(result.verification, {
    automated: 1,
    manual: 1,
    unverified: 1,
  });
});

test("schema violations cap at Level 0", () => {
  const contract = example();
  delete contract.description;
  contract.props.variant = { type: "union" };
  const result = check(contract);
  assert.equal(result.level, 0);
  assert.ok(
    result.findings[1].some((finding) => finding.includes("description")),
  );
  assert.ok(result.findings[1].some((finding) => finding.includes("values")));
});

test("a deprecated component must say why and what replaces it", () => {
  const contract = { ...example(), status: "deprecated" };
  assert.equal(check(contract).level, 0);
  contract.deprecation = {
    since: "3.0.0",
    reason: "Use ActionButton.",
    replacement: "ActionButton",
  };
  assert.equal(check(contract).level, 3);
});

test("missing governance or criteria stops at Level 1", () => {
  const contract = example();
  delete contract.governance;
  assert.equal(check(contract).level, 1);
  const noCriteria = { ...example(), accessibility: { criteria: [] } };
  assert.equal(check(noCriteria).level, 1);
});

test("an automated claim without a check or evidence fails the schema", () => {
  const contract = example();
  delete contract.accessibility.criteria[0].evidence;
  assert.equal(check(contract).level, 0);
});

test("stale, failing, future, missing and mismatched evidence all block Level 3", () => {
  const cases = {
    stale: (ref) => {
      ref.capturedAt = "2026-01-01T00:00:00.000Z";
    },
    failing: (ref) => {
      ref.passed = false;
    },
    future: (ref) => {
      ref.capturedAt = "2027-01-01T00:00:00.000Z";
    },
    missing: (ref) => {
      ref.artifact = "evidence/does-not-exist.json";
    },
    commitMismatch: (ref) => {
      ref.sourceCommit = "0000000000000000000000000000000000000000";
    },
  };
  for (const [name, mutate] of Object.entries(cases)) {
    const contract = example();
    mutate(contract.accessibility.criteria[0].evidence[0]);
    const result = check(contract);
    assert.equal(
      result.level,
      2,
      `${name}: ${JSON.stringify(result.findings)}`,
    );
  }
});

test("a contract cannot claim a fresher run than its artifact records", () => {
  const contract = example();
  contract.accessibility.criteria[0].evidence[0].capturedAt =
    "2026-09-24T08:30:00.000Z";
  const result = check(contract);
  assert.equal(result.level, 2);
  assert.ok(
    result.findings[3].some((finding) => finding.includes("does not match")),
  );
});

test("only declared gaps (no automated criterion) cannot reach Level 3", () => {
  const contract = example();
  contract.accessibility.criteria = contract.accessibility.criteria.filter(
    (criterion) => criterion.verification !== "automated",
  );
  assert.equal(check(contract).level, 2);
});

test("a stale manual review blocks Level 3; --max-age-days widens the window", () => {
  const contract = example();
  contract.accessibility.criteria[1].reviewedAt = "2025-12-01";
  assert.equal(check(contract).level, 2);
  assert.equal(check(contract, { maxAgeDays: 400 }).level, 3);
});

test("system level is the lowest stable contract", () => {
  const dir = mkdtempSync(join(tmpdir(), "contract-spec-"));
  const good = example();
  const weak = { ...example(), name: "Card", governance: undefined };
  delete weak.governance;
  const experimental = { ...example(), name: "Draft", status: "experimental" };
  delete experimental.governance;
  writeFileSync(join(dir, "Button.contract.json"), JSON.stringify(good));
  writeFileSync(join(dir, "Card.contract.json"), JSON.stringify(weak));
  writeFileSync(join(dir, "Draft.contract.json"), JSON.stringify(experimental));
  const files = findContractFiles([dir]);
  assert.equal(files.length, 3);
  const report = checkSystem(files, { root: EXAMPLES, now: NOW });
  assert.equal(report.levelScope, "stable");
  assert.equal(report.systemLevel, 1, "Card (stable, L1) caps the system");
  weak.status = "beta";
  writeFileSync(join(dir, "Card.contract.json"), JSON.stringify(weak));
  assert.equal(checkSystem(files, { root: EXAMPLES, now: NOW }).systemLevel, 3);
});

test("unparseable files are reported, not thrown", () => {
  const dir = mkdtempSync(join(tmpdir(), "contract-spec-"));
  writeFileSync(join(dir, "Broken.contract.json"), "{ nope");
  const report = checkSystem(findContractFiles([dir]), { now: NOW });
  assert.equal(report.contracts[0].level, 0);
  assert.match(report.contracts[0].findings[1][0], /not valid JSON/);
});

test("rules: present/absent, children pseudo-prop", () => {
  const contract = example();
  assert.equal(evaluateRules(contract, { icon: "search" }).length, 1);
  assert.equal(
    evaluateRules(contract, { icon: "search", accessibleName: "Search" })
      .length,
    0,
  );
  assert.equal(
    evaluateRules(contract, { icon: "search", children: "Search" }).length,
    0,
  );
  assert.equal(evaluateRules(contract, { children: "Save" }).length, 0);
});

test("rules: equals/oneOf only fire on provable literals; forbid and requireAllOf report props", () => {
  const contract = {
    rules: [
      {
        id: "link-mode",
        when: {
          href: { present: true },
          variant: { oneOf: ["primary", "secondary"] },
        },
        forbid: ["disabled", "type"],
        requireAllOf: ["rel"],
        reason: "Links cannot be disabled.",
        severity: "warning",
      },
    ],
  };
  const violations = evaluateRules(contract, {
    href: "/x",
    variant: "primary",
    disabled: true,
  });
  assert.deepEqual(
    violations.map(({ kind, props }) => [kind, props]),
    [
      ["forbid", ["disabled"]],
      ["requireAllOf", ["rel"]],
    ],
  );
  assert.equal(
    evaluateRules(contract, { href: "/x", variant: { expression: true } })
      .length,
    0,
  );
});
