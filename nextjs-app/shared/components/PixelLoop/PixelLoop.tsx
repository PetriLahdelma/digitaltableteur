import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./PixelLoop.module.css";

const CELL_SIZE = 4;
const CELL_CENTER = CELL_SIZE / 2;

/**
 * Each glyph is a 5x5 grid of on (`#`) / off (`.`) cells. These are geometry
 * definitions only — they are rendered as vector SVG marks (`<circle>` dots or
 * `<line>` strokes), never as raster images.
 */
const GLYPH_GRIDS = [
  // Studio initials, spanning the full 5x5 grid like every other glyph.
  ["#.#..", ".....", "#...#", ".....", "#.#.."],
  ["#.#.#", ".....", "..#..", ".....", "..#.."],
  ["#....", ".#...", "..#..", "...#.", "....#"],
  ["....#", "...#.", "..#..", ".#...", "#...."],
  ["..#..", "..#..", "#####", "..#..", "..#.."],
  ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
  ["#....", "....#", "..#..", "#....", "....#"],
  ["#####", ".....", "..#..", ".....", "#####"],
  [".###.", "#...#", "#...#", "#...#", ".###."],
  ["#.#.#", ".....", ".#.#.", ".....", "#.#.#"],
  ["#.#.#", ".#.#.", "#.#.#", ".#.#.", "#.#.#"],
  // Additional decorative constellations to widen the pool.
  ["..#..", ".###.", "##.##", "##.##", "....."],
  [".#...", "##.#.", "..##.", "##.#.", ".#..."],
  ["#...#", "..#..", ".#.#.", "..#..", "#####"],
  [".#.#.", "#.#.#", "#.#.#", "..#..", ".###."],
  ["..#..", "#...#", "#...#", "#...#", "##.##"],
  [".##..", "#.#.#", "#...#", "#.#.#", "..##."],
  [".####", "#..#.", ".....", ".#..#", "####."],
  [".#.#.", ".#.#.", "##.##", ".#.#.", ".#.#."],
  [".###.", "..#..", "#...#", "..#..", ".###."],
  ["..#..", ".####", "#...#", "####.", "..#.."],
  ["#...#", "#...#", ".#.#.", "#...#", "#...#"],
  [".#..#", "...#.", ".#...", "...#.", ".#..#"],
  ["#.#.#", "#...#", ".#.#.", "#...#", "#.#.#"],
  ["..##.", "....#", "#..##", "....#", "..##."],
  [".###.", "#.###", ".....", "###.#", ".###."],
  ["#..##", "..##.", "#.#.#", ".##..", "##..#"],
  ["....#", "##.#.", "#.#..", "##.#.", "....#"],
  ["..#..", "..##.", "##.##", ".##..", "..#.."],
  ["#....", ".#..#", "##..#", ".#..#", "#...."],
  ["###..", "...##", "#.#.#", "...##", "###.."],
] as const;

function getActiveCells(grid: readonly string[]) {
  return grid.flatMap((row, rowIndex) =>
    [...row].flatMap((cell, columnIndex) =>
      cell === "#"
        ? [
            {
              x: columnIndex * CELL_SIZE + CELL_CENTER,
              y: rowIndex * CELL_SIZE + CELL_CENTER,
            },
          ]
        : [],
    ),
  );
}

function renderMark(x: number, y: number, variant: PixelLoopVariant) {
  return variant === "dots" ? (
    <circle key={`${x}-${y}`} cx={x} cy={y} r="1.25" />
  ) : (
    <line
      key={`${x}-${y}`}
      x1={x - 1}
      y1={y + 1}
      x2={x + 1}
      y2={y - 1}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  );
}

/**
 * Stacks a list of grids in one cell and cross-fades one at a time. `phase` is a
 * sub-step time offset (0..1) so sibling cells swap in a wave rather than at
 * once. The number of grids sets the cell's `--pixel-loop-cycle-count`.
 */
