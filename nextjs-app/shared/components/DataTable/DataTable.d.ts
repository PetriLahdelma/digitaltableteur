import React from "react";
import { type TableSort } from "../../hooks/useTableSortable";
export type DataTableSortDirection = "ascending" | "descending";
export type DataTableSort = TableSort;
export type DataTableColumn<Row> = {
    /** Stable column identifier used by sorting and React keys. */
    id: string;
    /** Visible column heading. */
    header: React.ReactNode;
    /** Reads the comparable/display value when `cell` is not supplied. */
    accessor?: (row: Row) => React.ReactNode;
    /** Custom cell renderer. */
    cell?: (row: Row) => React.ReactNode;
    /** Comparable sort value; falls back to `accessor`. Use when `cell` renders
     * custom markup but the column still needs a sortable value. */
    sortValue?: (row: Row) => string | number | null | undefined;
    /** Enables the three-state ascending/descending/unsorted cycle. */
    sortable?: boolean;
    /** Marks this column as the row header (`<th scope="row">`) so screen readers
     * announce it as the row's context with every other cell. Use one per table. */
    rowHeader?: boolean;
    /** Cell alignment. @default "start" */
    align?: "start" | "center" | "end";
    /** Right-align with tabular figures for numeric columns. */
    numeric?: boolean;
};
export interface DataTableProps<Row> {
    /** Table rows. */
    data: Row[];
    /** Ordered column definitions. */
    columns: DataTableColumn<Row>[];
    /** Stable row identifier. */
    getRowId: (row: Row) => string;
    /** Accessible table name rendered as a caption. */
    caption: string;
    /** Visually hides the caption while retaining the accessible name. */
    hideCaption?: boolean;
    /** Controlled sort state. */
    sort?: DataTableSort | null;
    /** Initial uncontrolled sort state. */
    defaultSort?: DataTableSort | null;
    /** Receives sort changes. */
    onSortChange?: (sort: DataTableSort | null) => void;
    /** Controlled selected row identifiers; enables selection. */
    selectedRowIds?: string[];
    /** Initial uncontrolled selection; also enables selection. */
    defaultSelectedRowIds?: string[];
    /** Receives selected row identifiers; also enables selection. */
    onSelectionChange?: (rowIds: string[]) => void;
    /** Accessible row label used by selection checkboxes. */
    getRowLabel?: (row: Row) => string;
    /** Rows per page; enables pagination when set. */
    pageSize?: number;
    /** Empty-state cell content. */
    emptyState?: React.ReactNode;
    /** Alternating row surfaces. */
    striped?: boolean;
    /** Pin the header row while the body scrolls. */
    stickyHeader?: boolean;
    /** Density scale. @default "md" */
    size?: "sm" | "md" | "lg";
    className?: string;
}
/**
 * Accessible data table: typed columns with three-state sorting, optional row
 * selection and pagination, and density variants. Composes the `Table`
 * primitives and the `useTable*` hooks.
 */
export declare function DataTable<Row>({ data, columns, getRowId, caption, hideCaption, sort, defaultSort, onSortChange, selectedRowIds, defaultSelectedRowIds, onSelectionChange, getRowLabel, pageSize, emptyState, striped, stickyHeader, size, className, }: DataTableProps<Row>): React.JSX.Element;
export declare namespace DataTable {
    var displayName: string;
}
export default DataTable;
//# sourceMappingURL=DataTable.d.ts.map