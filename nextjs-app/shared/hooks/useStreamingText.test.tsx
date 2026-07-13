import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStreamingText } from "./useStreamingText";

describe("useStreamingText", () => {
  let animationFrames: FrameRequestCallback[];
  let reducedMotion: boolean;

  beforeEach(() => {
    animationFrames = [];
    reducedMotion = false;

    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        animationFrames.push(callback);
        return animationFrames.length;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: query.includes("prefers-reduced-motion")
          ? reducedMotion
          : false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function runFrame(timestamp: number) {
    const callback = animationFrames.shift();
    expect(callback).toBeDefined();
    act(() => callback?.(timestamp));
  }

  it("returns the complete target outside an active stream", () => {
    const { result } = renderHook(() =>
      useStreamingText("Complete response", false),
    );

    expect(result.current).toBe("Complete response");
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("smooths a burst without exposing the whole target in one frame", () => {
    const target = "A long response that arrived as one network chunk.";
    const { result } = renderHook(() => useStreamingText(target, true));

    expect(result.current).toBe("");
    runFrame(16);
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.length).toBeLessThan(target.length);
    expect(target.startsWith(result.current)).toBe(true);
  });

  it("snaps to the complete target when streaming finishes", () => {
    const { result, rerender } = renderHook(
      ({ streaming }) => useStreamingText("Final response", streaming),
      { initialProps: { streaming: true } },
    );

    runFrame(16);
    rerender({ streaming: false });
    expect(result.current).toBe("Final response");
  });

  it("never exposes a partial grapheme cluster", () => {
    const target = "A👨‍👩‍👧‍👦e\u0301🇫🇮B";
    const boundaries = new Set<number>([0, target.length]);
    for (const segment of new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    }).segment(target)) {
      boundaries.add(segment.index);
    }

    const { result } = renderHook(() => useStreamingText(target, true));
    for (let frame = 1; frame <= 12 && result.current !== target; frame += 1) {
      runFrame(frame * 50);
      expect(boundaries.has(result.current.length)).toBe(true);
    }
  });

  it("skips progressive reveal for reduced motion", () => {
    reducedMotion = true;
    const { result } = renderHook(() =>
      useStreamingText("Reduced-motion response", true),
    );

    expect(result.current).toBe("Reduced-motion response");
  });

  it("supports an explicit instant mode", () => {
    const { result } = renderHook(() =>
      useStreamingText("Instant response", true, { speed: "instant" }),
    );

    expect(result.current).toBe("Instant response");
  });

  it("resets safely when the accumulated target is replaced", () => {
    const { result, rerender } = renderHook(
      ({ target }) => useStreamingText(target, true),
      { initialProps: { target: "Original accumulated response" } },
    );

    runFrame(16);
    expect(result.current.length).toBeGreaterThan(0);

    rerender({ target: "Replacement" });
    expect("Replacement".startsWith(result.current)).toBe(true);
  });

  it("cancels its animation frame on unmount", () => {
    const { unmount } = renderHook(() =>
      useStreamingText("Streaming response", true),
    );

    unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });
});
