import React from "react";
import { cn } from "../../lib/cn";
import Icon from "../Icon/Icon";
import type { TableAlign, TableSortDirection } from "../Table/Table";
import styles from "../Table/Table.module.css";

export type { TableAlign, TableSortDirection };

export interface TableHeaderCellProps
  extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align" | "scope"> {
  /** Cell content alignment. @default "start" */
  align?: TableAlign;
  /**
   * Header scope. `col` (default) labels a column; `row` makes the cell the
   * accessible name for its row — use it on the identifying cell of each body
   * row so screen readers announce the row context with every other cell.
   * @default "col"
   */
  scope?: "col" | "row";
  /** Renders the sort affordance and toggles on click. Only for column headers. */
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

/**
 * Header cell (`<th>`). `scope="col"` (default) carries an optional three-state
 * sort control; `scope="row"` marks the identifying cell of a body row.
 */
export const TableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  TableHeaderCellProps
>(
  (
    {
      align = "start",
      scope = "col",
      sortable,
      sortDirection = "none",
      onSort,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    const isColumn = scope === "col";
    const active = isColumn && sortDirection !== "none";
    return (
      <th
        ref={ref}
        scope={scope}
        className={cn(styles.headerCell, className)}
        data-align={align}
        aria-sort={active ? sortDirection : undefined}
        {...rest}
      >
        {isColumn && sortable ? (
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

export default TableHeaderCell;
