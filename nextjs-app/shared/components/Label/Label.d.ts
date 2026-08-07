import React from "react";
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    /** id of the form control this label describes. */
    htmlFor: string;
    /** Native tooltip text; used as a fallback when `title` is not set. */
    tooltipText?: string;
    /** Appends a "*" marker plus an sr-only "(required)" hint. @default false */
    required?: boolean;
    /** Dims the label and shows a not-allowed cursor. @default false */
    disabled?: boolean;
}
/** Form field label with required, disabled, and tooltip affordances. */
declare const Label: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLLabelElement>>;
export default Label;
//# sourceMappingURL=Label.d.ts.map