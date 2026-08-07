import type { TableSortDirection } from "../components/Table";
export type TableSortDirectionActive = "ascending" | "descending";
export type TableSort = {
    columnId: string;
    direction: TableSortDirectionActive;
};
export interface UseTableSortableOptions<Row> {
    /** Rows to sort. */
    rows: Row[];
    /** Comparable value for a row in a given column (string/number). */
    getSortValue: (row: Row, columnId: string) => unknown;
    /** Controlled sort state. */
    sort?: TableSort | null;
    /** Initial uncontrolled sort. */
    defaultSort?: TableSort | null;
    /** Receives every sort change. */
    onSortChange?: (sort: TableSort | null) => void;
}
export interface UseTableSortableResult<Row> {
    /** Current sort, or null when unsorted. */
    sort: TableSort | null;
    /** Rows in current sort order (stable original order when unsorted). */
    sortedRows: Row[];
    /** Advance a column through ascending → descending → unsorted. */
    toggleSort: (columnId: string) => void;
    /** Sort state for a column, for `aria-sort` / the caret icon. */
    getColumnSort: (columnId: string) => TableSortDirection;
}
/**
 * Headless three-state column sorting. Manages the asc → desc → unsorted cycle
 * (controlled or uncontrolled) and returns the sorted rows plus per-column
 * state for `aria-sort` and the sort caret.
 */
export declare function useTableSortable<Row>({ rows, getSortValue, sort: controlledSort, defaultSort, onSortChange, }: UseTableSortableOptions<Row>): UseTableSortableResult<Row>;
export default useTableSortable;
//# sourceMappingURL=useTableSortable.d.ts.map