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
}

/** Data cell (`<td>`); compose inside a `TableRow`. */
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

export default TableCell;
