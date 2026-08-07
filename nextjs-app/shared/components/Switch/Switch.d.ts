import React from "react";
interface SwitchBaseProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
    /** Disables interaction and dims the control. @default false */
    disabled?: boolean;
    /** Shows a loading spinner and blocks interaction; sets `aria-busy`. @default false */
    loading?: boolean;
    /** Control size. @default "md" */
    size?: "sm" | "md" | "lg";
    /** Called with the next checked value when the switch is toggled. */
    onCheckedChange?: (checked: boolean) => void;
    /** Visible label. */
    label?: React.ReactNode;
    /** Where the label sits relative to the control. @default "right" */
    labelPlacement?: "right" | "left" | "top";
    /** Supporting text rendered beneath the control; always rendered, below `error` when both are set. */
    helperText?: string;
    /** Error message beneath the control; sets aria-invalid and aria-describedby. */
    error?: string;
}
type SwitchControlledProps = {
    /** Checked state for controlled use. Mutually exclusive with `defaultChecked`. */
    checked: boolean;
    defaultChecked?: never;
};
type SwitchUncontrolledProps = {
    checked?: never;
    /** Initial checked state for uncontrolled use. Mutually exclusive with `checked`. @default false */
    defaultChecked?: boolean;
};
/** Controlled or uncontrolled switch props; `checked` and `defaultChecked` cannot be combined. */
export type SwitchProps = SwitchBaseProps & (SwitchControlledProps | SwitchUncontrolledProps);
/** Toggle with label, helper text, and loading affordances. */
declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;
export default Switch;
//# sourceMappingURL=Switch.d.ts.map