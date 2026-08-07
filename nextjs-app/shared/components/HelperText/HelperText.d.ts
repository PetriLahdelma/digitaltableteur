import React from "react";
export type HelperTextState = "error" | "warning" | "success" | "info";
export interface HelperTextProps {
    /**
     * The helper text content to display
     */
    children: React.ReactNode;
    /**
     * Optional ID for aria-describedby association
     */
    id?: string;
    /**
     * Additional CSS class name
     */
    className?: string;
    /**
     * Semantic state of the helper text (error, warning, success, info)
     * Default is neutral/no state
     */
    state?: HelperTextState;
}
/** Semantic helper copy for form fields (error, warning, success, info). */
declare const HelperText: React.ForwardRefExoticComponent<HelperTextProps & React.RefAttributes<HTMLParagraphElement>>;
export default HelperText;
//# sourceMappingURL=HelperText.d.ts.map