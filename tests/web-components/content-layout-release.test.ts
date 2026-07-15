import { waitFor } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  defineNativeElements,
  DtCardElement,
  DtFlexBoxElement,
  DtListElement,
  DtSectionElement,
  DtSkeletonElement,
  DtTextElement,
  DtTitleElement,
} from "../../packages/web-components/src/native";

beforeAll(() => {
  defineNativeElements();
});

afterEach(() => {
  document.body.replaceChildren();
});

describe("native content and layout regression coverage", () => {
  it("normalizes invalid dt-list items assignments to an empty list payload", () => {
    const element = document.createElement("dt-list") as DtListElement;
    document.body.append(element);

    expect(() => {
      (element as unknown as { items: unknown }).items = '["First","Second"]';
    }).not.toThrow();
    expect(element.getAttribute("items")).toBe("[]");
    expect(element.shadowRoot?.querySelectorAll("li")).toHaveLength(0);

    expect(() => {
      (element as unknown as { items: unknown }).items = null;
    }).not.toThrow();
    expect(element.getAttribute("items")).toBe("[]");

    expect(() => {
      (element as unknown as { items: unknown }).items = undefined;
    }).not.toThrow();
    expect(element.getAttribute("items")).toBe("[]");
    expect(element.shadowRoot?.querySelector("slot")).toBeTruthy();
  });

  it("keeps dt-section IDREF aria attributes on the host and clears reflected spotlight output", () => {
    const element = document.createElement("dt-section") as DtSectionElement;
    element.spotlightTarget = "pricing";
    element.setAttribute("aria-label", "Pricing");
    element.setAttribute("aria-labelledby", "pricing-title");
    element.setAttribute("aria-describedby", "pricing-description");
    document.body.append(element);

    let section = element.shadowRoot?.querySelector("section");
    expect(element).toHaveAttribute("role", "region");
    expect(section).toHaveAttribute("role", "presentation");
    expect(section).not.toHaveAttribute("aria-label");
    expect(section).not.toHaveAttribute("aria-labelledby");
    expect(section).not.toHaveAttribute("aria-describedby");
    expect(section).toHaveAttribute("data-spotlight-target", "pricing");
    expect(element).toHaveAttribute("data-spotlight-target", "pricing");

    element.removeAttribute("spotlight-target");

    section = element.shadowRoot?.querySelector("section");
    expect(section).not.toHaveAttribute("data-spotlight-target");
    expect(element).not.toHaveAttribute("data-spotlight-target");
    expect(element).toHaveAttribute("aria-labelledby", "pricing-title");
    expect(element).toHaveAttribute("aria-describedby", "pricing-description");

    element.removeAttribute("aria-label");
    element.removeAttribute("aria-labelledby");
    expect(element).not.toHaveAttribute("role");
  });

  it("lets dt-text project new light-DOM content without rerendering the shadow root", async () => {
    const element = document.createElement("dt-text") as DtTextElement;
    document.body.append(element);

    const initialRoot = element.shadowRoot?.querySelector("p");
    const slot = initialRoot?.querySelector("slot") as HTMLSlotElement | null;

    element.append("Projected copy");

    await waitFor(() => {
      expect(
        slot
          ?.assignedNodes()
          .map((node) => node.textContent)
          .join(""),
      ).toBe("Projected copy");
    });

    expect(element.shadowRoot?.querySelector("p")).toBe(initialRoot);
  });

  it("raises dt-title line-height modifier specificity above default heading rules", () => {
    const element = document.createElement("dt-title") as DtTitleElement;
    element.as = "h1";
    element.lineHeight = "loose";
    document.body.append(element);

    const styles =
      element.shadowRoot?.querySelector("style")?.textContent ?? "";

    for (const selector of [
      ".title.lineHeightTight",
      ".title.lineHeightSnug",
      ".title.lineHeightNormal",
      ".title.lineHeightRelaxed",
      ".title.lineHeightLoose",
    ]) {
      expect(styles).toContain(selector);
    }
  });

  it("does not copy light-DOM IDREF aria attributes into the dt-card shadow root", () => {
    const element = document.createElement("dt-card") as DtCardElement;
    element.titleText = "Plan";
    element.setAttribute("aria-label", "Plan card");
    element.setAttribute("aria-labelledby", "plan-title");
    element.setAttribute("aria-describedby", "plan-description");
    document.body.append(element);

    const root = element.shadowRoot?.querySelector('[part~="card"]');
    expect(root).toHaveAttribute("aria-label", "Plan card");
    expect(root).not.toHaveAttribute("aria-labelledby");
    expect(root).not.toHaveAttribute("aria-describedby");
    expect(element).toHaveAttribute("aria-labelledby", "plan-title");
    expect(element).toHaveAttribute("aria-describedby", "plan-description");
  });

  it("leaves dt-flex-box semantics on the host instead of duplicating them in shadow DOM", () => {
    const element = document.createElement("dt-flex-box") as DtFlexBoxElement;
    element.setAttribute("role", "group");
    element.ariaLabel = "Control row";
    document.body.append(element);

    const root = element.shadowRoot?.querySelector('[part="root flex-box"]');
    expect(element).toHaveAttribute("role", "group");
    expect(element).toHaveAttribute("aria-label", "Control row");
    expect(root).not.toHaveAttribute("role");
    expect(root).not.toHaveAttribute("aria-label");
  });

  it("renders three dt-skeleton text lines by default when lines is unset", () => {
    const element = document.createElement("dt-skeleton") as DtSkeletonElement;
    element.variant = "text";
    document.body.append(element);

    expect(element.lines).toBe(3);
    expect(
      element.shadowRoot?.querySelectorAll('[part="line skeleton-line"]'),
    ).toHaveLength(3);
  });
});
