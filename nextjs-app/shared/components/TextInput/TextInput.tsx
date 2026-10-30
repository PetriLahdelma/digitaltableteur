import { cva } from "class-variance-authority";

export const textInputVariants = cva("", {
  variants: { size: { sm: "", md: "", lg: "" } },
  defaultVariants: { size: "md" },
});

import React, { useEffect, useId, useRef, useState } from "react";
import styles from "./TextInput.module.css";
import Icon from "@dt/Icon";
import {
  FieldShell,
  fieldDescribedBy,
  fieldSizeClass,
  fieldStatusClass,
  resolveFieldStatus,
  type FieldAction,
  type FieldStatus,
} from "@dt/FieldShell";
import { useTranslate } from "../../lib/translation";
import {
  parsePhoneNumber,
  formatIncompletePhoneNumber,
} from "libphonenumber-js";
import { warnPropRename } from "../../utils/deprecationWarning";
import {
  normalizeSizeProp,
  type SizeUnified,
} from "../../utils/sizeNormalization";
import { suggestEmailCorrection } from "../../utils/emailSuggestion";

/** Character widths a field can be capped to; "full" fills the container. */
export type TextInputWidth =
  "full" | "2ch" | "3ch" | "4ch" | "5ch" | "10ch" | "20ch" | "30ch";

export interface TextInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "size"
> {
  /** Visible field label; also feeds the input name */
  label: string;
  /**
   * Native HTML input type. Telephone values format and email values validate
   * as the user types; date/time variants retain the browser's localized
   * picker and ISO-compatible submitted value.
   */
  type:
    | "text"
    | "number"
    | "email"
    | "password"
    | "search"
    | "tel"
    | "date"
    | "datetime-local"
    | "time"
    | "month"
    | "week";

  // NEW PROPS (v1.1.0)
  /** Size variant for input */
  size?: SizeUnified;
  /** Value change handler (recommended) */
  onValueChange?: (value: string | number) => void;
  /** Initial value for uncontrolled component */
  defaultValue?: string | number;

  // EXISTING PROPS
  /** Controlled value; an initial "" is treated as absent (uncontrolled), later changes always sync in */
  value?: string | number;
  /** Validation error message; shorthand for status="error" with this message. Sets aria-invalid */
  error?: string;
  /** Semantic state: colours the border and styles statusMessage. `error` overrides it. */
  status?: FieldStatus;
  /** Message under the field for `status`, above the helper line */
  statusMessage?: string;
  /** Icon buttons at the end of the label row: each runs an operation or opens a menu */
  actions?: FieldAction[];
  /** Helper copy below the field */
  helperText?: string;
  /** Disables the input. Declared explicitly (not just via the native attribute extension) so the agent-blocks prop extraction sees it. */
  disabled?: boolean;

  // NEW PROPS (v1.2.0)
  /** Shows a labelled ×-button inside the field chrome while the field has a value; clearing returns focus to the input */
  clearable?: boolean;
  /** Called after the clear button empties the field (onValueChange also fires with "") */
  onClear?: () => void;
  /** Visually hides the label (kept in the accessibility tree); use where surrounding design carries the affordance */
  hideLabel?: boolean;

  // NEW PROPS (v1.3.0)
  /**
   * Widest the field grows, in characters of the expected answer (after the
   * GOV.UK input widths): "10ch" for a code, "30ch" for an email address. The
   * field still shrinks with its container. @default "full"
   */
  width?: TextInputWidth;

  // DEPRECATED PROPS
  /** @deprecated Use onValueChange instead. Will be removed in v2.0.0 */
  onChange?: (value: string | number) => void;
}

