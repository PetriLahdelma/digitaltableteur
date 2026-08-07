export declare const textInputVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
import React from "react";
import { type SizeUnified } from "../../utils/sizeNormalization";
export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
    /** Visible field label; also feeds the input name */
    label: string;
    /**
     * Native HTML input type. Telephone values format and email values validate
     * as the user types; date/time variants retain the browser's localized
     * picker and ISO-compatible submitted value.
     */
    type: "text" | "number" | "email" | "password" | "search" | "tel" | "date" | "datetime-local" | "time" | "month" | "week";
    /** Size variant for input */
    size?: SizeUnified;
    /** Value change handler (recommended) */
    onValueChange?: (value: string | number) => void;
    /** Initial value for uncontrolled component */
    defaultValue?: string | number;
    /** Controlled value; an initial "" is treated as absent (uncontrolled), later changes always sync in */
    value?: string | number;
    /** Validation error message; renders above the helper line and sets aria-invalid */
    error?: string;
    /** Helper copy below the field */
    helperText?: string;
    /** Disables the input. Declared explicitly (not just via the native attribute extension) so the agent-blocks prop extraction sees it. */
    disabled?: boolean;
    /** Shows a labelled ×-button inside the field chrome while the field has a value; clearing returns focus to the input */
    clearable?: boolean;
    /** Called after the clear button empties the field (onValueChange also fires with "") */
    onClear?: () => void;
    /** Visually hides the label (kept in the accessibility tree); use where surrounding design carries the affordance */
    hideLabel?: boolean;
    /** @deprecated Use onValueChange instead. Will be removed in v2.0.0 */
    onChange?: (value: string | number) => void;
}
/** Labeled text input with validation states and size tokens. */
declare const TextInput: React.FC<TextInputProps>;
export default TextInput;
//# sourceMappingURL=TextInput.d.ts.map