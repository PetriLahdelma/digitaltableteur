"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import styles from "./Table.module.css";

export type TableSize = "sm" | "md" | "lg";
export type TableAlign = "start" | "center" | "end";
export type TableSortDirection = "ascending" | "descending" | "none";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /**
   * Accessible table name, rendered as a `<caption>`. Optional only when the
   * table is named another way: `aria-labelledby` pointing at a visible
   * heading, or `aria-label`. A table needs a name either way.
   */
  caption?: string;
  /** Visually hide the caption while keeping the accessible name. */
  hideCaption?: boolean;
  /** Density scale. @default "md" */
  size?: TableSize;
  /** Alternating row surfaces. */
  striped?: boolean;
  /** Pin the header row while the table body scrolls. */
  stickyHeader?: boolean;
  /**
   * Below a 40rem container width, stack each body row as a block instead of
   * squeezing columns, with every cell prefixed by its `TableCell` `label`.
   * Adds explicit table roles so assistive technology keeps the table
   * semantics that a CSS `display` change drops in some browsers. Give
   * `<thead>`/`<tbody>` `role="rowgroup"` for the same reason.
   */
  stackOnNarrow?: boolean;
  /** Class applied to the scroll wrapper. */
  wrapperClassName?: string;
}

/**
 * True while the wrapper is narrower than its table. A horizontally scrolling
 * wrapper with nothing focusable inside cannot be scrolled from the keyboard
 * (axe scrollable-region-focusable, WCAG 2.1.1), so it becomes a labelled,
 * focusable region only then; a table that fits gets no extra tab stop.
 */
function useOverflowsInline(ref: React.RefObject<HTMLDivElement | null>) {
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () =>
      setOverflows(element.scrollWidth > element.clientWidth + 1);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, [ref]);
  return overflows;
}

/**
 * Composable table root: a scroll wrapper around a semantic `<table>`. Compose
 * with native `<thead>`/`<tbody>` plus the sibling `TableRow`,
 * `TableHeaderCell`, and `TableCell` components. Presentational only — sorting
 * and selection logic live in the `useTable*` hooks and `DataTable`.
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      caption,
      hideCaption = false,
      size = "md",
      striped = false,
      stickyHeader = false,
      stackOnNarrow = false,
      wrapperClassName,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const captionId = useId();
    const scrolls = useOverflowsInline(wrapperRef);
    const labelledBy = rest["aria-labelledby"];
    const label = rest["aria-label"];
    const hasCaption = Boolean(caption);
    if (
      process.env.NODE_ENV !== "production" &&
      !hasCaption &&
      !labelledBy &&
      !label
    ) {
      console.warn(
        "[Table] A table needs an accessible name: pass caption, aria-labelledby or aria-label.",
      );
    }
    // The scroll region takes the same name as the table.
    const regionName = hasCaption
      ? { "aria-labelledby": captionId }
      : labelledBy
        ? { "aria-labelledby": labelledBy }
        : { "aria-label": label };
    return (
      <div
        ref={wrapperRef}
        className={cn(
          styles.wrapper,
          stackOnNarrow && styles.stackContainer,
          wrapperClassName,
        )}
        {...(scrolls
          ? { tabIndex: 0, role: "region", ...regionName }
          : {})}
      >
        <table
          ref={ref}
          role={stackOnNarrow ? "table" : undefined}
          className={cn(
            styles.table,
            styles[size],
            striped && styles.striped,
            stickyHeader && styles.stickyHeader,
            stackOnNarrow && styles.stacked,
            className,
          )}
          {...rest}
        >
          {hasCaption ? (
            <caption
              id={captionId}
              className={hideCaption ? styles.visuallyHidden : styles.caption}
            >
              {caption}
            </caption>
          ) : null}
          {children}
        </table>
      </div>
    );
  },
);
Table.displayName = "Table";

export default Table;
