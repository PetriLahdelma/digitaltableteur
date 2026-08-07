import React from "react";
import type { SizeUnified } from "../../utils/sizeNormalization";
export type RadioGroupOption = {
    value: string;
    label: string;
    disabled?: boolean;
};
export interface RadioGroupProps {
    /** Native form field name shared by the set; auto-generated when omitted */
    name?: string;
    /** Group label rendered as the fieldset legend */
    legend: string;
    /** Radio options; per-option disabled keeps the choice visible */
    options: RadioGroupOption[];
    /** Controlled selected value; "" is treated as absent (uncontrolled) */
    value?: string;
    /** Initial value when uncontrolled */
    defaultValue?: string;
    /** Fired with the next value when selection changes */
    onValueChange?: (value: string) => void;
    /** Stack direction. @default "vertical" */
    orientation?: "vertical" | "horizontal";
    /** Radio control size. @default "md" */
    size?: SizeUnified;
    /** Disables the whole set. @default false */
    disabled?: boolean;
    /** Error message; announces via role=alert and sets aria-invalid */
    error?: string;
    /** Helper copy below the group; always rendered, alongside error when both are set */
    helperText?: string;
    /** Merged onto the fieldset */
    className?: string;
}
/** Accessible radio set with legend, helper, and error text. */
declare const RadioGroup: React.FC<RadioGroupProps>;
export default RadioGroup;
//# sourceMappingURL=RadioGroup.d.ts.map