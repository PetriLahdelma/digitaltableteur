import React from "react";
import { cn } from "../../lib/cn";
// Shared across the Table family: striping, hover, selection tint, and the
// last-row border are cross-cutting selectors that live in one stylesheet.
import styles from "../Table/Table.module.css";

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Renders the selected surface and sets `data-selected`. Visual only. */
  selected?: boolean;
}

/** Table row. Works inside `<thead>` and `<tbody>`; compose with a `Table` root. */
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

export default TableRow;
