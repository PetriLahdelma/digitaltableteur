import React from "react";
import { cn } from "../../lib/cn";
import type { TableAlign } from "../Table/Table";
import styles from "../Table/Table.module.css";

export type { TableAlign };

export interface TableCellProps
  extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  /** Cell content alignment. @default "start" */
  align?: TableAlign;
  /** Right-align and tabular-figure numeric values. */
  numeric?: boolean;
  /**
   * Column name shown before the value when the parent `Table` stacks rows
   * (`stackOnNarrow`). Hidden from assistive technology, which reads the
   * column header instead.
   */
  label?: string;
}

/** Data cell (`<td>`); compose inside a `TableRow`. */
export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  TableCellProps
>(({ align, numeric, label, className, ...rest }, ref) => (
  <td
    ref={ref}
    role="cell"
    className={cn(styles.cell, numeric && styles.numeric, className)}
    data-align={align ?? (numeric ? "end" : "start")}
    data-label={label}
    {...rest}
  />
));
TableCell.displayName = "TableCell";

export default TableCell;
