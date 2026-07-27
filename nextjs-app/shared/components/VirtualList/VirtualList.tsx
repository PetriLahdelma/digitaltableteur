"use client";

import React, { useMemo, useState } from "react";
import {
  VirtualListItem,
  type VirtualListItemContent,
} from "@dt/VirtualListItem";
import styles from "./VirtualList.module.css";

export type VirtualListRange = {
  startIndex: number;
  endIndex: number;
};

export interface VirtualListProps<Item> {
  /** Complete item collection. */
  items: Item[];
  /** Fixed item height in pixels. */
  itemHeight: number;
  /** Visible viewport height in pixels. */
  height: number;
  /** Stable item key. */
  getItemKey: (item: Item, index: number) => React.Key;
  /**
   * Maps an item to its VirtualListItem chrome (label via `children`, plus
   * optional `icon`, `meta`, `trailingIcon`, `selected`, `tone`). VirtualList
   * injects the position (`posInSet`/`setSize`) and windowing style.
   */
  getItemProps: (item: Item, index: number) => VirtualListItemContent;
  /** Accessible list name. */
  "aria-label": string;
  /** Extra rows rendered before and after the viewport. @default 3 */
  overscan?: number;
  /** Initial scroll offset in pixels. @default 0 */
  initialScrollOffset?: number;
  /** Receives the rendered index range. */
  onRangeChange?: (range: VirtualListRange) => void;
  className?: string;
}

function rangeFor(
  itemCount: number,
  itemHeight: number,
  height: number,
  scrollOffset: number,
  overscan: number,
): VirtualListRange {
  if (itemCount === 0) return { startIndex: 0, endIndex: -1 };
  const visibleStart = Math.floor(scrollOffset / itemHeight);
  const visibleCount = Math.ceil(height / itemHeight);
  return {
    startIndex: Math.max(0, visibleStart - overscan),
    endIndex: Math.min(
      itemCount - 1,
      visibleStart + visibleCount + overscan - 1,
    ),
  };
}

/** Fixed-height windowed list for large collections. */
export function VirtualList<Item>({
  items,
  itemHeight,
  height,
  getItemKey,
  getItemProps,
  "aria-label": ariaLabel,
  overscan = 3,
  initialScrollOffset = 0,
  onRangeChange,
  className,
}: VirtualListProps<Item>) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(initialScrollOffset);
  const range = useMemo(
    () => rangeFor(items.length, itemHeight, height, scrollOffset, overscan),
    [height, itemHeight, items.length, overscan, scrollOffset],
  );
  const visibleItems =
    range.endIndex < range.startIndex
      ? []
      : items.slice(range.startIndex, range.endIndex + 1);

  React.useEffect(() => {
    onRangeChange?.(range);
  }, [onRangeChange, range]);

  React.useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = initialScrollOffset;
    }
  }, [initialScrollOffset]);

  return (
    <div
      ref={viewportRef}
      className={[styles.viewport, className].filter(Boolean).join(" ")}
      role="list"
      aria-label={ariaLabel}
      // The viewport scrolls, so it must be keyboard-focusable — keyboard users
      // scroll the window with the arrow keys / Page Up-Down.
      tabIndex={0}
      style={{ blockSize: height }}
      onScroll={(event) => setScrollOffset(event.currentTarget.scrollTop)}
    >
      <div
        className={styles.spacer}
        style={{ blockSize: items.length * itemHeight }}
      >
        {visibleItems.map((item, visibleIndex) => {
          const index = range.startIndex + visibleIndex;
          return (
            <VirtualListItem
              key={getItemKey(item, index)}
              posInSet={index + 1}
              setSize={items.length}
              style={{
                position: "absolute",
                insetInlineStart: 0,
                insetInlineEnd: 0,
                blockSize: itemHeight,
                transform: `translateY(${index * itemHeight}px)`,
              }}
              {...getItemProps(item, index)}
            />
          );
        })}
      </div>
    </div>
  );
}

VirtualList.displayName = "VirtualList";

export default VirtualList;
