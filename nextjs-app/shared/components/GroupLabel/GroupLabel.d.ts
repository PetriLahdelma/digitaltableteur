import React from "react";
export interface GroupLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    /** ID of the grouped control for label association */
    htmlFor: string;
    /** Optional browser tooltip; fallback when title is not set */
    tooltipText?: string;
    /** Shows the required asterisk. @default false */
    required?: boolean;
    /** Muted disabled styling. @default false */
    disabled?: boolean;
    /** Native title attribute override */
    title?: string;
}
/**
 * Fieldset/legend-style label for grouped form controls.
 */
export declare const GroupLabel: React.FC<GroupLabelProps>;
export default GroupLabel;
//# sourceMappingURL=GroupLabel.d.ts.map