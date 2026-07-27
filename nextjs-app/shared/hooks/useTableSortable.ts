"use client";

import { useCallback, useMemo, useState } from "react";
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

const comparable = (value: unknown): string | number => {
  if (typeof value === "number") return value;
  if (value == null) return "";
  return String(value).toLocaleLowerCase();
};

function nextSort(current: TableSort | null, columnId: string): TableSort | null {
  if (current?.columnId !== columnId) {
    return { columnId, direction: "ascending" };
  }
  if (current.direction === "ascending") {
    return { columnId, direction: "descending" };
  }
  return null;
}

/**
 * Headless three-state column sorting. Manages the asc → desc → unsorted cycle
 * (controlled or uncontrolled) and returns the sorted rows plus per-column
 * state for `aria-sort` and the sort caret.
 */
export function useTableSortable<Row>({
  rows,
  getSortValue,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
}: UseTableSortableOptions<Row>): UseTableSortableResult<Row> {
  const [internalSort, setInternalSort] = useState<TableSort | null>(defaultSort);
  const sort = controlledSort === undefined ? internalSort : controlledSort;

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const direction = sort.direction === "ascending" ? 1 : -1;
    return [...rows].sort((left, right) => {
      const leftValue = comparable(getSortValue(left, sort.columnId));
      const rightValue = comparable(getSortValue(right, sort.columnId));
      if (leftValue === rightValue) return 0;
      return leftValue > rightValue ? direction : -direction;
    });
  }, [rows, sort, getSortValue]);

  const toggleSort = useCallback(
    (columnId: string) => {
      const value = nextSort(sort, columnId);
      if (controlledSort === undefined) setInternalSort(value);
      onSortChange?.(value);
    },
    [sort, controlledSort, onSortChange],
  );

  const getColumnSort = useCallback(
    (columnId: string): TableSortDirection =>
      sort?.columnId === columnId ? sort.direction : "none",
    [sort],
  );

  return { sort, sortedRows, toggleSort, getColumnSort };
}

export default useTableSortable;
