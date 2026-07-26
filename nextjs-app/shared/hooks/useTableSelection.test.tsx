import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  useTableSelection,
  useTableSelectionState,
} from "./useTableSelection";

const rowIds = ["a", "b", "c"];

describe("useTableSelectionState", () => {
  it("manages uncontrolled selection", () => {
    const { result } = renderHook(() =>
      useTableSelectionState({ defaultSelectedIds: ["a"] }),
    );
    expect(result.current[0]).toEqual(["a"]);
    act(() => result.current[1](["a", "b"]));
    expect(result.current[0]).toEqual(["a", "b"]);
  });

  it("holds controlled selection and only notifies", () => {
    const onSelectionChange = vi.fn();
    const { result } = renderHook(() =>
      useTableSelectionState({ selectedIds: ["a"], onSelectionChange }),
    );
    act(() => result.current[1](["a", "b"]));
    expect(result.current[0]).toEqual(["a"]); // controlled — unchanged
    expect(onSelectionChange).toHaveBeenCalledWith(["a", "b"]);
  });
});

describe("useTableSelection", () => {
  it("toggles a single row on and off", () => {
    const { result } = renderHook(() => useTableSelection({ rowIds }));
    act(() => result.current.toggleRow("b"));
    expect(result.current.isSelected("b")).toBe(true);
    act(() => result.current.toggleRow("b"));
    expect(result.current.isSelected("b")).toBe(false);
  });

  it("derives all/indeterminate flags and toggles all", () => {
    const { result } = renderHook(() =>
      useTableSelection({ rowIds, defaultSelectedIds: ["a"] }),
    );
    expect(result.current.someSelected).toBe(true);
    expect(result.current.allSelected).toBe(false);

    act(() => result.current.toggleAll());
    expect(result.current.allSelected).toBe(true);
    expect(result.current.someSelected).toBe(false);

    act(() => result.current.toggleAll());
    expect(result.current.selectedIds).toEqual([]);
  });

  it("clears the selection", () => {
    const { result } = renderHook(() =>
      useTableSelection({ rowIds, defaultSelectedIds: ["a", "b"] }),
    );
    act(() => result.current.clear());
    expect(result.current.selectedIds).toEqual([]);
  });
});
