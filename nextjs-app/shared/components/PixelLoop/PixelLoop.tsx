import * as React from "react";
import { cn } from "../../lib/cn";
import styles from "./PixelLoop.module.css";

const CELL_SIZE = 4;
const CELL_CENTER = CELL_SIZE / 2;

const GLYPH_BITMAPS = [
  ["#....", ".#...", "..#..", "...#.", "....#"],
  ["....#", "...#.", "..#..", ".#...", "#...."],
  ["..#..", "..#..", "#####", "..#..", "..#.."],
  ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
  ["#....", "....#", "..#..", "#....", "....#"],
  ["#####", ".....", "..#..", ".....", "#####"],
  [".###.", "#...#", "#...#", "#...#", ".###."],
  ["#.#.#", ".....", ".#.#.", ".....", "#.#.#"],
  ["#.#.#", ".#.#.", "#.#.#", ".#.#.", "#.#.#"],
] as const;

function getActiveCells(bitmap: readonly string[]) {
  return bitmap.flatMap((row, rowIndex) =>
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
  /** Number of three-glyph rows in the animated field. @default 2 */
  rows?: PixelLoopRows;
  /** Runs the six-frame loop. Disable for a deliberate static composition. @default true */
  animate?: boolean;
}

/**
 * Decorative six-frame constellation loop for expressive editorial compositions.
 *
 * The graphic inherits its foreground color and becomes static when the user
 * requests reduced motion.
 */
export const PixelLoop = React.forwardRef<HTMLDivElement, PixelLoopProps>(
  (
    {
      animate = true,
      className,
      rows = 2,
      size = "md",
      variant = "dots",
      ...rest
    },
    ref,
  ) => {
    const visibleBitmaps = GLYPH_BITMAPS.slice(0, rows * 3);
    const rowGroups = Array.from({ length: rows }, (_, rowIndex) =>
      visibleBitmaps.slice(rowIndex * 3, rowIndex * 3 + 3),
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
        {rowGroups.map((bitmaps, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(styles.row, styles[`row${rowIndex + 1}`])}
          >
            {bitmaps.map((bitmap, columnIndex) => {
              const glyphIndex = rowIndex * 3 + columnIndex;
              const animationClass =
                rows === 2
                  ? styles[`glyph${glyphIndex + 1}`]
                  : styles[`rowGlyph${columnIndex + 1}`];

              return (
                <svg
                  key={glyphIndex}
                  className={cn(styles.glyph, animationClass)}
                  viewBox="0 0 20 20"
                  focusable="false"
                >
                  {getActiveCells(bitmap).map(({ x, y }) =>
                    variant === "dots" ? (
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
                    ),
                  )}
                </svg>
              );
            })}
          </div>
        ))}
      </div>
    );
  },
);

PixelLoop.displayName = "PixelLoop";
