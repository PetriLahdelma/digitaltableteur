import { describe, expect, it } from "vitest";
import { createStableRhythmguardIds } from "./rhythmguard-baseline.mjs";

describe("Rhythmguard stable baseline", () => {
  it("ignores line and column movement while preserving duplicate findings", () => {
    const finding = {
      file: "button.css",
      rule: "rhythmguard/use-scale",
      text: "Unexpected off-scale value 13px",
      type: "off-scale",
      value: "13px",
    };

    expect(
      createStableRhythmguardIds({
        css: [
          { ...finding, column: 2, line: 3 },
          { ...finding, column: 8, line: 30 },
        ],
      }),
    ).toEqual(
      createStableRhythmguardIds({
        css: [
          { ...finding, column: 9, line: 300 },
          { ...finding, column: 4, line: 400 },
        ],
      }),
    );
    expect(createStableRhythmguardIds({ css: [finding] })).toHaveLength(1);
    expect(
      createStableRhythmguardIds({ css: [finding, finding] }),
    ).toHaveLength(2);
  });
});
