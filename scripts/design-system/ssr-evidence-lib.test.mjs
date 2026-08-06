import { expect, test } from "vitest";

import {
  assembleSsrEvidence,
  componentRecord,
  hydrationContainerChainFor,
  renderPlanFor,
  stableErrorMessage,
} from "./ssr-evidence-lib.mjs";

test("no contract means an honest non-component skip", () => {
  const plan = renderPlanFor("useThing", null);
  expect(plan.skip).toMatch(/not a renderable component export/);
});

test("playground defaults become render props", () => {
  const plan = renderPlanFor("Button", {
    props: { variant: { optional: true, type: "string" } },
    playground: { defaults: { variant: "primary", children: "Save" } },
  });
  expect(plan.props).toEqual({ variant: "primary", children: "Save" });
});

test("a required prop with no default skips with the prop named", () => {
  const plan = renderPlanFor("Chart", {
    props: {
      data: { type: "Point[]" },
      title: { optional: true, type: "string" },
    },
    playground: { defaults: {} },
  });
  expect(plan.skip).toMatch(/required props without playground defaults: data/);
});

test("required children are satisfied with a placeholder string", () => {
  const plan = renderPlanFor("Card", {
    props: { children: { type: "ReactNode" } },
  });
  expect(plan.props.children).toBe("Evidence");
});

test("componentRecord classifies skip, ssr error, hydration error, and pass", () => {
  expect(componentRecord({ skip: "x" })).toEqual({
    status: "skipped",
    reason: "x",
  });
  expect(componentRecord({ ssrError: "window is not defined" })).toEqual({
    status: "ssr-error",
    ssr: { ok: false, error: "window is not defined" },
  });
  expect(
    componentRecord({ htmlBytes: 10, hydrationErrors: ["mismatch"] }).status,
  ).toBe("hydration-error");
  const pass = componentRecord({ htmlBytes: 10, hydrationErrors: [] });
  expect(pass.status).toBe("pass");
  expect(pass.ssr).toEqual({ ok: true, htmlBytes: 10 });
  expect(pass.hydration).toEqual({ ok: true });
});

test("assembleSsrEvidence sorts and totals honestly", () => {
  const report = assembleSsrEvidence({
    packageName: "@digitaltableteur/react",
    packageVersion: "0.1.22",
    reactVersion: "19.2.8",
    jsdomVersion: "30.0.1",
    entries: {
      layout: {
        importError: null,
        components: {
          Grid: componentRecord({ htmlBytes: 5, hydrationErrors: [] }),
          Card: componentRecord({ ssrError: "boom" }),
        },
      },
      actions: {
        importError: null,
        components: {
          Button: componentRecord({ htmlBytes: 9, hydrationErrors: ["m"] }),
          useX: componentRecord({ skip: "no component contract" }),
        },
      },
    },
  });
  expect(Object.keys(report.entries)).toEqual(["actions", "layout"]);
  expect(report.totals).toEqual({
    ssrPass: 2,
    ssrError: 1,
    hydrationClean: 1,
    hydrationError: 1,
    skipped: 1,
  });
  expect(report.environment.react).toBe("19.2.8");
});

test("fragment elements get a valid hydration ancestor chain", () => {
  expect(hydrationContainerChainFor("tr")).toEqual(["table", "tbody"]);
  expect(hydrationContainerChainFor("td")).toEqual(["table", "tbody", "tr"]);
  expect(hydrationContainerChainFor("th")).toEqual(["table", "tbody", "tr"]);
  expect(hydrationContainerChainFor("li")).toEqual(["ul"]);
  expect(hydrationContainerChainFor("div")).toEqual([]);
  expect(hydrationContainerChainFor(undefined)).toEqual([]);
});

test("stableErrorMessage flattens to one bounded line", () => {
  const long = new Error(`first line\nsecond line`);
  expect(stableErrorMessage(long)).toBe("first line");
  expect(stableErrorMessage("x".repeat(500)).length).toBe(300);
  expect(stableErrorMessage(null)).toBe("unknown error");
});
