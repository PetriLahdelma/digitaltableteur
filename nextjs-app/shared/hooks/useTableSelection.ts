"use client";

import { useCallback, useMemo, useState } from "react";

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
export function useTableSelectionState({
  selectedIds: controlled,
  defaultSelectedIds = [],
  onSelectionChange,
}: UseTableSelectionStateOptions = {}): [
  string[],
  (ids: string[]) => void,
] {
  const [internal, setInternal] = useState<string[]>(defaultSelectedIds);
  const selectedIds = controlled === undefined ? internal : controlled;

  const setSelectedIds = useCallback(
    (ids: string[]) => {
      if (controlled === undefined) setInternal(ids);
      onSelectionChange?.(ids);
    },
    [controlled, onSelectionChange],
  );

  return [selectedIds, setSelectedIds];
}

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
export function useTableSelection({
  rowIds,
  ...stateOptions
}: UseTableSelectionOptions): UseTableSelectionResult {
  const [selectedIds, setSelectedIds] = useTableSelectionState(stateOptions);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const isSelected = useCallback(
    (rowId: string) => selectedSet.has(rowId),
    [selectedSet],
  );

  const toggleRow = useCallback(
    (rowId: string) => {
      setSelectedIds(
        selectedSet.has(rowId)
          ? selectedIds.filter((id) => id !== rowId)
          : [...selectedIds, rowId],
      );
    },
    [selectedIds, selectedSet, setSelectedIds],
  );

  const allSelected =
    rowIds.length > 0 && rowIds.every((id) => selectedSet.has(id));
  const someSelected =
    !allSelected && rowIds.some((id) => selectedSet.has(id));

  const toggleAll = useCallback(() => {
    setSelectedIds(allSelected ? [] : [...rowIds]);
  }, [allSelected, rowIds, setSelectedIds]);

  const clear = useCallback(() => setSelectedIds([]), [setSelectedIds]);

  return {
    selectedIds,
    isSelected,
    toggleRow,
    toggleAll,
    allSelected,
    someSelected,
    clear,
  };
}

export default useTableSelection;