function renderFadeGlyphs(
  grids: readonly (readonly string[])[],
  variant: PixelLoopVariant,
  phase = 0,
) {
  return grids.map((grid, position) => (
    <svg
      key={position}
      className={styles.fadeGlyph}
      viewBox="0 0 20 20"
      focusable="false"
      style={
        { "--pixel-loop-cycle-index": position + phase } as React.CSSProperties
      }
    >
      {getActiveCells(grid).map(({ x, y }) => renderMark(x, y, variant))}
    </svg>
  ));
}

export type PixelLoopSize = "sm" | "md" | "lg";
export type PixelLoopVariant = "dots" | "strokes";
export type PixelLoopRows = 1 | 2 | 3;

export interface PixelLoopProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Scales the glyphs and the equal space between them. @default "md" */
  size?: PixelLoopSize;
  /** Rounded dots or short, round-capped 45-degree strokes. @default "dots" */
  variant?: PixelLoopVariant;
  /** Number of three-cell rows in the field. @default 2 */
  rows?: PixelLoopRows;
  /** Runs the cross-fade cycle. Disable for a deliberate static composition. @default true */
  animate?: boolean;
  /**
   * Renders a single glyph cell (one row, one column) that steps through the
   * whole glyph pool one formation at a time. Ignores `rows`. @default false
   */
  cycle?: boolean;
}

/**
 * Decorative constellation loop for expressive editorial compositions. Every
 * cell continuously cross-fades through the whole glyph pool, so all variants
 * appear over time.
 *
 * The graphic inherits its foreground color and becomes static when the user
 * requests reduced motion.
 */
export const PixelLoop = React.forwardRef<HTMLDivElement, PixelLoopProps>(
  (
    {
      animate = true,
      className,
      cycle = false,
      rows = 2,
      size = "md",
      variant = "dots",
      ...rest
    },
    ref,
  ) => {
    const poolCount = GLYPH_GRIDS.length;

    if (cycle) {
      return (
        <div
          {...rest}
          ref={ref}
          className={cn(
            styles.root,
            styles[size],
            styles.cycleRoot,
            !animate && styles.paused,
            className,
          )}
          aria-hidden="true"
          data-animated={animate}
          data-cycle="true"
          data-size={size}
          data-variant={variant}
          style={{ "--pixel-loop-cycle-count": poolCount } as React.CSSProperties}
        >
          {renderFadeGlyphs(GLYPH_GRIDS, variant)}
        </div>
      );
    }

    const cellCount = rows * 3;
    // Each cell owns a distinct slice of the pool (indices i where i % cellCount
    // === cellIndex), padded to a common length so every cell shares one
    // cross-fade cadence. The whole pool is covered across the cells.
    const slotCount = Math.ceil(poolCount / cellCount);
    const cells = Array.from({ length: cellCount }, (_, cellIndex) => {
      const slice = GLYPH_GRIDS.filter((_, i) => i % cellCount === cellIndex);
      const grids = Array.from(
        { length: slotCount },
        (_, slot) => slice[slot % slice.length],
      );
      return { cellIndex, grids };
    });
    const rowGroups = Array.from({ length: rows }, (_, rowIndex) =>
      cells.slice(rowIndex * 3, rowIndex * 3 + 3),
    );

    return (
      <div
        {...rest}
        ref={ref}
        className={cn(
          styles.root,
          styles[size],
          styles[`rows${rows}`],
          !animate && styles.paused,
          className,
        )}
        aria-hidden="true"
        data-animated={animate}
        data-rows={rows}
        data-size={size}
        data-variant={variant}
      >
        {rowGroups.map((groupCells, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(styles.row, styles[`row${rowIndex + 1}`])}
          >
            {groupCells.map((cell) => (
              <div
                key={cell.cellIndex}
                className={styles.loopCell}
                style={
                  { "--pixel-loop-cycle-count": slotCount } as React.CSSProperties
                }
              >
                {renderFadeGlyphs(
                  cell.grids,
                  variant,
                  cell.cellIndex / cellCount,
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
);

PixelLoop.displayName = "PixelLoop";
