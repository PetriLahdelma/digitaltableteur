"use client";

import React, { useMemo, useRef, useState } from "react";
import styles from "./ResizablePanelGroup.module.css";

export type ResizablePanel = {
  /** Stable panel identifier. */
  id: string;
  /** Accessible region name. */
  ariaLabel: string;
  /** Panel content. */
  content: React.ReactNode;
  /** Initial percentage. Defaults to an equal share. */
  initialSize?: number;
  /** Minimum percentage. @default 10 */
  minSize?: number;
};

export interface ResizablePanelGroupProps {
  /** Two or more ordered panels. */
  panels: ResizablePanel[];
  /** Resize axis. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Keyboard resize increment in percentage points. @default 5 */
  keyboardStep?: number;
  /** Receives the current percentage per panel id. */
  onSizesChange?: (sizes: Record<string, number>) => void;
  className?: string;
}

function initialPanelSizes(panels: ResizablePanel[]): number[] {
  const specified = panels.map((panel) => panel.initialSize);
  if (specified.every((value) => typeof value === "number")) {
    const total = specified.reduce((sum, value) => sum + (value ?? 0), 0);
    if (total > 0) {
      return specified.map((value) => ((value ?? 0) / total) * 100);
    }
  }
  return panels.map(() => 100 / panels.length);
}

function resizePair(
  sizes: number[],
  panels: ResizablePanel[],
  index: number,
  delta: number,
): number[] {
  const leftMin = panels[index]?.minSize ?? 10;
  const rightMin = panels[index + 1]?.minSize ?? 10;
  const pairTotal = sizes[index] + sizes[index + 1];
  const nextLeft = Math.min(
    pairTotal - rightMin,
    Math.max(leftMin, sizes[index] + delta),
  );
  const next = [...sizes];
  next[index] = nextLeft;
  next[index + 1] = pairTotal - nextLeft;
  return next;
}

/** Two-or-more-panel layout with pointer and keyboard-accessible separators. */
export function ResizablePanelGroup({
  panels,
  orientation = "horizontal",
  keyboardStep = 5,
  onSizesChange,
  className,
}: ResizablePanelGroupProps) {
  const [sizes, setSizes] = useState(() => initialPanelSizes(panels));
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    index: number;
    startCoordinate: number;
    startSizes: number[];
  } | null>(null);
  const sizeRecord = useMemo(
    () =>
      Object.fromEntries(
        panels.map((panel, index) => [panel.id, sizes[index] ?? 0]),
      ),
    [panels, sizes],
  );

  const updateSizes = (next: number[]) => {
    setSizes(next);
    onSizesChange?.(
      Object.fromEntries(
        panels.map((panel, index) => [panel.id, next[index] ?? 0]),
      ),
    );
  };

  const coordinate = (event: React.PointerEvent) =>
    orientation === "horizontal" ? event.clientX : event.clientY;

  const startDrag = (event: React.PointerEvent, index: number) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      index,
      startCoordinate: coordinate(event),
      startSizes: sizes,
    };
  };

  const moveDrag = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    const root = rootRef.current;
    if (!drag || !root) return;
    const rootSize =
      orientation === "horizontal"
        ? root.getBoundingClientRect().width
        : root.getBoundingClientRect().height;
    if (rootSize <= 0) return;
    const delta = ((coordinate(event) - drag.startCoordinate) / rootSize) * 100;
    updateSizes(resizePair(drag.startSizes, panels, drag.index, delta));
  };

  const stopDrag = (event: React.PointerEvent) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  const resizeWithKeyboard = (event: React.KeyboardEvent, index: number) => {
    const decreaseKeys =
      orientation === "horizontal" ? ["ArrowLeft"] : ["ArrowUp"];
    const increaseKeys =
      orientation === "horizontal" ? ["ArrowRight"] : ["ArrowDown"];
    if (
      !decreaseKeys.includes(event.key) &&
      !increaseKeys.includes(event.key) &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }
    event.preventDefault();
    const current = sizes[index];
    const leftMin = panels[index]?.minSize ?? 10;
    const rightMin = panels[index + 1]?.minSize ?? 10;
    const pairTotal = sizes[index] + sizes[index + 1];
    const delta = decreaseKeys.includes(event.key)
      ? -keyboardStep
      : increaseKeys.includes(event.key)
        ? keyboardStep
        : event.key === "Home"
          ? leftMin - current
          : pairTotal - rightMin - current;
    updateSizes(resizePair(sizes, panels, index, delta));
  };

  if (panels.length < 2) return null;

  return (
    <div
      ref={rootRef}
      className={[styles.group, styles[orientation], className]
        .filter(Boolean)
        .join(" ")}
      data-orientation={orientation}
    >
      {panels.map((panel, index) => (
        <React.Fragment key={panel.id}>
          <section
            className={styles.panel}
            aria-label={panel.ariaLabel}
            style={{ flexBasis: `${sizeRecord[panel.id]}%` }}
          >
            {panel.content}
          </section>
          {index < panels.length - 1 ? (
            <div
              className={styles.separator}
              role="separator"
              tabIndex={0}
              aria-label={`Resize ${panel.ariaLabel}`}
              aria-orientation={orientation}
              aria-valuemin={panel.minSize ?? 10}
              aria-valuemax={
                sizes[index] +
                sizes[index + 1] -
                (panels[index + 1]?.minSize ?? 10)
              }
              aria-valuenow={Math.round(sizes[index])}
              onKeyDown={(event) => resizeWithKeyboard(event, index)}
              onPointerDown={(event) => startDrag(event, index)}
              onPointerMove={moveDrag}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
            >
              <span className={styles.handle} aria-hidden="true" />
            </div>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
}

ResizablePanelGroup.displayName = "ResizablePanelGroup";

export default ResizablePanelGroup;
