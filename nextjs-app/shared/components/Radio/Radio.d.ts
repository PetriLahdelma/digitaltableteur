import React from "react";
import { type SizeUnified } from "../../utils/sizeNormalization";
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "onChange"> {
    /** Option label */
    label: string;
    /** Submitted value when selected */
    value: string;
    /** Group name; must match siblings to form the exclusive set */
    name: string;
    /** Checked state (controlled); use inside RadioGroup for sets. */
    checked?: boolean;
    /** Initial checked state (uncontrolled mode only) */
    defaultChecked?: boolean;
    /** Disables interaction and dims the control. @default false */
    disabled?: boolean;
    /** Control hit area. @default "md" */
    size?: SizeUnified;
    /** Fired with the next checked value when selection changes */
    onCheckedChange?: (checked: boolean) => void;
    /** Render the visible label. @default true */
    showLabel?: boolean;
}
/** Single radio control — use inside RadioGroup for sets. */
declare const Radio: React.ForwardRefExoticComponent<RadioProps & React.RefAttributes<HTMLInputElement>>;
export default Radio;
//# sourceMappingURL=Radio.d.ts.map