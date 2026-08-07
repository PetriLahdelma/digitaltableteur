import React from "react";
export interface MultiComboboxOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export interface MultiComboboxProps {
    /** Field label; associates the input */
    label: string;
    /** Selectable options */
    options: MultiComboboxOption[];
    /** Selected values (controlled) */
    value: string[];
    /** Called with the next selected values */
    onValueChange: (value: string[]) => void;
    /** Explicit control id (wires the label); auto-generated when omitted */
    id?: string;
    /** Shown when nothing is selected */
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
/** Combobox for choosing multiple options — chips in the field, type-to-filter dropdown. */
export declare function MultiCombobox({ label, options, value, onValueChange, id: providedId, placeholder, helperText, error, required, disabled, className, }: MultiComboboxProps): React.JSX.Element;
export declare namespace MultiCombobox {
    var displayName: string;
}
export default MultiCombobox;
//# sourceMappingURL=MultiCombobox.d.ts.map