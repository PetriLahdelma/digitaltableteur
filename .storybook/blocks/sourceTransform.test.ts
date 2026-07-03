import { describe, expect, it } from "vitest";
import en from "../../nextjs-app/shared/locales/en/translation.json";
import { dtSourceTransform } from "./sourceTransform";

describe("dtSourceTransform", () => {
  it("replaces Label tKey scaffolding with the English string", () => {
    const out = dtSourceTransform('<Button><Label tKey="buttonPrimary" /></Button>');
    const expected = (en as Record<string, string>).buttonPrimary;
    expect(expected).toBeTruthy();
    expect(out).toContain(`<Button>${expected}</Button>`);
    expect(out).not.toContain("tKey");
  });

  it("unwraps args-spread template arrow wrappers", () => {
    const out = dtSourceTransform("(args) => <Button {...args} />");
    expect(out).toBe("<Button {...args} />");
  });

  it("unwraps bare arrow-story prefixes", () => {
    const out = dtSourceTransform("() => <Row>\n  <Button>Go</Button>\n</Row>");
    expect(out).toBe("<Row>\n  <Button>Go</Button>\n</Row>");
  });

  it("dedents uniformly indented source", () => {
    const out = dtSourceTransform("  <div>\n    <span />\n  </div>");
    expect(out).toBe("<div>\n  <span />\n</div>");
  });
});
