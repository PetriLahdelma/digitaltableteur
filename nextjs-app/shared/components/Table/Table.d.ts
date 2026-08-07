import React from "react";
export type TableSize = "sm" | "md" | "lg";
export type TableAlign = "start" | "center" | "end";
export type TableSortDirection = "ascending" | "descending" | "none";
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
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
export declare const Table: React.ForwardRefExoticComponent<TableProps & React.RefAttributes<HTMLTableElement>>;
export default Table;
//# sourceMappingURL=Table.d.ts.map