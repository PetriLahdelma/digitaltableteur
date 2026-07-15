import { describe, expect, it } from "vitest";
import { evaluateStoryParity } from "./web-component-story-parity.mjs";

describe("evaluateStoryParity", () => {
  it("accepts exact and explicitly equivalent stories", () => {
    const result = evaluateStoryParity({
      reactStories: ["Default", "Example (filter group)"],
      nativeStories: ["Default", "Example"],
      equivalents: [{ react: "Example (filter group)", native: "Example" }],
    });

    expect(result).toEqual({ errors: [], missing: [], parity: 1 });
  });

  it("reports uncovered React stories", () => {
    const result = evaluateStoryParity({
      reactStories: ["Default", "Loading"],
      nativeStories: ["Default"],
    });

    expect(result.missing).toEqual(["Loading"]);
    expect(result.parity).toBe(0.5);
  });

  it("rejects stale, duplicate, and unexplained decisions", () => {
    const result = evaluateStoryParity({
      reactStories: ["Default", "Async"],
      nativeStories: ["Default", "Loading"],
      equivalents: [
        { react: "Missing", native: "Loading" },
        { react: "Async", native: "Absent" },
      ],
      exclusions: [{ react: "Async", reason: "React only" }],
    });

    expect(result.errors).toEqual([
      'stale equivalent for missing React story "Missing"',
      'equivalent "Async" points to missing native story "Absent"',
      'exclusion for "Async" needs a concrete reason (16+ characters)',
      'duplicate parity decision for React story "Async"',
    ]);
  });
});
