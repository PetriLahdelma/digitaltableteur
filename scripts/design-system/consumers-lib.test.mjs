import { describe, it, expect } from "vitest";
import { computeConsumersForComponent } from "./consumers-lib.mjs";

// Regression guard for the barrel-import parser. The original regex used a
// non-greedy `[\s\S]*?` between `import` and `from "@digitaltableteur/react"`,
// which bled across a preceding `import { … } from "react"` and captured the
// wrong brace group — silently dropping every barrel-consumed component to
// zero consumers. That, in turn, made dogfooded components (consumed only via
// the registry package) fail the stable "requires consumers" gate.
describe("consumers-lib: barrel import parsing", () => {
  it("counts a component imported from @digitaltableteur/react", () => {
    // Progress is consumed only via the barrel (e.g. ContactInquiryPanel does
    // `import { Button, Progress } from "@digitaltableteur/react"`), with a
    // preceding React import in the same file — the exact shape that broke the
    // old regex.
    const consumers = computeConsumersForComponent("Progress");
    expect(consumers.length).toBeGreaterThan(0);
    expect(
      consumers.some((c) => /ContactInquiryPanel|ContactPage/.test(c.path)),
    ).toBe(true);
  });

  it("counts atoms consumed from the barrel across page shells", () => {
    // Title/Text are barrel-consumed across many page shells after the atom
    // consumption sweep; a barrel-blind parser would report zero.
    expect(computeConsumersForComponent("Title").length).toBeGreaterThan(0);
    expect(computeConsumersForComponent("Text").length).toBeGreaterThan(0);
  });
});
