import React from "react";
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "checked" | "size"> {
    /** Label text displayed next to the checkbox */
    label?: string;
    /** Whether to show the label text. @default true */
    showLabel?: boolean;
    /** Checked state (controlled). */
    checked?: boolean;
    /** Indeterminate (mixed) state. @default false */
    indeterminate?: boolean;
    /** Disables interaction and dims the control. @default false */
    disabled?: boolean;
    /** Initial checked state for uncontrolled use. */
    defaultChecked?: boolean;
    /** Size. @default "md" */
    size?: "sm" | "md" | "lg";
    /** Called with the next checked value when toggled. */
    onCheckedChange?: (checked: boolean) => void;
    /** Custom ID for the checkbox element; auto-generated when omitted */
    id?: string;
    /** Error message under the control; sets aria-invalid and aria-describedby. */
    error?: string;
    /** Supporting text under the control; always rendered, below `error` when both are set. */
    helperText?: string;
}
/** Accessible checkbox with label, sizes, and indeterminate state. */
declare const Checkbox: React.ForwardRefExoticComponent<CheckboxProps & React.RefAttributes<HTMLInputElement>>;
export default Checkbox;
//# sourceMappingURL=Checkbox.d.ts.map