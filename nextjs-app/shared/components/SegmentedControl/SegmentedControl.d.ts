import React from "react";
export declare const segmentedControlVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface SegmentedControlItem {
    /** Stable value emitted on selection. */
    value: string;
    /** Visible segment label. */
    label: React.ReactNode;
    /** Disable this segment (skipped by keyboard navigation). */
    disabled?: boolean;
}
export interface SegmentedControlProps {
    /** Segments to render, in order. */
    items: SegmentedControlItem[];
    /** Currently selected value (controlled). */
    value: string;
    /** Called with the new value when a segment is selected. */
    onValueChange: (value: string) => void;
    /** Size token. @default "md" */
    size?: "sm" | "md" | "lg";
    /** Accessible name for the group (required; announced by screen readers). */
    ariaLabel: string;
    /** Additional CSS class names. */
    className?: string;
}
/**
 * Single-select segmented control: a compact row of mutually exclusive options,
 * one visibly selected. Implemented as a `radiogroup` with roving tabindex and
 * arrow-key navigation. For a non-exclusive row of actions use `ButtonGroup`.
 */
export declare const SegmentedControl: React.ForwardRefExoticComponent<SegmentedControlProps & React.RefAttributes<HTMLDivElement>>;
export default SegmentedControl;
//# sourceMappingURL=SegmentedControl.d.ts.map