/** Labeled text input with validation states and size tokens. */
const TextInput: React.FC<TextInputProps> = ({
  label,
  type,
  placeholder,
  value,
  defaultValue,
  error,
  status,
  statusMessage,
  actions,
  helperText,
  // New props (v1.1.0)
  size = "md",
  onValueChange,
  clearable = false,
  onClear,
  hideLabel = false,
  width = "full",
  // Deprecated props
  onChange,
  disabled = false,
  ...rest
}) => {
  const t = useTranslate();

  // Generate stable unique IDs for accessibility
  const inputId = useId();

  // Deprecation warnings (development only)
  if (process.env.NODE_ENV !== "production") {
    if (onChange && !onValueChange) {
      warnPropRename("TextInput", "onChange", "onValueChange");
    }
  }

  const effectiveOnChange = onValueChange ?? onChange;
  const normalizedSize = normalizeSizeProp(size);

  // Controls convention: "" means absent AT MOUNT — an initial empty string
  // yields the uncontrolled path so defaultValue and canvas typing keep
  // working. Later value changes (including back to "") still sync in, so
  // consumers that clear a field by setting value="" keep that behavior.
  const [inputValue, setInputValue] = useState<string | number>(
    (value === "" ? undefined : value) ?? defaultValue ?? "",
  );
  const syncedOnce = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Built-in phone and email validation report as an error too.
  const field = resolveFieldStatus({
    status,
    statusMessage,
    error: error || phoneError || emailError,
  });
  const hasError = field.status === "error";
  const describedBy = fieldDescribedBy(inputId, {
    statusMessage: field.statusMessage,
    helperText,
  });

  useEffect(() => {
    // Skip the mount run so an initial "" doesn't clobber defaultValue.
    if (!syncedOnce.current) {
      syncedOnce.current = true;
      return;
    }
    if (value !== undefined) setInputValue(value);
  }, [value]);

  const validatePhoneNumber = (phone: string) => {
    try {
      const phoneNumber = parsePhoneNumber(phone);
      return phoneNumber?.isValid() ?? false;
    } catch {
      // If parsing fails, it's incomplete or invalid
      return phone.length === 0; // Empty is valid (not required)
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number;
    newValue = type === "number" ? +e.target.value : e.target.value;

    if (type === "tel") {
      const formatted = formatIncompletePhoneNumber(e.target.value);
      setInputValue(formatted);
      if (effectiveOnChange) effectiveOnChange(formatted);

      if (formatted && !validatePhoneNumber(formatted)) {
        setPhoneError(t("inputValidationPhoneInvalid"));
      } else {
        setPhoneError("");
      }
    } else if (type === "email") {
      setInputValue(e.target.value);
      if (effectiveOnChange) effectiveOnChange(e.target.value);

      // Validate email format if field is not empty
      if (e.target.value.trim() !== "") {
        if (validateEmail(e.target.value)) {
          setEmailError("");
        } else {
          // Check for typo suggestion first (WCAG 3.3.3: Error Suggestion)
          const suggestion = suggestEmailCorrection(e.target.value);
          if (suggestion) {
            setEmailError(
              t("contactValidationEmailSuggestion", { suggestion }),
            );
          } else {
            setEmailError(t("inputValidationEmailInvalid"));
          }
        }
      } else {
        setEmailError("");
      }
    } else {
      setInputValue(newValue);
      if (effectiveOnChange) effectiveOnChange(newValue);
    }
  };

  const handleClear = () => {
    setInputValue("");
    setPhoneError("");
    setEmailError("");
    if (effectiveOnChange) effectiveOnChange("");
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  const showClearButton = clearable && !disabled && inputValue !== "";
  // The cap sits on the outermost field box: the shell when clearable, so the
  // clear button stays inside the narrowed field.
  const widthClass =
    width === "full" ? "" : `${styles.capped} ${styles[`width--${width}`]}`;

  const inputElement = (
    <input
      ref={inputRef}
      id={inputId}
      name={label.replace(/\s+/g, "-").toLowerCase()}
      className={[
        styles.input,
        fieldSizeClass(normalizedSize),
        clearable ? styles.inputClearable : widthClass,
        fieldStatusClass(field.status),
      ]
        .filter(Boolean)
        .join(" ")}
      type={type}
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      disabled={disabled}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
      {...rest}
    />
  );

  return (
    <FieldShell
      controlId={inputId}
      label={label}
      required={!!rest.required}
      disabled={disabled}
      hideLabel={hideLabel}
      status={field.status}
      statusMessage={field.statusMessage}
      helperText={helperText}
      actions={actions}
    >
      {/* Non-clearable consumers keep the bare input (no wrapper). */}
      {clearable ? (
        <div className={`${styles.inputShell} ${widthClass}`}>
          {inputElement}
          {showClearButton && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label={t("inputClearField", { field: label })}
            >
              <Icon name="x" size={16} decorative />
            </button>
          )}
        </div>
      ) : (
        inputElement
      )}
    </FieldShell>
  );
};

TextInput.displayName = "TextInput";

export default TextInput;
