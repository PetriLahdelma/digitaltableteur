import { expect, test } from "vitest";

import {
  assembleCompatMatrix,
  buildCombos,
  comboDivergence,
  rangeFloor,
} from "./compat-matrix-lib.mjs";

test("rangeFloor parses >= ranges and rejects the rest", () => {
  expect(rangeFloor(">=19.0.0")).toBe("19.0.0");
  expect(rangeFloor(">= 12.0.0")).toBe("12.0.0");
  expect(rangeFloor("^19.0.0")).toBeNull();
  expect(rangeFloor(undefined)).toBeNull();
});

test("buildCombos exercises floor + current and pins react-dom to react", () => {
  const combos = buildCombos({
    declaredReactRange: ">=19.0.0",
    resolved: { react: "19.2.8", framerMotion: "12.43.0", reactMarkdown: "10.1.0" },
  });
  expect(combos).toHaveLength(2);
  expect(combos[0].react).toBe("19.0.0");
  expect(combos[0].reactDom).toBe("19.0.0");
  expect(combos[1].react).toBe("19.2.8");
  expect(combos[0].framerMotion).toBe("12.43.0");
});

test("buildCombos dedupes when the floor is the resolved version", () => {
  const combos = buildCombos({
    declaredReactRange: ">=19.2.8",
    resolved: { react: "19.2.8", framerMotion: "12.43.0", reactMarkdown: "10.1.0" },
  });
  expect(combos).toHaveLength(1);
});

test("comboDivergence flags only differing outcomes", () => {
  const divergence = comboDivergence({
    floor: { Button: "pass", Tooltip: "needs provider", Grid: "pass" },
    current: { Button: "pass", Tooltip: "needs provider", Grid: "boom" },
  });
  expect(divergence).toEqual(["Grid"]);
  expect(comboDivergence({ only: { Button: "pass" } })).toEqual([]);
});

test("assembleCompatMatrix records dimensions honestly and totals divergence", () => {
  const report = assembleCompatMatrix({
    packageName: "@digitaltableteur/react",
    packageVersion: "0.1.24",
    declaredReactRange: ">=19.0.0",
    combos: [
      { label: "react-floor-19.0.0", react: "19.0.0", reactDom: "19.0.0", framerMotion: "12.43.0", reactMarkdown: "10.1.0", outcomes: { B: "pass", A: "pass" } },
    ],
    divergence: [],
  });
  expect(report.dimensions.react.combosExercised).toEqual(["19.0.0"]);
  expect(report.dimensions.next.note).toMatch(/not a package peer/);
  expect(Object.keys(report.combos[0].outcomes)).toEqual(["A", "B"]);
  expect(report.totals).toEqual({ combos: 1, divergence: 0 });
  expect(report.methodology.gate).toMatch(/combo equivalence/);
});
