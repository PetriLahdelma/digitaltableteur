"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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

const clamp = (value: number, max: number) =>
  Math.max(0, Math.min(value, max));

/**
 * Headless pagination over a row array: clamped page state
 * (controlled/uncontrolled), the current page slice, and the range/among
 * helpers a pager UI needs.
 */
export function useTablePagination<Row>({
  rows,
  pageSize = 10,
  page: controlledPage,
  defaultPage = 0,
  onPageChange,
}: UseTablePaginationOptions<Row>): UseTablePaginationResult<Row> {
  const [internalPage, setInternalPage] = useState(defaultPage);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const rawPage = controlledPage === undefined ? internalPage : controlledPage;
  const page = clamp(rawPage, pageCount - 1);

  // Keep uncontrolled page in range when the row count shrinks under it.
  useEffect(() => {
    if (controlledPage === undefined && internalPage > pageCount - 1) {
      setInternalPage(pageCount - 1);
    }
  }, [controlledPage, internalPage, pageCount]);

  const setPage = useCallback(
    (next: number) => {
      const clamped = clamp(next, pageCount - 1);
      if (controlledPage === undefined) setInternalPage(clamped);
      onPageChange?.(clamped);
    },
    [controlledPage, onPageChange, pageCount],
  );

  const pageRows = useMemo(
    () => rows.slice(page * pageSize, page * pageSize + pageSize),
    [rows, page, pageSize],
  );

  const totalRows = rows.length;
  const fromRow = totalRows === 0 ? 0 : page * pageSize + 1;
  const toRow = Math.min(page * pageSize + pageSize, totalRows);

  return {
    page,
    pageSize,
    pageCount,
    pageRows,
    fromRow,
    toRow,
    totalRows,
    setPage,
    nextPage: useCallback(() => setPage(page + 1), [setPage, page]),
    previousPage: useCallback(() => setPage(page - 1), [setPage, page]),
    firstPage: useCallback(() => setPage(0), [setPage]),
    lastPage: useCallback(() => setPage(pageCount - 1), [setPage, pageCount]),
    canPreviousPage: page > 0,
    canNextPage: page < pageCount - 1,
  };
}

export default useTablePagination;
