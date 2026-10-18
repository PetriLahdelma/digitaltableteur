"use client";

import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

/**
 * State and motion for a collapsible chip filter: collapsed, only the pressed
 * chip shows beside a disclosure button; expanded, every chip shows. The
 * group's height animates between the two (no motion under reduced motion),
 * and picking a chip while expanded collapses back to it. Pair with
 * styles/filter-disclosure.module.css.
 */
export function useFilterDisclosure(enabled: boolean) {
  const groupId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  /** Apply a state change and animate the group's height from old to new. */
  const withHeightTransition = (update: () => void) => {
    const el = groupRef.current;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduced || typeof el.animate !== "function") {
      update();
      return;
    }
    const from = el.offsetHeight;
    flushSync(update);
    const to = el.offsetHeight;
    if (from === to) return;
    // Clip only while the height moves, so focus rings are never cut off.
    el.style.overflow = "hidden";
    const animation = el.animate(
      [{ blockSize: `${from}px` }, { blockSize: `${to}px` }],
      { duration: 240, easing: "cubic-bezier(0.2, 0, 0, 1)" },
    );
    const release = () => {
      el.style.overflow = "";
    };
    animation.onfinish = release;
    animation.oncancel = release;
  };

  /** Wrap a chip's change handler: while expanded, it also collapses. */
  const select = (change: () => void) => {
    if (enabled && expanded) {
      withHeightTransition(() => {
        change();
        setExpanded(false);
      });
      return;
    }
    change();
  };

  return {
    groupId,
    groupRef,
    expanded,
    collapsed: enabled && !expanded,
    select,
    /** Props for the disclosure button (always the group's first child). */
    toggleProps: {
      type: "button" as const,
      "aria-expanded": expanded,
      "aria-controls": groupId,
      onClick: () => withHeightTransition(() => setExpanded((v) => !v)),
    },
  };
}
