import { act, renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useTablePagination } from "./useTablePagination";

const rows = Array.from({ length: 23 }, (_, i) => i);

describe("useTablePagination", () => {
  it("slices the current page and reports the range", () => {
    const { result } = renderHook(() =>
      useTablePagination({ rows, pageSize: 10 }),
    );
    expect(result.current.pageCount).toBe(3);
    expect(result.current.pageRows).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(result.current.fromRow).toBe(1);
    expect(result.current.toRow).toBe(10);
    expect(result.current.totalRows).toBe(23);
    expect(result.current.canPreviousPage).toBe(false);
    expect(result.current.canNextPage).toBe(true);
  });

  it("navigates next/previous/first/last with clamping", () => {
    const { result } = renderHook(() =>
      useTablePagination({ rows, pageSize: 10 }),
    );
    act(() => result.current.nextPage());
    expect(result.current.page).toBe(1);
    expect(result.current.pageRows[0]).toBe(10);

    act(() => result.current.lastPage());
    expect(result.current.page).toBe(2);
    expect(result.current.pageRows).toEqual([20, 21, 22]);
    expect(result.current.toRow).toBe(23);
    expect(result.current.canNextPage).toBe(false);

    act(() => result.current.nextPage()); // clamps, stays on last
    expect(result.current.page).toBe(2);

    act(() => result.current.firstPage());
    expect(result.current.page).toBe(0);
  });

  it("reports an empty range for no rows", () => {
    const { result } = renderHook(() =>
      useTablePagination({ rows: [], pageSize: 10 }),
    );
    expect(result.current.pageCount).toBe(1);
    expect(result.current.fromRow).toBe(0);
    expect(result.current.toRow).toBe(0);
    expect(result.current.pageRows).toEqual([]);
  });
});
