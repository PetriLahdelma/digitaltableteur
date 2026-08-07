import React from "react";
export interface ListItemProps {
    /** Primary label. Truncates with an ellipsis; never wraps. */
    children: React.ReactNode;
    /** Leading icon node; rendered in a fixed gutter so labels column-align. */
    icon?: React.ReactNode;
    /** End-aligned secondary content: muted small text, Badge, Kbd, StatusDot, or a value. Exposed to AT. */
    meta?: React.ReactNode;
    /** Trailing icon after meta (chevron, external-link). Decorative. */
    trailingIcon?: React.ReactNode;
    /** Renders the check indicator in the trailing position. Visual only; semantic selection belongs to the consumer. */
    selected?: boolean;
    /** Destructive rows (deletions) use the error color treatment. */
    tone?: "neutral" | "destructive";
    /** Visual disabled treatment via the canonical disabled tokens. The consumer carries aria-disabled. */
    disabled?: boolean;
    /** Parent-driven active row (combobox/palette). Radix menus work without it via [data-highlighted]. */
    highlighted?: boolean;
    className?: string;
}
/**
 * Presentational row for menus, selects, palettes, and lists. Renders visuals
 * only; the interactive wrapper (Radix Item, button, li, option) owns role,
 * focus, and events.
 */
export declare const ListItem: React.FC<ListItemProps>;
export default ListItem;
//# sourceMappingURL=ListItem.d.ts.map