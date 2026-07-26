"use client";

import React, { useMemo, useState } from "react";
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
  /** Renders one visible item. */
  renderItem: (item: Item, index: number) => React.ReactNode;
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
  renderItem,
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
            <div
              key={getItemKey(item, index)}
              className={styles.item}
              role="listitem"
              aria-posinset={index + 1}
              aria-setsize={items.length}
              style={{
                blockSize: itemHeight,
                transform: `translateY(${index * itemHeight}px)`,
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

VirtualList.displayName = "VirtualList";

export default VirtualList;
