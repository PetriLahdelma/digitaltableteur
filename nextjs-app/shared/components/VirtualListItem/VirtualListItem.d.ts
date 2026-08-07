import React from "react";
import { type ListItemProps } from "@dt/ListItem";
export interface VirtualListItemProps extends ListItemProps {
    /** 1-based position within the full collection (`aria-posinset`). */
    posInSet: number;
    /** Total item count in the full collection (`aria-setsize`). */
    setSize: number;
    /** Positioning style supplied by VirtualList (transform + block-size). */
    style?: React.CSSProperties;
}
/** The subset of props a consumer supplies per item; VirtualList injects the rest. */
export type VirtualListItemContent = Omit<VirtualListItemProps, "posInSet" | "setSize" | "style">;
/**
 * A single windowed list row. Owns the `role="listitem"` semantics and the
 * `aria-posinset`/`aria-setsize` position metadata that keep a virtualized list
 * announceable, and composes the shared `ListItem` for its chrome (leading
 * icon, truncating label, end meta, trailing icon, selected check, destructive
 * tone) — the same extras menus and other lists use.
 */
export declare const VirtualListItem: React.ForwardRefExoticComponent<VirtualListItemProps & React.RefAttributes<HTMLDivElement>>;
export default VirtualListItem;
//# sourceMappingURL=VirtualListItem.d.ts.map