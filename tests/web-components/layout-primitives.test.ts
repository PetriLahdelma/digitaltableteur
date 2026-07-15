import { waitFor } from "@testing-library/dom";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  defineNativeElements,
  DtDisplayElement,
  DtFlexBoxElement,
  DtGridElement,
} from "../../packages/web-components/src/native";

beforeAll(() => {
  defineNativeElements();
});

afterEach(() => {
  document.body.replaceChildren();
});

describe("native layout primitives", () => {
  it("renders dt-display with canonical tag and typography slot fallback", () => {
    const element = document.createElement("dt-display") as DtDisplayElement;
    element.as = "h2";
    element.content = "Hero title";
    document.body.append(element);

    const heading = element.shadowRoot?.querySelector("h2");
    const slot = heading?.querySelector("slot");

    expect(heading).toHaveClass("display");
    expect(heading).toHaveAttribute("part", "root display");
    expect(slot?.textContent).toBe("Hero title");
  });

  it("applies dt-flex-box layout props as native inline flex styles", () => {
    const element = document.createElement("dt-flex-box") as DtFlexBoxElement;
    element.direction = "column-reverse";
    element.wrap = "wrap";
    element.justify = "space-between";
    element.align = "center";
    element.alignContent = "space-around";
    element.gap = 12;
    element.rowGap = "1rem";
    element.columnGap = 8;
    element.ariaLabel = "Layout group";
    element.append(
      document.createElement("div"),
      document.createElement("div"),
    );
    document.body.append(element);

    const root = element.shadowRoot?.querySelector('[part="root flex-box"]') as
      | HTMLDivElement
      | undefined;
    expect(root).toHaveClass("root");
    expect(root?.style.flexDirection).toBe("column-reverse");
    expect(root?.style.flexWrap).toBe("wrap");
    expect(root?.style.justifyContent).toBe("space-between");
    expect(root?.style.alignItems).toBe("center");
    expect(root?.style.alignContent).toBe("space-around");
    expect(root?.style.gap).toBe("12px");
    expect(root?.style.rowGap).toBe("1rem");
    expect(root?.style.columnGap).toBe("8px");
    expect(element).toHaveAttribute("aria-label", "Layout group");
    expect(root).not.toHaveAttribute("aria-label");
  });

  it("keeps dt-grid responsive tokens and applies span attributes to slotted children", async () => {
    const element = document.createElement("dt-grid") as DtGridElement;
    element.columns = 1;
    element.tabletColumns = 2;
    element.desktopColumns = 3;
    element.wideColumns = 4;
    element.ultraColumns = 6;
    element.gap = "1.25rem";
    element.tabletGap = "2rem";
    element.desktopGap = "2.5rem";
    element.wideGap = "3rem";
    element.ultraGap = "4rem";
    element.rowGap = "0.5rem";
    element.colGap = "0.75rem";
    element.align = "start";
    element.justify = "center";

    const first = document.createElement("div");
    first.style.gridColumn = "2 / 4";
    first.setAttribute("span", "2");
    first.setAttribute("row-span", "3");
    const second = document.createElement("div");

    element.append(first, second);
    document.body.append(element);

    const root = element.shadowRoot?.querySelector('[part="root grid"]') as
      | HTMLDivElement
      | undefined;
    expect(root).toHaveClass("root", "responsive");
    expect(root.style.getPropertyValue("--grid-cols")).toBe(
      "repeat(1, minmax(0, 1fr))",
    );
    expect(root.style.getPropertyValue("--grid-cols-tablet")).toBe(
      "repeat(2, minmax(0, 1fr))",
    );
    expect(root.style.getPropertyValue("--grid-cols-desktop")).toBe(
      "repeat(3, minmax(0, 1fr))",
    );
    expect(root.style.getPropertyValue("--grid-cols-wide")).toBe(
      "repeat(4, minmax(0, 1fr))",
    );
    expect(root.style.getPropertyValue("--grid-cols-ultra")).toBe(
      "repeat(6, minmax(0, 1fr))",
    );
    expect(root.style.getPropertyValue("--grid-gap")).toBe("1.25rem");
    expect(root.style.getPropertyValue("--grid-gap-tablet")).toBe("2rem");
    expect(root.style.getPropertyValue("--grid-gap-desktop")).toBe("2.5rem");
    expect(root.style.getPropertyValue("--grid-gap-wide")).toBe("3rem");
    expect(root.style.getPropertyValue("--grid-gap-ultra")).toBe("4rem");
    expect(root.style.gridTemplateColumns).toBe("");
    expect(root.style.gap).toBe("");
    expect(root.style.rowGap).toBe("0.5rem");
    expect(root.style.columnGap).toBe("0.75rem");
    expect(root.style.alignItems).toBe("start");
    expect(root.style.justifyItems).toBe("center");
    expect(first.style.gridColumn).toBe("span 2");
    expect(first.style.gridRow).toBe("span 3");

    first.removeAttribute("span");
    first.removeAttribute("row-span");

    await waitFor(() => {
      expect(first.style.gridColumn).toBe("2 / 4");
      expect(first.style.gridRow).toBe("");
    });
  });
});
