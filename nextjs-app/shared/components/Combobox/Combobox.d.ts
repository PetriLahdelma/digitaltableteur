import React from "react";
export interface ComboboxOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface ComboboxProps {
    /** Field label; associates the trigger */
    label: string;
    /** Selectable options */
    options: ComboboxOption[];
    /** Selected option value (controlled); "" shows the placeholder */
    value: string;
    /** Called with the chosen value */
    onValueChange: (value: string) => void;
    /** Explicit control id (wires the label); auto-generated when omitted */
    id?: string;
    /** Shown when no value is selected */
    placeholder?: string;
    /** Assistive text below the field */
    helperText?: string;
    /** Error message; renders above the helper line and sets aria-invalid */
    error?: string;
    /** Marks the field required. @default false */
    required?: boolean;
    /** Disables the control. @default false */
    disabled?: boolean;
    /** Classes on the field wrapper */
    className?: string;
}
/** Single-select combobox with portaled dropdown (matches MultiCombobox UX). */
export declare const Combobox: React.ForwardRefExoticComponent<ComboboxProps & React.RefAttributes<HTMLButtonElement>>;
export default Combobox;
//# sourceMappingURL=Combobox.d.ts.map