import React from "react";
export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
    /** Visible field label */
    label: string;
    /** Value synced into the field; typing still works after it is set */
    value?: string;
    /** Validation error message; renders above the helper line */
    error?: string;
    /** Helper copy below the field */
    helperText?: string;
    /** Change handler receiving the raw string value */
    onChange?: (value: string) => void;
    /** Enable smooth animated auto-growing (default: false) */
    animateResize?: boolean;
    /** Minimum number of rows when animateResize is enabled */
    minRows?: number;
    /** Maximum number of rows when animateResize is enabled */
    maxRows?: number;
}
/** Labeled multi-line text field with error/helper text and optional animated auto-grow. */
declare const TextArea: React.FC<TextAreaProps>;
export default TextArea;
//# sourceMappingURL=TextArea.d.ts.map