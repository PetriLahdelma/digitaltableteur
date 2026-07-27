import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTableSortable } from "./useTableSortable";

type Row = { id: string; name: string; score: number };
const rows: Row[] = [
  { id: "b", name: "Beta", score: 2 },
  { id: "a", name: "Alpha", score: 3 },
  { id: "c", name: "Gamma", score: 1 },
];
const getSortValue = (row: Row, columnId: string) =>
  columnId === "score" ? row.score : row.name;

describe("useTableSortable", () => {
  it("cycles a column ascending → descending → unsorted", () => {
    const { result } = renderHook(() =>
      useTableSortable({ rows, getSortValue }),
    );
    expect(result.current.getColumnSort("name")).toBe("none");

    act(() => result.current.toggleSort("name"));
    expect(result.current.sort).toEqual({
      columnId: "name",
      direction: "ascending",
    });
    act(() => result.current.toggleSort("name"));
    expect(result.current.sort?.direction).toBe("descending");
    act(() => result.current.toggleSort("name"));
    expect(result.current.sort).toBeNull();
  });

  it("sorts rows by the active column and direction", () => {
    const { result } = renderHook(() =>
      useTableSortable({
        rows,
        getSortValue,
        defaultSort: { columnId: "name", direction: "ascending" },
      }),
    );
    expect(result.current.sortedRows.map((r) => r.id)).toEqual(["a", "b", "c"]);
    act(() => result.current.toggleSort("name")); // → descending
    expect(result.current.sortedRows.map((r) => r.id)).toEqual(["c", "b", "a"]);
  });

  it("sorts numbers numerically", () => {
    const { result } = renderHook(() =>
      useTableSortable({
        rows,
        getSortValue,
        defaultSort: { columnId: "score", direction: "ascending" },
      }),
    );
    expect(result.current.sortedRows.map((r) => r.score)).toEqual([1, 2, 3]);
  });

  it("respects controlled sort and reports changes", () => {
    const onSortChange = vi.fn();
    const { result } = renderHook(() =>
      useTableSortable({
        rows,
        getSortValue,
        sort: { columnId: "name", direction: "ascending" },
        onSortChange,
      }),
    );
    act(() => result.current.toggleSort("name"));
    // Controlled: internal state does not move; consumer is notified.
    expect(result.current.sort?.direction).toBe("ascending");
    expect(onSortChange).toHaveBeenCalledWith({
      columnId: "name",
      direction: "descending",
    });
  });
});
