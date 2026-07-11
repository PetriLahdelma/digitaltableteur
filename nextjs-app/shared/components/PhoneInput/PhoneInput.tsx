import React, { useId } from "react";
import PhoneInputLib from "react-phone-number-input";
import type { Country, Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styles from "./PhoneInput.module.css";
import Label from "@dt/Label/Label";
import HelperText from "@dt/HelperText/HelperText";

export interface PhoneInputProps {
  /** Label text */
  label: string;
  /** Phone number value (E.164 format) */
  value?: string;
  /** Error message; renders above the helper line */
  error?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state. @default false */
  disabled?: boolean;
  /** Shows the required marker on the label. @default false */
  required?: boolean;
  /** Explicit control id (wires the label); auto-generated when omitted */
  id?: string;
  /** ISO 3166-1 alpha-2 code used when the value has no country prefix. @default "FI" */
  defaultCountry?: Country;
  onChange?: (value: string | undefined) => void;
}

/** International phone field: country selector + E.164-formatted input with field chrome. */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  error,
  helperText,
  placeholder,
  disabled = false,
  required = false,
  id: providedId,
  defaultCountry = "FI",
  onChange,
}) => {
  const generatedId = useId();
  const fieldId = providedId ?? `phone-input-${generatedId}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;
  const describedBy = [error ? errorId : null, helperText ? helperId : null]
    .filter(Boolean)
    .join(" ");

  const handleChange = (phoneValue: Value) => {
    onChange?.(phoneValue);
  };

  return (
    <div className={styles["phone-input-container"]}>
      <Label htmlFor={fieldId} required={required} disabled={disabled}>
        {label}
      </Label>
      <PhoneInputLib
        id={fieldId}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : undefined}
        className={`${styles["phone-input"]} ${error ? styles.error : ""}`}
        international
        defaultCountry={defaultCountry}
      />
      {error && (
        <HelperText id={errorId} state="error">
          {error}
        </HelperText>
      )}
      {helperText && (
        <HelperText id={helperId}>{helperText}</HelperText>
      )}
    </div>
  );
};

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
