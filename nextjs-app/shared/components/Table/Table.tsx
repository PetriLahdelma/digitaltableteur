import React from "react";
import { cn } from "../../lib/cn";
import Icon from "../Icon/Icon";
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
 * with native `<thead>`/`<tbody>` plus `TableRow`, `TableHeaderCell`, and
 * `TableCell`. Presentational only — sorting/selection logic lives in the
 * `useTable*` hooks and `DataTable`.
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

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Renders the selected surface and sets `data-selected`. Visual only. */
  selected?: boolean;
}

/** Table row. Works inside `<thead>` and `<tbody>`. */
export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ selected, className, ...rest }, ref) => (
    <tr
      ref={ref}
      className={cn(styles.row, className)}
      data-selected={selected || undefined}
      {...rest}
    />
  ),
);
TableRow.displayName = "TableRow";

export interface TableHeaderCellProps
  extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  /** Cell content alignment. @default "start" */
  align?: TableAlign;
  /** Renders the sort affordance and toggles on click. */
  sortable?: boolean;
  /** Current sort state; drives `aria-sort` and the caret icon. @default "none" */
  sortDirection?: TableSortDirection;
  /** Called when a sortable header is activated. */
  onSort?: () => void;
}

const SORT_ICON: Record<TableSortDirection, string> = {
  none: "caret-up-down",
  ascending: "caret-up",
  descending: "caret-down",
};

/** Header cell (`<th scope="col">`) with an optional three-state sort control. */
export const TableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  TableHeaderCellProps
>(
  (
    { align = "start", sortable, sortDirection = "none", onSort, className, children, ...rest },
    ref,
  ) => {
    const active = sortDirection !== "none";
    return (
      <th
        ref={ref}
        scope="col"
        className={cn(styles.headerCell, className)}
        data-align={align}
        aria-sort={active ? sortDirection : undefined}
        {...rest}
      >
        {sortable ? (
          <button type="button" className={styles.sortButton} onClick={onSort}>
            <span>{children}</span>
            <Icon
              name={SORT_ICON[sortDirection]}
              size="sm"
              className={cn(styles.sortIcon, active && styles.sortIconActive)}
            />
          </button>
        ) : (
          children
        )}
      </th>
    );
  },
);
TableHeaderCell.displayName = "TableHeaderCell";

export interface TableCellProps
  extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  /** Cell content alignment. @default "start" */
  align?: TableAlign;
  /** Right-align and tabular-figure numeric values. */
  numeric?: boolean;
}

/** Data cell (`<td>`). */
export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  TableCellProps
>(({ align, numeric, className, ...rest }, ref) => (
  <td
    ref={ref}
    className={cn(styles.cell, numeric && styles.numeric, className)}
    data-align={align ?? (numeric ? "end" : "start")}
    {...rest}
  />
));
TableCell.displayName = "TableCell";

export default Table;
