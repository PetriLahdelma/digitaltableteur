import { describe, it, expect } from "vitest";
import { generateThemeCss } from "./generate-theme.mjs";

const valid = new Set(["--color-primary", "--color-info", "--color-focus-ring"]);

describe("generateThemeCss", () => {
  it("emits a scoped block with sorted, overridden tokens", () => {
    const css = generateThemeCss(
      {
        name: "acme",
        selector: '[data-brand="acme"]',
        tokens: { "--color-primary": "#5b21b6", "--color-info": "#0ea5e9" },
      },
      valid,
    );
    expect(css).toContain('[data-brand="acme"] {');
    expect(css).toContain("--color-info: #0ea5e9;");
    expect(css).toContain("--color-primary: #5b21b6;");
    // sorted: info before primary
    expect(css.indexOf("--color-info")).toBeLessThan(css.indexOf("--color-primary"));
  });

  it("defaults the selector to a data-brand attribute", () => {
    const css = generateThemeCss(
      { name: "beta", tokens: { "--color-primary": "#000" } },
      valid,
    );
    expect(css).toContain('[data-brand="beta"] {');
  });

  it("throws on an unknown token (a typo would be a silent no-op otherwise)", () => {
    expect(() =>
      generateThemeCss({ name: "x", tokens: { "--color-nope": "#000" } }, valid),
    ).toThrow(/unknown tokens/);
  });

  it("throws when name or overrides are missing", () => {
    expect(() => generateThemeCss({ tokens: { "--color-primary": "#000" } }, valid)).toThrow(
      /name is required/,
    );
    expect(() => generateThemeCss({ name: "empty", tokens: {} }, valid)).toThrow(
      /no token overrides/,
    );
  });
});
