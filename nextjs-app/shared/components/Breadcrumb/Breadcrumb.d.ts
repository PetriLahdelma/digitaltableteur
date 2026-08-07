import React from "react";
export type BreadcrumbItem = {
    label: string;
    href?: string;
};
export type BreadcrumbProps = {
    /** Breadcrumb items in root-to-current order (label, optional href); the last renders as plain text. */
    items: BreadcrumbItem[];
    /** Accessible name for the nav landmark. @default "Breadcrumb" */
    "aria-label"?: string;
    /**
     * Underline mode forwarded to the Link for each trail item — the same
     * contract as Link: "always" shows the wavy underline permanently, "hover"
     * reveals it on hover and keyboard focus, "none" omits it. @default "always"
     */
    underline?: "always" | "hover" | "none";
    /**
     * Static collapse cap. When set to a positive number smaller than the item
     * count, the middle items collapse into an ellipsis menu WITHOUT measuring:
     * the first `maxItems - 2` leading items and the current item stay visible.
     * Leave unset (or 0) for automatic width-based collapse (the default).
     */
    maxItems?: number;
    /** Accessible name for the ellipsis menu trigger. @default "Show N hidden breadcrumbs" */
    collapseLabel?: string;
    /**
     * Render the first item as a house icon instead of its text label. The
     * item's label becomes the icon's accessible name, so screen readers still
     * announce it (e.g. "Home"). @default false
     */
    homeIcon?: boolean;
};
/**
 * How many leading items to show before the ellipsis when the trail overflows,
 * or null to show every item. The current (last) item is always shown; hidden
 * items are those between the returned count and the current item. Pure so the
 * fit math is unit-testable without a DOM.
 */
export declare function computeLeadingCount(params: {
    /** Per-item natural widths from the measurer; leading widths include their separator, the last is the current label. */
    itemWidths: number[];
    /** Width of the ellipsis item (button + separator). */
    ellipsisWidth: number;
    /** Gap between list items. */
    listGap: number;
    /** Available container width. */
    available: number;
}): number | null;
/** Breadcrumb navigation trail with current page indication and overflow collapse. */
declare const Breadcrumb: React.FC<BreadcrumbProps>;
export default Breadcrumb;
//# sourceMappingURL=Breadcrumb.d.ts.map