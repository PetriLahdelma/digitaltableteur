import React from "react";
import type { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";
export interface PhoneInputProps {
    /** Label text */
    label: string;
    /** Phone number value (E.164 format) */
    value?: string;
    /** Error message; renders above the helper line */
    error?: string;
    /** Helper text below the input */
    helperText?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Disabled state. @default false */
    disabled?: boolean;
    /** Shows the required marker on the label. @default false */
    required?: boolean;
    /** Explicit control id (wires the label); auto-generated when omitted */
    id?: string;
    /** ISO 3166-1 alpha-2 code used when the value has no country prefix. @default "FI" */
    defaultCountry?: Country;
    onChange?: (value: string | undefined) => void;
}
/** International phone field: country selector + E.164-formatted input with field chrome. */
export declare const PhoneInput: React.FC<PhoneInputProps>;
export default PhoneInput;
//# sourceMappingURL=PhoneInput.d.ts.map