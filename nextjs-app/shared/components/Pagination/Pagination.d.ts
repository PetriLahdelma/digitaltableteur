export interface PaginationProps {
    /** Current active page (1-indexed) */
    currentPage: number;
    /** Total number of pages */
    totalPages: number;
    /** Callback when page changes */
    onPageChange: (page: number) => void;
    /** Number of page buttons to show on each side of current page */
    siblingCount?: number;
    /** Custom className */
    className?: string;
}
export declare function Pagination({ currentPage, totalPages, onPageChange, siblingCount, className, }: PaginationProps): import("react").JSX.Element | null;
export declare namespace Pagination {
    var displayName: string;
}
//# sourceMappingURL=Pagination.d.ts.map