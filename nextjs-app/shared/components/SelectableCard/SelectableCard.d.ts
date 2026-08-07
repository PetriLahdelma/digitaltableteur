import React from "react";
import { type CardProps } from "@dt/Card";
export type SelectableCardSelectionType = "single" | "multiple";
export interface SelectableCardGroupProps {
    /** Selection model — single is an exclusive set (radio), multiple toggles independently (checkbox). @default "single" */
    type?: SelectableCardSelectionType;
    /** Group label rendered as the fieldset legend (required for an accessible name). */
    legend: string;
    /** Native radio group name shared by the set (single); auto-generated when omitted. */
    name?: string;
    /** Controlled selection: `string` for single, `string[]` for multiple. `""` / `[]` treated as absent (uncontrolled). */
    value?: string | string[];
    /** Initial selection when uncontrolled. */
    defaultValue?: string | string[];
    /** Fired with the next selection — a `string` for single, a `string[]` for multiple. */
    onValueChange?: (value: string | string[]) => void;
    /** Stack direction. @default "vertical" */
    orientation?: "vertical" | "horizontal";
    /** Disables the whole set; per-card disabled still keeps individual choices visible. @default false */
    disabled?: boolean;
    /** Error message; announces via role=alert and sets aria-invalid. */
    error?: string;
    /** Helper copy below the group; suppressed while error is set. */
    helperText?: string;
    /** Merged onto the fieldset. */
    className?: string;
    /** SelectableCard children. */
    children: React.ReactNode;
}
/**
 * A set of selectable cards. Single-select behaves as an exclusive radio set;
 * multiple toggles each card independently. Selection is owned here (controlled
 * or uncontrolled) and shared with the cards through context.
 */
export declare const SelectableCardGroup: React.FC<SelectableCardGroupProps>;
export interface SelectableCardProps extends Omit<CardProps, "onChange" | "link" | "linkLabel"> {
    /** Submitted value / selection key. */
    value: string;
    /** Per-card disable; the choice stays visible. @default false */
    disabled?: boolean;
    /** Standalone selected state when used outside a SelectableCardGroup. */
    selected?: boolean;
    /** Standalone change handler when used outside a SelectableCardGroup. */
    onSelectedChange?: (selected: boolean) => void;
}
/**
 * A Card that is one selectable option. Inside a SelectableCardGroup it reads
 * its selected state from context and submits `value`; standalone it is a
 * controlled checkbox-style toggle via `selected` / `onSelectedChange`. The
 * whole card is a label wrapping a visually-hidden native input, so keyboard,
 * focus, and form submission come from the platform.
 */
export declare const SelectableCard: React.FC<SelectableCardProps>;
export default SelectableCard;
//# sourceMappingURL=SelectableCard.d.ts.map