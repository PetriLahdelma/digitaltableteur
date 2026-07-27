import React from "react";
import { cn } from "../../lib/cn";
import styles from "./Table.module.css";

export type TableSize = "sm" | "md" | "lg";
export type TableAlign = "start" | "center" | "end";
export type TableSortDirection = "ascending" | "descending" | "none";

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Accessible table name, rendered as a `<caption>`. */
  caption: string;
  /** Visually hide the caption while keeping the accessible name. */
  hideCaption?: boolean;
  /** Density scale. @default "md" */
  size?: TableSize;
  /** Alternating row surfaces. */
  striped?: boolean;
  /** Pin the header row while the table body scrolls. */
  stickyHeader?: boolean;
  /** Class applied to the scroll wrapper. */
  wrapperClassName?: string;
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
      wrapperClassName,
      className,
      children,
      ...rest
    },
    ref,
  ) => (
    <div className={cn(styles.wrapper, wrapperClassName)}>
      <table
        ref={ref}
        className={cn(
          styles.table,
          styles[size],
          striped && styles.striped,
          stickyHeader && styles.stickyHeader,
          className,
        )}
        {...rest}
      >
        <caption className={hideCaption ? styles.visuallyHidden : styles.caption}>
          {caption}
        </caption>
        {children}
      </table>
    </div>
  ),
);
Table.displayName = "Table";

export default Table;
