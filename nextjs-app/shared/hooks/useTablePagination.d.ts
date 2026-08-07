export interface UseTablePaginationOptions<Row> {
    /** Rows to paginate (already sorted/filtered). */
    rows: Row[];
    /** Rows per page. @default 10 */
    pageSize?: number;
    /** Controlled current page (0-based). */
    page?: number;
    /** Initial uncontrolled page (0-based). @default 0 */
    defaultPage?: number;
    /** Receives every page change. */
    onPageChange?: (page: number) => void;
}
export interface UseTablePaginationResult<Row> {
    /** Current page (0-based, clamped to range). */
    page: number;
    pageSize: number;
    pageCount: number;
    /** Rows on the current page. */
    pageRows: Row[];
    /** 1-based index of the first row shown (0 when empty). */
    fromRow: number;
    /** 1-based index of the last row shown. */
    toRow: number;
    totalRows: number;
    setPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    firstPage: () => void;
    lastPage: () => void;
    canPreviousPage: boolean;
    canNextPage: boolean;
}
/**
 * Headless pagination over a row array: clamped page state
 * (controlled/uncontrolled), the current page slice, and the range/among
 * helpers a pager UI needs.
 */
export declare function useTablePagination<Row>({ rows, pageSize, page: controlledPage, defaultPage, onPageChange, }: UseTablePaginationOptions<Row>): UseTablePaginationResult<Row>;
export default useTablePagination;
//# sourceMappingURL=useTablePagination.d.ts.map