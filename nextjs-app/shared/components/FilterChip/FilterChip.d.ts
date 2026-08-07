import React from "react";
type FilterChipVariant = "pill" | "rectangle" | "underline" | "minimal";
type FilterChipSize = "sm" | "md" | "lg";
export interface FilterChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
    /** Whether this chip's filter is active (rendered as aria-pressed). */
    pressed: boolean;
    /** Chip label (compose counts etc. inline). */
    children: React.ReactNode;
    /** Visual treatment. @default "pill" */
    variant?: FilterChipVariant;
    /** Size token. @default "md" */
    size?: FilterChipSize;
    /** Optional count suffix, rendered as "(n)". */
    count?: number;
    /** Additional CSS class names. */
    className?: string;
}
export declare const filterChipVariants: (props?: ({
    variant?: "underline" | "minimal" | "pill" | "rectangle" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/**
 * Single-select filter toggle chip: a `button[aria-pressed]` with pill,
 * rectangle, underline, and minimal treatments. The shared implementation behind
 * CategoryFilter and BlogCategoryFilter — a filter is a UI control, not a
 * tablist, so chips are toggle buttons inside a labelled `role="group"`.
 */
export declare const FilterChip: React.ForwardRefExoticComponent<FilterChipProps & React.RefAttributes<HTMLButtonElement>>;
export default FilterChip;
//# sourceMappingURL=FilterChip.d.ts.map