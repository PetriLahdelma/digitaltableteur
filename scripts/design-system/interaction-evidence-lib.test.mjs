import { expect, test } from "vitest";

import {
  assembleInteractionEvidence,
  componentInteractionRecord,
} from "./interaction-evidence-lib.mjs";

test("componentInteractionRecord classifies skip, render error, and measured", () => {
  expect(componentInteractionRecord({ skip: "x" })).toEqual({
    status: "skipped",
    reason: "x",
  });
  expect(componentInteractionRecord({ renderError: "boom" })).toEqual({
    status: "render-error",
    error: "boom",
  });
  const plain = componentInteractionRecord({ domNodes: 12 });
  expect(plain).toEqual({ status: "measured", domNodes: 12 });
  const withRecipe = componentInteractionRecord({
    domNodes: 40,
    recipe: {
      name: "sort 1k rows (header click)",
      status: "completed",
      facts: { ariaSort: "ascending", visibleRows: 25 },
    },
  });
  expect(withRecipe.recipe.facts.visibleRows).toBe(25);
});

test("assembleInteractionEvidence sorts, totals, and keeps timings out of substance", () => {
  const report = assembleInteractionEvidence({
    packageName: "@digitaltableteur/react",
    packageVersion: "0.1.24",
    environment: { chromium: "140.0.0.0", playwright: "1.62.1", reducedMotion: true },
    components: {
      Text: componentInteractionRecord({ domNodes: 1 }),
      DataTable: componentInteractionRecord({
        domNodes: 120,
        recipe: { name: "sort", status: "completed", facts: { visibleRows: 25 } },
      }),
      Badge: componentInteractionRecord({ skip: "x" }),
      Alert: componentInteractionRecord({ renderError: "boom" }),
    },
  });
  expect(Object.keys(report.components)).toEqual([
    "Alert",
    "Badge",
    "DataTable",
    "Text",
  ]);
  expect(report.totals).toEqual({
    measured: 2,
    recipes: 1,
    renderError: 1,
    skipped: 1,
  });
  expect(JSON.stringify(report)).not.toMatch(/mountMs|Ms"/);
  expect(report.methodology.timings).toMatch(/outside the substance stamp/);
});
