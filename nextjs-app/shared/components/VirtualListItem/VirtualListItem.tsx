"use client";

import React from "react";
import ListItem, { type ListItemProps } from "@dt/ListItem";
import { cn } from "../../lib/cn";
import styles from "./VirtualListItem.module.css";

export interface VirtualListItemProps extends ListItemProps {
  /** 1-based position within the full collection (`aria-posinset`). */
  posInSet: number;
  /** Total item count in the full collection (`aria-setsize`). */
  setSize: number;
  /** Positioning style supplied by VirtualList (transform + block-size). */
  style?: React.CSSProperties;
}

/** The subset of props a consumer supplies per item; VirtualList injects the rest. */
export type VirtualListItemContent = Omit<
  VirtualListItemProps,
  "posInSet" | "setSize" | "style"
>;

/**
 * A single windowed list row. Owns the `role="listitem"` semantics and the
 * `aria-posinset`/`aria-setsize` position metadata that keep a virtualized list
 * announceable, and composes the shared `ListItem` for its chrome (leading
 * icon, truncating label, end meta, trailing icon, selected check, destructive
 * tone) — the same extras menus and other lists use.
 */
export const VirtualListItem = React.forwardRef<
  HTMLDivElement,
  VirtualListItemProps
>(({ posInSet, setSize, style, className, ...listItem }, ref) => (
  <div
    ref={ref}
    role="listitem"
    aria-posinset={posInSet}
    aria-setsize={setSize}
    className={cn(styles.row, className)}
    style={style}
  >
    <ListItem className={styles.item} {...listItem} />
  </div>
));

VirtualListItem.displayName = "VirtualListItem";

export default VirtualListItem;
