import { expect, test } from "vitest";

import {
  PROBE_CLASS,
  PROBE_PROPERTIES,
  assembleOverrideEvidence,
  compareToBaseline,
  componentOverrideRecord,
  overrideTargetsFor,
  probeStylesheet,
  varProbeValue,
} from "./override-evidence-lib.mjs";

test("probe stylesheet is a single class with no !important", () => {
  const css = probeStylesheet();
  expect(css.startsWith(`.${PROBE_CLASS} {`)).toBe(true);
  expect(css).not.toMatch(/!important/);
  for (const { prop, value } of PROBE_PROPERTIES) {
    expect(css).toContain(`${prop}: ${value};`);
  }
});

test("varProbeValue derives sentinels by default shape", () => {
  expect(varProbeValue("#aabbcc").value).toBe("rgb(9, 8, 7)");
  expect(varProbeValue("rgb(0, 0, 0)").value).toBe("rgb(9, 8, 7)");
  expect(varProbeValue("12px")).toEqual({
    value: "15px",
    rule: "numeric default → bumped by 3, unit kept",
  });
  expect(varProbeValue("0.5rem").value).toBe("3.5rem");
  expect(varProbeValue("var(--something)").rule).toMatch(/liveness only/);
});

test("overrideTargetsFor reads className and theming vars from the contract", () => {
  const targets = overrideTargetsFor({
    props: { className: { optional: true, type: "string" } },
    theming: { vars: [{ name: "--dt-badge-ink", default: "#111111" }] },
  });
  expect(targets.hasClassName).toBe(true);
  expect(targets.vars).toHaveLength(1);
  expect(targets.vars[0].probe.value).toBe("rgb(9, 8, 7)");
  expect(overrideTargetsFor({ props: {} })).toEqual({
    hasClassName: false,
    vars: [],
  });
});

test("componentOverrideRecord classifies skip, render error, fail, and pass", () => {
  expect(componentOverrideRecord({ skip: "x" })).toEqual({
    status: "skipped",
    reason: "x",
  });
  expect(componentOverrideRecord({ renderError: "boom" })).toEqual({
    status: "render-error",
    error: "boom",
  });
  const notForwarded = componentOverrideRecord({
    classNameForwarded: false,
    overrides: {},
  });
  expect(notForwarded.status).toBe("fail");
  expect(notForwarded.overrideWins.error).toMatch(/not forwarded/);
  const mixed = componentOverrideRecord({
    classNameForwarded: true,
    overrides: {
      color: { pass: true, computed: "rgb(9, 8, 7)" },
      "margin-block-start": { pass: false, computed: "0px" },
    },
  });
  expect(mixed.status).toBe("fail");
  expect(mixed.overrideWins.props.color).toEqual({ pass: true });
  expect(mixed.overrideWins.props["margin-block-start"].computed).toBe("0px");
  const pass = componentOverrideRecord({
    classNameForwarded: true,
    overrides: { color: { pass: true, computed: "rgb(9, 8, 7)" } },
    vars: { "--dt-x": { changed: true, probeValue: "rgb(9, 8, 7)" } },
  });
  expect(pass.status).toBe("pass");
  expect(pass.themingVars.ok).toBe(true);
});

test("a dead theming var fails the component", () => {
  const record = componentOverrideRecord({
    classNameForwarded: true,
    overrides: { color: { pass: true, computed: "rgb(9, 8, 7)" } },
    vars: { "--dt-dead": { changed: false, probeValue: "7px" } },
  });
  expect(record.status).toBe("fail");
  expect(record.themingVars.vars["--dt-dead"].pass).toBe(false);
});

test("assembleOverrideEvidence sorts, totals, and states the contract", () => {
  const report = assembleOverrideEvidence({
    packageName: "@digitaltableteur/react",
    packageVersion: "0.1.22",
    environment: { chromium: "140.0.0.0", playwright: "1.62.1", reducedMotion: true },
    components: {
      Text: componentOverrideRecord({
        classNameForwarded: true,
        overrides: { color: { pass: true, computed: "rgb(9, 8, 7)" } },
      }),
      Badge: componentOverrideRecord({ skip: "x" }),
      Alert: componentOverrideRecord({ renderError: "boom" }),
      Title: componentOverrideRecord({
        classNameForwarded: true,
        overrides: { color: { pass: false, computed: "rgb(0, 0, 0)" } },
      }),
    },
  });
  expect(Object.keys(report.components)).toEqual([
    "Alert",
    "Badge",
    "Text",
    "Title",
  ]);
  expect(report.totals).toEqual({
    pass: 1,
    fail: 1,
    renderError: 1,
    skipped: 1,
    themingVarsDeclared: 0,
  });
  expect(report.contract).toMatch(/className-override-wins/);
});

test("compareToBaseline reports new failures and stale approvals", () => {
  const substance = {
    components: {
      Title: { status: "fail" },
      Text: { status: "pass" },
      Card: { status: "fail" },
    },
  };
  const { newFailures, stale } = compareToBaseline(substance, {
    entries: {
      Card: { note: "known compound selector debt", on: "2026-08-07" },
      Text: { note: "was failing before the tokens fix", on: "2026-08-01" },
    },
  });
  expect(newFailures).toEqual(["Title"]);
  expect(stale).toEqual(["Text"]);
});
