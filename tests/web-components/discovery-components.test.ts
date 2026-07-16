import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  defineNativeElements,
  DtCategoryFilterElement,
  DtGalleryElement,
  DtReadingProgressElement,
  DtSelectableCardElement,
  DtSelectableCardGroupElement,
  DtValueCardElement,
} from "../../packages/web-components/src/native";

beforeAll(() => defineNativeElements());
afterEach(() => document.body.replaceChildren());

describe("native discovery component batch", () => {
  it("dispatches controlled category requests without mutating active state", () => {
    const element = document.createElement(
      "dt-category-filter",
    ) as DtCategoryFilterElement;
    element.categories = [
      { value: "all", label: "All" },
      { value: "design", label: "Design" },
    ];
    element.activeCategory = "all";
    const listener = vi.fn();
    element.addEventListener("category-change", listener);
    document.body.append(element);

    const buttons = element.shadowRoot?.querySelectorAll("button");
    (buttons?.[1] as HTMLButtonElement).click();

    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
      category: "design",
    });
    expect(element.activeCategory).toBe("all");
  });

  it("renders gallery image semantics and captions from structured data", () => {
    const element = document.createElement("dt-gallery") as DtGalleryElement;
    element.images = [
      { src: "/image.jpg", alt: "Design system overview", caption: "Overview" },
    ];
    document.body.append(element);

    expect(element.shadowRoot?.querySelector("img")).toHaveAttribute(
      "alt",
      "Design system overview",
    );
    expect(element.shadowRoot?.querySelector("figcaption")).toHaveTextContent(
      "Overview",
    );
  });

  it("calculates reading progress against a property target", () => {
    const target = document.createElement("article");
    target.getBoundingClientRect = vi.fn(
      () => ({ top: 100, height: 1000 }) as DOMRect,
    );
    const element = document.createElement(
      "dt-reading-progress",
    ) as DtReadingProgressElement;
    element.target = target;
    element.showPercentage = true;
    document.body.append(target, element);

    expect(element).toHaveAttribute("role", "progressbar");
    expect(Number(element.getAttribute("aria-valuenow"))).toBeGreaterThan(0);
    expect(
      element.shadowRoot?.querySelector('[part="percentage"]'),
    ).toBeTruthy();
  });

  it("owns single selection and emits the next group value", () => {
    const group = document.createElement(
      "dt-selectable-card-group",
    ) as DtSelectableCardGroupElement;
    group.legend = "Choose a plan";
    group.value = "starter";
    const starter = document.createElement(
      "dt-selectable-card",
    ) as DtSelectableCardElement;
    starter.value = "starter";
    const studio = document.createElement(
      "dt-selectable-card",
    ) as DtSelectableCardElement;
    studio.value = "studio";
    group.append(starter, studio);
    const listener = vi.fn();
    group.addEventListener("value-change", listener);
    document.body.append(group);

    (studio.shadowRoot?.querySelector("input") as HTMLInputElement).click();
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
      value: "studio",
    });
  });

  it("renders a semantic value card with projected icon content", () => {
    const element = document.createElement(
      "dt-value-card",
    ) as DtValueCardElement;
    element.title = "Accessible";
    element.description = "Built-in semantics";
    const icon = document.createElement("span");
    icon.slot = "icon";
    icon.textContent = "A";
    element.append(icon);
    document.body.append(element);

    expect(element.shadowRoot?.querySelector("article")).toBeTruthy();
    expect(element.shadowRoot?.querySelector("h3")).toHaveTextContent(
      "Accessible",
    );
    expect(element.shadowRoot?.querySelector('slot[name="icon"]')).toBeTruthy();
  });
});
