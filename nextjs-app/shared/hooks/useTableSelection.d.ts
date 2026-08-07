export interface UseTableSelectionStateOptions {
    /** Controlled selected row ids. */
    selectedIds?: string[];
    /** Initial uncontrolled selection. */
    defaultSelectedIds?: string[];
    /** Receives the next selection. */
    onSelectionChange?: (ids: string[]) => void;
}
/**
 * Controlled/uncontrolled selected-id state primitive. Returns the current ids
 * and a setter that respects the controlled/uncontrolled boundary — the shared
 * state core behind `useTableSelection`.
 */
export declare function useTableSelectionState({ selectedIds: controlled, defaultSelectedIds, onSelectionChange, }?: UseTableSelectionStateOptions): [
    string[],
    (ids: string[]) => void
];
export interface UseTableSelectionOptions extends UseTableSelectionStateOptions {
    /** All selectable row ids, in display order (drives select-all + indeterminate). */
    rowIds: string[];
}
export interface UseTableSelectionResult {
    selectedIds: string[];
    isSelected: (rowId: string) => boolean;
    toggleRow: (rowId: string) => void;
    toggleAll: () => void;
    /** Every row selected. */
    allSelected: boolean;
    /** Some but not all rows selected → checkbox indeterminate. */
    someSelected: boolean;
    clear: () => void;
}
/**
 * Headless row selection: per-row toggle, select-all/clear, and the
 * all/indeterminate flags a header checkbox needs. Wraps
 * `useTableSelectionState`.
 */
export declare function useTableSelection({ rowIds, ...stateOptions }: UseTableSelectionOptions): UseTableSelectionResult;
export default useTableSelection;
//# sourceMappingURL=useTableSelection.d.ts.map