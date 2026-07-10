"use client";

import {
  useCallback,
  useEffect,
  useState,
  type RefObject,
} from "react";

export type OverflowAxis = "x" | "y";

export interface OverflowOptions {
  axis?: OverflowAxis;
  epsilon?: number;
  enabled?: boolean;
}

export interface OverflowState {
  isOverflowing: boolean;
  canScrollStart: boolean;
  canScrollEnd: boolean;
  refresh: () => void;
}

export type ScrollOverflowState = OverflowState;

const INITIAL_STATE = {
  isOverflowing: false,
  canScrollStart: false,
  canScrollEnd: false,
};

function measureOverflow(
  element: HTMLElement | null,
  axis: OverflowAxis,
  epsilon: number,
) {
  if (!element) return INITIAL_STATE;

  const scrollSize = axis === "x" ? element.scrollWidth : element.scrollHeight;
  const clientSize = axis === "x" ? element.clientWidth : element.clientHeight;
  const scrollOffset = axis === "x" ? element.scrollLeft : element.scrollTop;

  const isOverflowing = scrollSize > clientSize + epsilon;
  return {
    isOverflowing,
    canScrollStart: isOverflowing && scrollOffset > epsilon,
    canScrollEnd:
      isOverflowing && scrollOffset + clientSize < scrollSize - epsilon,
  };
}

function sameOverflowState(a: typeof INITIAL_STATE, b: typeof INITIAL_STATE) {
  return (
    a.isOverflowing === b.isOverflowing &&
    a.canScrollStart === b.canScrollStart &&
    a.canScrollEnd === b.canScrollEnd
  );
}

export function useScrollOverflow(
  ref: RefObject<HTMLElement | null>,
  options: OverflowOptions = {},
): OverflowState {
  const { axis = "x", epsilon = 1, enabled = true } = options;
  const [state, setState] = useState(INITIAL_STATE);

  const refresh = useCallback(() => {
    const next = measureOverflow(ref.current, axis, epsilon);
    setState((current) => (sameOverflowState(current, next) ? current : next));
  }, [axis, epsilon, ref]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const element = ref.current;
    refresh();
    if (!element) return;

    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(refresh);
    observer?.observe(element);
    element.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);

    return () => {
      observer?.disconnect();
      element.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, [enabled, ref, refresh]);

  return { ...state, refresh };
}

export function useOverflow(
  ref: RefObject<HTMLElement | null>,
  options: OverflowOptions = {},
): Pick<OverflowState, "isOverflowing" | "refresh"> {
  const { isOverflowing, refresh } = useScrollOverflow(ref, options);
  return { isOverflowing, refresh };
}
