import { cva } from "class-variance-authority";

export const textInputVariants = cva("", {
  variants: { size: { sm: "", md: "", lg: "" } },
  defaultVariants: { size: "md" },
});

import React, { useEffect, useId, useState } from "react";
import styles from "./TextInput.module.css";
import Label from "@dt/Label";
import HelperText from "@dt/HelperText";
import { useTranslation } from "react-i18next";
import {
  parsePhoneNumber,
  formatIncompletePhoneNumber,
} from "libphonenumber-js";
import { warnPropRename } from "../../utils/deprecationWarning";
import { normalizeSizeProp, type SizeUnified } from "../../utils/sizeNormalization";
import { suggestEmailCorrection } from "../../utils/emailSuggestion";

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  label: string;
  type: "text" | "number" | "email" | "password" | "search" | "tel";

  // NEW PROPS (v1.1.0)
  /** Size variant for input */
  size?: SizeUnified;
  /** Value change handler (recommended) */
  onValueChange?: (value: string | number) => void;
  /** Initial value for uncontrolled component */
  defaultValue?: string | number;

  // EXISTING PROPS
  value?: string | number;
  error?: string;
  helperText?: string;

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
  helperText,
  // New props (v1.1.0)
  size = "md",
  onValueChange,
  // Deprecated props
  onChange,
  disabled = false,
  ...rest
}) => {
  const { t } = useTranslation();

  // Generate stable unique IDs for accessibility
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  // Deprecation warnings (development only)
  if (process.env.NODE_ENV !== "production") {
    if (onChange && !onValueChange) {
      warnPropRename("TextInput", "onChange", "onValueChange");
    }
  }

  const effectiveOnChange = onValueChange ?? onChange;
  const normalizedSize = normalizeSizeProp(size);

  const [inputValue, setInputValue] = useState<string | number>(
    value ?? defaultValue ?? ""
  );
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Compute error state for ARIA attributes
  const hasError = !!(error || phoneError || emailError);
  const errorMessage = error || phoneError || emailError;

  // Compute aria-describedby - link to error or helper text
  const describedBy = [
    hasError && errorId,
    helperText && !hasError && helperId,
  ].filter(Boolean).join(' ') || undefined;

  useEffect(() => {
    setInputValue(value ?? "");
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
            setEmailError(t("contactValidationEmailSuggestion", { suggestion }));
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

  return (
    <div className={styles.inputContainer}>
      <Label
        htmlFor={inputId}
        required={!!rest.required}
        disabled={disabled}
      >
        {label}
      </Label>
      <input
        id={inputId}
        name={label.replace(/\s+/g, "-").toLowerCase()}
        className={`${styles.input} ${styles[`input--${normalizedSize}`]} ${hasError ? styles.error : ""}`}
        type={type}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hasError && (
        <HelperText id={errorId} state="error">
          {errorMessage}
        </HelperText>
      )}
      {helperText && !hasError && (
        <HelperText id={helperId}>{helperText}</HelperText>
      )}
    </div>
  );
};

TextInput.displayName = "TextInput";

export default TextInput;
