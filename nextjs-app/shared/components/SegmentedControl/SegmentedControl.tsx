"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";
import styles from "./SegmentedControl.module.css";

export const segmentedControlVariants = cva(styles.root, {
  variants: {
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
  },
  defaultVariants: { size: "md" },
});

export interface SegmentedControlItem {
  /** Stable value emitted on selection. */
  value: string;
  /** Visible segment label. */
  label: React.ReactNode;
  /** Disable this segment (skipped by keyboard navigation). */
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Segments to render, in order. */
  items: SegmentedControlItem[];
  /** Currently selected value (controlled). */
  value: string;
  /** Called with the new value when a segment is selected. */
  onValueChange: (value: string) => void;
  /** Size token. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Accessible name for the group (required; announced by screen readers). */
  ariaLabel: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Single-select segmented control: a compact row of mutually exclusive options,
 * one visibly selected. Implemented as a `radiogroup` with roving tabindex and
 * arrow-key navigation. For a non-exclusive row of actions use `ButtonGroup`.
 */
export const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ items, value, onValueChange, size = "md", ariaLabel, className }, ref) => {
    const segmentRefs = useRef<(HTMLButtonElement | null)[]>([]);
    // Sliding selection indicator, measured from the selected segment. Until
    // it is measured (server render, first paint) the selected segment paints
    // its own background, so the control never renders without a selection.
    const thumbRef = useRef<HTMLSpanElement>(null);
    // "placed" on the first measure, "moving" a frame later: the slide only
    // animates changes, never the first placement after hydration.
    const [thumbState, setThumbState] = useState<"placed" | "moving" | null>(null);

    const enabled = items.reduce<number[]>((acc, item, i) => {
      if (!item.disabled) acc.push(i);
      return acc;
    }, []);

    // Exactly one segment is tabbable (the selection, else the first enabled).
    const selectedIndex = items.findIndex((item) => item.value === value && !item.disabled);
    const tabbableIndex = selectedIndex >= 0 ? selectedIndex : (enabled[0] ?? -1);

    useLayoutEffect(() => {
      const index = items.findIndex((item) => item.value === value);
      const segment = segmentRefs.current[index];
      const thumb = thumbRef.current;
      if (!segment || !thumb) {
        setThumbState(null);
        return;
      }
      const measure = () => {
        thumb.style.setProperty("--thumb-x", `${segment.offsetLeft}px`);
        thumb.style.setProperty("--thumb-w", `${segment.offsetWidth}px`);
      };
      measure();
      setThumbState((current) => current ?? "placed");
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(measure);
      observer.observe(segment);
      return () => observer.disconnect();
    }, [items, value]);

    useLayoutEffect(() => {
      if (thumbState !== "placed") return;
      const frame = requestAnimationFrame(() => setThumbState("moving"));
      return () => cancelAnimationFrame(frame);
    }, [thumbState]);

    const select = (index: number) => {
      const item = items[index];
      if (!item || item.disabled) return;
      segmentRefs.current[index]?.focus();
      onValueChange(item.value);
    };

    const onKeyDown = (event: React.KeyboardEvent, index: number) => {
      const pos = enabled.indexOf(index);
      if (pos === -1) return;
      let next: number | undefined;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          next = enabled[(pos + 1) % enabled.length];
          break;
        case "ArrowLeft":
        case "ArrowUp":
          next = enabled[(pos - 1 + enabled.length) % enabled.length];
          break;
        case "Home":
          next = enabled[0];
          break;
        case "End":
          next = enabled[enabled.length - 1];
          break;
        default:
          return;
      }
      event.preventDefault();
      if (next !== undefined) select(next);
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn(segmentedControlVariants({ size }), className)}
        data-thumb={thumbState ?? undefined}
      >
        <span ref={thumbRef} aria-hidden="true" className={styles.thumb} />
        {items.map((item, i) => {
          const selected = item.value === value;
          return (
            <button
              key={item.value}
              ref={(el) => {
                segmentRefs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={item.disabled}
              tabIndex={i === tabbableIndex ? 0 : -1}
              data-selected={selected || undefined}
              className={styles.segment}
              onClick={() => !item.disabled && onValueChange(item.value)}
              onKeyDown={(event) => onKeyDown(event, i)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    );
  },
);

SegmentedControl.displayName = "SegmentedControl";

export default SegmentedControl;
