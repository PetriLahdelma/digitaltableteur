import { act, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useOverflow, useScrollOverflow } from "./useOverflow";

class ResizeObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
}

function setElementMetrics(
  element: HTMLElement,
  metrics: {
    scrollWidth?: number;
    clientWidth?: number;
    scrollLeft?: number;
    scrollHeight?: number;
    clientHeight?: number;
    scrollTop?: number;
  },
) {
  for (const [key, value] of Object.entries(metrics)) {
    Object.defineProperty(element, key, {
      configurable: true,
      value,
    });
  }
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useOverflow", () => {
  it("reports whether an element overflows on the requested axis", () => {
    const element = document.createElement("div");
    setElementMetrics(element, { scrollWidth: 240, clientWidth: 120 });
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = element;

    const { result } = renderHook(() => useOverflow(ref));

    expect(result.current.isOverflowing).toBe(true);
  });
});

describe("useScrollOverflow", () => {
  it("tracks scroll affordances at the start and end of the element", () => {
    const element = document.createElement("div");
    setElementMetrics(element, {
      scrollWidth: 300,
      clientWidth: 100,
      scrollLeft: 0,
    });
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = element;

    const { result } = renderHook(() => useScrollOverflow(ref));

    expect(result.current.isOverflowing).toBe(true);
    expect(result.current.canScrollStart).toBe(false);
    expect(result.current.canScrollEnd).toBe(true);

    act(() => {
      setElementMetrics(element, { scrollLeft: 200 });
      element.dispatchEvent(new Event("scroll"));
    });

    expect(result.current.canScrollStart).toBe(true);
    expect(result.current.canScrollEnd).toBe(false);
  });

  it("supports vertical overflow measurement", () => {
    const element = document.createElement("div");
    setElementMetrics(element, {
      scrollHeight: 220,
      clientHeight: 100,
      scrollTop: 40,
    });
    const ref = createRef<HTMLDivElement>();
    (ref as { current: HTMLDivElement }).current = element;

    const { result } = renderHook(() =>
      useScrollOverflow(ref, { axis: "y" }),
    );

    expect(result.current.isOverflowing).toBe(true);
    expect(result.current.canScrollStart).toBe(true);
    expect(result.current.canScrollEnd).toBe(true);
  });
});
