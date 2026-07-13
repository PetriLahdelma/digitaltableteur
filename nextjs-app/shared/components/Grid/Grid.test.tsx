import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import Grid from "@dt/Grid";

const here = dirname(fileURLToPath(import.meta.url));

const normalizeCssValue = (value: string | undefined) =>
  value
    ?.replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();

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

  it("locks responsive breakpoints and sparse-rung CSS fallbacks", () => {
    const css = postcss.parse(
      readFileSync(join(here, "Grid.module.css"), "utf8"),
    );
    const expected = [
      {
        query: "(width >= 768px)",
        columns: "var(--grid-cols-tablet, var(--grid-cols))",
        gap: "var(--grid-gap-tablet, var(--grid-gap))",
      },
      {
        query: "(width >= 1024px)",
        columns:
          "var(--grid-cols-desktop, var(--grid-cols-tablet, var(--grid-cols)))",
        gap: "var(--grid-gap-desktop, var(--grid-gap-tablet, var(--grid-gap)))",
      },
      {
        query: "(width >= 1440px)",
        columns:
          "var(--grid-cols-wide, var(--grid-cols-desktop, var(--grid-cols-tablet, var(--grid-cols))))",
        gap: "var(--grid-gap-wide, var(--grid-gap-desktop, var(--grid-gap-tablet, var(--grid-gap))))",
      },
      {
        query: "(width >= 1920px)",
        columns:
          "var(--grid-cols-ultra, var(--grid-cols-wide, var(--grid-cols-desktop, var(--grid-cols-tablet, var(--grid-cols)))))",
        gap: "var(--grid-gap-ultra, var(--grid-gap-wide, var(--grid-gap-desktop, var(--grid-gap-tablet, var(--grid-gap)))))",
      },
    ];

    const mediaQueries = css.nodes.filter(
      (node) =>
        node.type === "atrule" &&
        node.name === "media" &&
        node.nodes?.some(
          (child) => child.type === "rule" && child.selector === ".responsive",
        ),
    );
    expect(mediaQueries.map((query) => query.params)).toEqual(
      expected.map(({ query }) => query),
    );

    for (const expectedRung of expected) {
      const media = mediaQueries.find(
        (query) => query.params === expectedRung.query,
      );
      const responsiveRule = media?.nodes?.find(
        (node) => node.type === "rule" && node.selector === ".responsive",
      );
      const declarations = Object.fromEntries(
        (responsiveRule?.nodes ?? [])
          .filter((node) => node.type === "decl")
          .map((declaration) => [declaration.prop, declaration.value]),
      );

      expect(normalizeCssValue(declarations["grid-template-columns"])).toBe(
        expectedRung.columns,
      );
      expect(normalizeCssValue(declarations.gap)).toBe(expectedRung.gap);
    }
  });
});
