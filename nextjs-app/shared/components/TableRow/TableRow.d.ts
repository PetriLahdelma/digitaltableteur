import React from "react";
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    /** Renders the selected surface and sets `data-selected`. Visual only. */
    selected?: boolean;
}
/** Table row. Works inside `<thead>` and `<tbody>`; compose with a `Table` root. */
export declare const TableRow: React.ForwardRefExoticComponent<TableRowProps & React.RefAttributes<HTMLTableRowElement>>;
export default TableRow;
//# sourceMappingURL=TableRow.d.ts.map