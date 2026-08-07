import React from "react";
import type { TableAlign } from "../Table/Table";
export type { TableAlign };
export interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> {
    /** Cell content alignment. @default "start" */
    align?: TableAlign;
    /** Right-align and tabular-figure numeric values. */
    numeric?: boolean;
}
/** Data cell (`<td>`); compose inside a `TableRow`. */
export declare const TableCell: React.ForwardRefExoticComponent<TableCellProps & React.RefAttributes<HTMLTableCellElement>>;
export default TableCell;
//# sourceMappingURL=TableCell.d.ts.map