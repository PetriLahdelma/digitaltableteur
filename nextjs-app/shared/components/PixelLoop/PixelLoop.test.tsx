import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, it } from "vitest";
import { PixelLoop } from "./PixelLoop";
import styles from "./PixelLoop.module.css";

expect.extend(toHaveNoViolations);

const POOL_SIZE = 31;
// ceil(POOL_SIZE / cellCount) glyphs stacked per cell.
const SLOTS_BY_ROWS = { 1: 11, 2: 6, 3: 4 } as const;

describe("PixelLoop", () => {
  it("renders a six-cell field that distributes the pool", () => {
    const { container } = render(<PixelLoop />);
    const root = container.firstElementChild;
    const cells = container.querySelectorAll(`.${styles.loopCell}`);
    const glyphs = container.querySelectorAll("svg");

    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveAttribute("data-rows", "2");
    expect(root).toHaveAttribute("data-size", "md");
    expect(root).toHaveAttribute("data-variant", "dots");
    expect(root).toHaveAttribute("data-animated", "true");

    // Six cells, each cross-fading its own slice of the pool.
    expect(cells).toHaveLength(6);
    expect(glyphs).toHaveLength(6 * SLOTS_BY_ROWS[2]);
    expect(container.querySelectorAll("line")).toHaveLength(0);

    cells.forEach((cell) => {
      expect(cell).toHaveStyle({
        "--pixel-loop-cycle-count": String(SLOTS_BY_ROWS[2]),
      });
      expect(cell.querySelectorAll("svg")).toHaveLength(SLOTS_BY_ROWS[2]);
    });
    glyphs.forEach((glyph) => {
      expect(glyph).toHaveClass(styles.fadeGlyph);
      expect(glyph).toHaveAttribute("viewBox", "0 0 20 20");
      expect(glyph).toHaveAttribute("focusable", "false");
    });
  });

  it("distributes the pool with one row of three cells", () => {
    const { container } = render(<PixelLoop rows={1} />);
    const root = container.firstElementChild;

    expect(root).toHaveAttribute("data-rows", "1");
    expect(root).toHaveClass(styles.rows1);
    expect(container.querySelectorAll(`.${styles.row}`)).toHaveLength(1);
    expect(container.querySelectorAll(`.${styles.loopCell}`)).toHaveLength(3);
    expect(container.querySelectorAll("svg")).toHaveLength(3 * SLOTS_BY_ROWS[1]);
  });

  it("distributes the pool across three rows of three cells", () => {
    const { container } = render(<PixelLoop rows={3} />);
    const root = container.firstElementChild;

    expect(root).toHaveAttribute("data-rows", "3");
    expect(root).toHaveClass(styles.rows3);
    expect(container.querySelectorAll(`.${styles.row}`)).toHaveLength(3);
    expect(container.querySelectorAll(`.${styles.loopCell}`)).toHaveLength(9);
    expect(container.querySelectorAll("svg")).toHaveLength(9 * SLOTS_BY_ROWS[3]);
  });

  it("indexes each stacked glyph so the cross-fade can step through them", () => {
    const { container } = render(<PixelLoop rows={1} />);
    const firstCell = container.querySelector(`.${styles.loopCell}`);
    const glyphs = firstCell!.querySelectorAll("svg");

    expect(glyphs).toHaveLength(SLOTS_BY_ROWS[1]);
    glyphs.forEach((glyph, index) => {
      expect(glyph).toHaveStyle({ "--pixel-loop-cycle-index": String(index) });
    });
  });

  it("renders the alternate 45-degree vector stroke language", () => {
    const { container } = render(<PixelLoop variant="strokes" />);
    const root = container.firstElementChild;
    const strokes = container.querySelectorAll("line");

    expect(root).toHaveAttribute("data-variant", "strokes");
    expect(container.querySelectorAll("circle")).toHaveLength(0);
    expect(strokes.length).toBeGreaterThan(0);
    strokes.forEach((stroke) => {
      const x1 = Number(stroke.getAttribute("x1"));
      const x2 = Number(stroke.getAttribute("x2"));
      const y1 = Number(stroke.getAttribute("y1"));
      const y2 = Number(stroke.getAttribute("y2"));

      expect(Math.abs(x2 - x1)).toBe(Math.abs(y2 - y1));
      expect([2, 6, 10, 14, 18]).toContain((x1 + x2) / 2);
      expect([2, 6, 10, 14, 18]).toContain((y1 + y2) / 2);
      expect(stroke).toHaveAttribute("stroke-width", "1.5");
      expect(stroke).toHaveAttribute("stroke-linecap", "round");
    });
  });

  it("opens the first two cells with the D and T studio initials", () => {
    const { container } = render(<PixelLoop rows={1} />);
    const cells = container.querySelectorAll(`.${styles.loopCell}`);

    const firstGlyphCells = (cell: Element) =>
      new Set(
        [...cell.querySelector("svg")!.querySelectorAll("circle")].map(
          (dot) => `${dot.getAttribute("cx")},${dot.getAttribute("cy")}`,
        ),
      );

    // Cell 0 owns pool index 0 (D); cell 1 owns pool index 1 (T).
    const dCells = firstGlyphCells(cells[0]);
    ["2,2", "10,2", "2,10", "18,10", "2,18", "10,18"].forEach((cell) =>
      expect(dCells.has(cell)).toBe(true),
    );

    const tCells = firstGlyphCells(cells[1]);
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
    expect(glyphs).toHaveLength(POOL_SIZE);
    expect(root).toHaveStyle({ "--pixel-loop-cycle-count": String(POOL_SIZE) });
    glyphs.forEach((glyph, index) => {
      expect(glyph).toHaveClass(styles.fadeGlyph);
      expect(glyph).toHaveAttribute("viewBox", "0 0 20 20");
      expect(glyph).toHaveStyle({ "--pixel-loop-cycle-index": String(index) });
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
    expect(container.querySelectorAll("svg")).toHaveLength(6 * SLOTS_BY_ROWS[2]);
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
