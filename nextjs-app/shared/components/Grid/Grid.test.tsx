import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Grid from "@dt/Grid";

describe("Grid", () => {
  it("renders children", () => {
    const { getByText } = render(
      <Grid>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>,
    );
    expect(getByText("Item 1")).toBeInTheDocument();
    expect(getByText("Item 2")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <Grid className="custom-class">
        <div>Item</div>
      </Grid>,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("keeps the legacy inline path when no responsive props are set", () => {
    const { container } = render(
      <Grid columns={3} gap="1rem">
        <div>Item</div>
      </Grid>,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
    expect(grid.style.gap).toBe("1rem");
    expect(grid.style.getPropertyValue("--grid-cols")).toBe("");
  });

  it("switches to custom-property resolution when responsive props are set", () => {
    const { container } = render(
      <Grid
        columns={1}
        tabletColumns={2}
        desktopColumns={3}
        gap="1.25rem"
        tabletGap="2rem"
        desktopGap="2.5rem"
      >
        <div>Item</div>
      </Grid>,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.getPropertyValue("--grid-cols")).toBe(
      "repeat(1, minmax(0, 1fr))",
    );
    expect(grid.style.getPropertyValue("--grid-cols-tablet")).toBe(
      "repeat(2, minmax(0, 1fr))",
    );
    expect(grid.style.getPropertyValue("--grid-cols-desktop")).toBe(
      "repeat(3, minmax(0, 1fr))",
    );
    expect(grid.style.getPropertyValue("--grid-gap")).toBe("1.25rem");
    expect(grid.style.getPropertyValue("--grid-gap-tablet")).toBe("2rem");
    expect(grid.style.getPropertyValue("--grid-gap-desktop")).toBe("2.5rem");
    // Inline template/gap must NOT be set — the module media queries own them.
    expect(grid.style.gridTemplateColumns).toBe("");
    expect(grid.style.gap).toBe("");
  });

  it("resolves the wide and ultra breakpoint rungs", () => {
    const { container } = render(
      <Grid
        columns={1}
        tabletColumns={2}
        desktopColumns={3}
        wideColumns={4}
        ultraColumns={6}
        wideGap="3rem"
        ultraGap="4rem"
      >
        <div>Item</div>
      </Grid>,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.getPropertyValue("--grid-cols-wide")).toBe(
      "repeat(4, minmax(0, 1fr))",
    );
    expect(grid.style.getPropertyValue("--grid-cols-ultra")).toBe(
      "repeat(6, minmax(0, 1fr))",
    );
    expect(grid.style.getPropertyValue("--grid-gap-wide")).toBe("3rem");
    expect(grid.style.getPropertyValue("--grid-gap-ultra")).toBe("4rem");
  });

  it("enters the responsive path when only a wide/ultra prop is set", () => {
    const { container } = render(
      <Grid columns={2} wideColumns={4}>
        <div>Item</div>
      </Grid>,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.getPropertyValue("--grid-cols")).toBe(
      "repeat(2, minmax(0, 1fr))",
    );
    expect(grid.style.getPropertyValue("--grid-cols-wide")).toBe(
      "repeat(4, minmax(0, 1fr))",
    );
    expect(grid.style.gridTemplateColumns).toBe("");
  });

  it("accepts template strings for responsive columns", () => {
    const { container } = render(
      <Grid columns="1fr" desktopColumns="200px 1fr">
        <div>Item</div>
      </Grid>,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.getPropertyValue("--grid-cols")).toBe("1fr");
    expect(grid.style.getPropertyValue("--grid-cols-desktop")).toBe(
      "200px 1fr",
    );
    expect(grid.style.getPropertyValue("--grid-cols-tablet")).toBe("");
  });
});
