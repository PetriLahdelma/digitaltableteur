import React from "react";
import { type SizeUnified } from "../../utils/sizeNormalization";
export interface SelectOptionItem {
    value: string;
    label: string;
    /** Disables this option. */
    disabled?: boolean;
}
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "size"> {
    /** Label text displayed above the select dropdown */
    label: string;
    /** Option objects with value, label, and optional disabled; children override this */
    options?: SelectOptionItem[];
    /** Supporting text under the control; always rendered, below `error` when both are set. */
    helperText?: string;
    /** Error message under the control; sets aria-invalid and aria-describedby. */
    error?: string;
    /** Size variant for select */
    size?: SizeUnified;
    /** Value change handler (recommended) */
    onValueChange?: (value: string) => void;
    /** Disables the select. Declared explicitly (not just via the native attribute extension) so the agent-blocks prop extraction sees it. */
    disabled?: boolean;
    /** @deprecated Use onValueChange instead. Will be removed in v2.0.0 */
    onChange?: (value: string) => void;
}
/** Native select with label, options, and error/helper text. */
declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
export default Select;
//# sourceMappingURL=Select.d.ts.map