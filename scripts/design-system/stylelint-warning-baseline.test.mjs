import { describe, expect, it } from "vitest";
import { assignStylelintWarningIds } from "./stylelint-warning-baseline.mjs";

describe("Stylelint stable warning identity", () => {
  it("ignores source and referenced line movement while preserving duplicates", () => {
    const warning = {
      column: 2,
      file: "button.css",
      line: 3,
      rule: "no-descending-specificity",
      text: "Expected .base to come before .hover, at line 20 (no-descending-specificity)",
    };
    const moved = {
      ...warning,
      column: 8,
      line: 30,
      text: "Expected .base to come before .hover, at line 200 (no-descending-specificity)",
    };

    expect(assignStylelintWarningIds([warning]).map(({ id }) => id)).toEqual(
      assignStylelintWarningIds([moved]).map(({ id }) => id),
    );
    expect(assignStylelintWarningIds([warning, moved])).toHaveLength(2);
    expect(new Set(assignStylelintWarningIds([warning, moved]).map(({ id }) => id)).size).toBe(2);
  });
});
