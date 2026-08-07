import { type ReactNode } from "react";
export interface FormFieldProps {
    /**
     * Accessible name for the group of controls, rendered as a `<fieldset>`
     * `<legend>`.
     */
    legend: string;
    /** The grouped controls; each keeps its own label. */
    children: ReactNode;
    /** Helper text shown under the legend. */
    groupDescription?: string;
    /** Group-level error message shown after the controls. */
    error?: string;
    /** Appends a visual asterisk to the legend. */
    required?: boolean;
    /** Disables every contained control via the fieldset. */
    disabled?: boolean;
    /** Merged onto the fieldset. */
    className?: string;
}
/**
 * Fieldset/legend wrapper for a GROUP of controls (radio groups, checkbox
 * clusters, composite fields).
 *
 * Field-wrapper convention (decided 2026-07-03): individual controls own their
 * own label / error / helperText chrome — TextInput, TextArea, Select,
 * Checkbox, Switch and friends all ship those props built in. FormField exists
 * only for the group case, where a shared accessible name must come from a
 * fieldset legend. Never nest a labeled control's own chrome inside another
 * label wrapper.
 */
export declare function FormField({ legend, children, groupDescription, error, required, disabled, className, }: FormFieldProps): import("react").JSX.Element;
export declare namespace FormField {
    var displayName: string;
}
//# sourceMappingURL=FormField.d.ts.map