import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useMediaQuery } from "./useMediaQuery";

type Listener = (event: MediaQueryListEvent) => void;

function mockMatchMedia(initialMatches: boolean) {
  let listener: Listener | null = null;
  const mql = {
    matches: initialMatches,
    addEventListener: (_: string, cb: Listener) => {
      listener = cb;
    },
    removeEventListener: () => {
      listener = null;
    },
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql),
  );
  return {
    emit(matches: boolean) {
      mql.matches = matches;
      listener?.({ matches } as MediaQueryListEvent);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useMediaQuery", () => {
  it("syncs to the current match after mount", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(width < 768px)"));
    expect(result.current).toBe(true);
  });

  it("updates when the query result changes", () => {
    const mm = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(width < 768px)"));
    expect(result.current).toBe(false);
    act(() => mm.emit(true));
    expect(result.current).toBe(true);
  });
});
