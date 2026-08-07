import React from "react";
import { type VirtualListItemContent } from "@dt/VirtualListItem";
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
/** Fixed-height windowed list for large collections. */
export declare function VirtualList<Item>({ items, itemHeight, height, getItemKey, getItemProps, "aria-label": ariaLabel, overscan, initialScrollOffset, onRangeChange, className, }: VirtualListProps<Item>): React.JSX.Element;
export declare namespace VirtualList {
    var displayName: string;
}
export default VirtualList;
//# sourceMappingURL=VirtualList.d.ts.map