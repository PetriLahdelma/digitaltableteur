import React from "react";
import type { TableAlign, TableSortDirection } from "../Table/Table";
export type { TableAlign, TableSortDirection };
export interface TableHeaderCellProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align" | "scope"> {
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
/**
 * Header cell (`<th>`). `scope="col"` (default) carries an optional three-state
 * sort control; `scope="row"` marks the identifying cell of a body row.
 */
export declare const TableHeaderCell: React.ForwardRefExoticComponent<TableHeaderCellProps & React.RefAttributes<HTMLTableCellElement>>;
export default TableHeaderCell;
//# sourceMappingURL=TableHeaderCell.d.ts.map