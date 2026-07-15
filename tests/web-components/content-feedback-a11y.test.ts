import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { DtKbdElement } from "../../packages/web-components/src/native/kbd";
import { DtSkeletonElement } from "../../packages/web-components/src/native/skeleton";
import { DtVisuallyHiddenElement } from "../../packages/web-components/src/native/visually-hidden";

beforeAll(() => {
  if (!customElements.get("dt-kbd")) {
    customElements.define("dt-kbd", DtKbdElement);
  }
  if (!customElements.get("dt-skeleton")) {
    customElements.define("dt-skeleton", DtSkeletonElement);
  }
  if (!customElements.get("dt-visually-hidden")) {
    customElements.define("dt-visually-hidden", DtVisuallyHiddenElement);
  }
});

afterEach(() => {
  document.body.replaceChildren();
});

describe("native content feedback and a11y primitives", () => {
  it("renders dt-kbd as a semantic keycap with token sizing and forced-colors support", () => {
    const element = document.createElement("dt-kbd") as DtKbdElement;
    element.size = "lg";
    element.content = "Esc";
    document.body.append(element);

    const kbd = element.shadowRoot?.querySelector("kbd");
    const styles =
      element.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(kbd?.classList.contains("kbd")).toBe(true);
    expect(kbd?.classList.contains("lg")).toBe(true);
    expect(kbd?.getAttribute("part")).toBe("root kbd");
    expect(kbd?.textContent).toBe("Esc");
    expect(kbd?.querySelector("slot")).toBeTruthy();
    expect(styles).toContain("@media (forced-colors: active)");
    expect(styles).toContain("border-color: ButtonText");
  });

  it("renders dt-skeleton text lines with polite status semantics and motion/contrast fallbacks", () => {
    const element = document.createElement("dt-skeleton") as DtSkeletonElement;
    element.variant = "text";
    element.lines = 4;
    element.width = "75%";
    element.setAttribute("animate", "true");
    element.label = "Loading article preview";
    document.body.append(element);

    const root = element.shadowRoot?.querySelector('[part="root skeleton"]');
    const lines = element.shadowRoot?.querySelectorAll(
      '[part="line skeleton-line"]',
    );
    const styles =
      element.shadowRoot?.querySelector("style")?.textContent ?? "";

    expect(root?.getAttribute("role")).toBe("status");
    expect(root?.getAttribute("aria-live")).toBe("polite");
    expect(root?.getAttribute("aria-label")).toBe("Loading article preview");
    expect(root?.classList.contains("root")).toBe(true);
    expect(root?.classList.contains("text")).toBe(true);
    expect(root?.classList.contains("animate")).toBe(true);
    expect((root as HTMLElement | null)?.style.width).toBe("75%");
    expect(lines).toHaveLength(4);
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain("@media (forced-colors: active)");
    expect(styles).toContain(".text.animate .line");
  });

  it("renders dt-visually-hidden with the requested semantic tag and clipping styles", () => {
    const element = document.createElement(
      "dt-visually-hidden",
    ) as DtVisuallyHiddenElement;
    element.as = "h2";
    element.content = "Screen reader heading";
    document.body.append(element);

    const hidden = element.shadowRoot?.querySelector("h2");
    const styles =
      element.shadowRoot?.querySelector("style")?.textContent ?? "";

    expect(hidden?.classList.contains("root")).toBe(true);
    expect(hidden?.getAttribute("part")).toBe("root visually-hidden");
    expect(hidden?.textContent).toBe("Screen reader heading");
    expect(hidden?.querySelector("slot")).toBeTruthy();
    expect(styles).toContain("clip-path: inset(50%)");
    expect(styles).toContain("inline-size: 1px");
    expect(styles).toContain("position: absolute");
  });
});
