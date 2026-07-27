import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { PixelLoop } from "./PixelLoop";
import styles from "./PixelLoop.module.css";

expect.extend(toHaveNoViolations);

describe("PixelLoop", () => {
  it("renders six dot constellations led by the studio initials", () => {
    const { container } = render(<PixelLoop />);
    const root = container.firstElementChild;
    const glyphs = container.querySelectorAll("svg");

    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveAttribute("data-rows", "2");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveAttribute("data-variant", "dots");
    expect(root).toHaveAttribute("data-animated", "true");
    expect(glyphs).toHaveLength(6);
    const dots = container.querySelectorAll("circle");

    // Field leads with D (6 dots) and T (5 dots) followed by four constellations.
    expect(dots).toHaveLength(39);
    expect(container.querySelectorAll("line")).toHaveLength(0);
    dots.forEach((dot) => {
      expect([2, 6, 10, 14, 18]).toContain(Number(dot.getAttribute("cx")));
      expect([2, 6, 10, 14, 18]).toContain(Number(dot.getAttribute("cy")));
      expect(dot).toHaveAttribute("r", "1.25");
      expect(dot).not.toHaveAttribute("stroke");
    });
    glyphs.forEach((glyph) => {
      expect(glyph).toHaveAttribute("viewBox", "0 0 20 20");
      expect(glyph).toHaveAttribute("focusable", "false");
    });
  });

  it("renders the one-row animation with three 5x5 glyph grids", () => {
    const { container } = render(<PixelLoop rows={1} />);
    const root = container.firstElementChild;

    expect(root).toHaveAttribute("data-rows", "1");
    expect(root).toHaveClass(styles.rows1);
    expect(container.querySelectorAll(`.${styles.row}`)).toHaveLength(1);
    expect(container.querySelectorAll("svg")).toHaveLength(3);
    // D (6) + T (5) + first constellation (5).
    expect(container.querySelectorAll("circle")).toHaveLength(16);
  });

  it("renders the three-row animation with nine 5x5 glyph grids", () => {
    const { container } = render(<PixelLoop rows={3} />);
    const root = container.firstElementChild;
    const marks = container.querySelectorAll("circle");

    expect(root).toHaveAttribute("data-rows", "3");
    expect(root).toHaveClass(styles.rows3);
    expect(container.querySelectorAll(`.${styles.row}`)).toHaveLength(3);
    expect(container.querySelectorAll("svg")).toHaveLength(9);
    marks.forEach((dot) => {
      expect([2, 6, 10, 14, 18]).toContain(Number(dot.getAttribute("cx")));
      expect([2, 6, 10, 14, 18]).toContain(Number(dot.getAttribute("cy")));
    });
  });

  it("renders the alternate 45-degree vector stroke language", () => {
    const { container } = render(<PixelLoop variant="strokes" />);
    const root = container.firstElementChild;
    const strokes = container.querySelectorAll("line");

    expect(root).toHaveAttribute("data-variant", "strokes");
    expect(container.querySelectorAll("circle")).toHaveLength(0);
    expect(strokes).toHaveLength(39);
    strokes.forEach((stroke) => {
      const x1 = Number(stroke.getAttribute("x1"));
      const x2 = Number(stroke.getAttribute("x2"));
      const y1 = Number(stroke.getAttribute("y1"));
      const y2 = Number(stroke.getAttribute("y2"));
      const dx = x2 - x1;
      const dy = y2 - y1;

      expect(Math.abs(dx)).toBe(Math.abs(dy));
      expect([2, 6, 10, 14, 18]).toContain((x1 + x2) / 2);
      expect([2, 6, 10, 14, 18]).toContain((y1 + y2) / 2);
      expect(stroke).toHaveAttribute("stroke-width", "1.5");
      expect(stroke).toHaveAttribute("stroke-linecap", "round");
    });
  });

  it("includes the D and T initials as the first two glyphs in the pool", () => {
    const { container } = render(<PixelLoop rows={1} />);
    const glyphs = container.querySelectorAll("svg");

    const positions = (glyph: Element) =>
      new Set(
        [...glyph.querySelectorAll("circle")].map(
          (dot) => `${dot.getAttribute("cx")},${dot.getAttribute("cy")}`,
        ),
      );

    // D: left stem plus a top, bottom, and right-middle dot, spanning the grid.
    const dCells = positions(glyphs[0]);
    ["2,2", "10,2", "2,10", "18,10", "2,18", "10,18"].forEach((cell) =>
      expect(dCells.has(cell)).toBe(true),
    );

    // T: full top bar plus a centered stem, spanning the grid.
    const tCells = positions(glyphs[1]);
    ["2,2", "10,2", "18,2", "10,10", "10,18"].forEach((cell) =>
      expect(tCells.has(cell)).toBe(true),
    );
  });

  it("cycles the whole pool through one stacked cell in cycle mode", () => {
    const { container } = render(<PixelLoop cycle />);
    const root = container.firstElementChild;
    const glyphs = container.querySelectorAll("svg");

    expect(root).toHaveAttribute("data-cycle", "true");
    expect(root).not.toHaveAttribute("data-rows");
    expect(root).toHaveClass(styles.cycleRoot);
    // Every pool glyph is stacked in the single cell so it can step through them.
    expect(glyphs).toHaveLength(11);
    glyphs.forEach((glyph) => {
      expect(glyph).toHaveClass(styles.cycleGlyph);
      expect(glyph).toHaveAttribute("viewBox", "0 0 20 20");
    });
  });

  it("keeps the cycle cell out of the accessibility tree", async () => {
    const { container } = render(<PixelLoop cycle />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("can hold the first frame without removing the artwork", () => {
    const { container } = render(<PixelLoop animate={false} />);
    const root = container.firstElementChild;

    expect(root).toHaveAttribute("data-animated", "false");
    expect(root).toHaveClass(styles.paused);
    expect(container.querySelectorAll("svg")).toHaveLength(6);
  });

  it("applies the selected scale and forwards safe container props", () => {
    const { container } = render(
      <PixelLoop id="hero-loop" size="lg" className="composition-class" />,
    );
    const root = container.firstElementChild;

    expect(root).toHaveAttribute("id", "hero-loop");
    expect(root).toHaveAttribute("data-rows", "2");
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveClass(styles.lg, "composition-class");
  });

  it("keeps decorative output out of the accessibility tree", async () => {
    const { container } = render(<PixelLoop />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
