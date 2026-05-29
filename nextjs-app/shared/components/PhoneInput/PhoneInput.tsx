import React from "react";
import PhoneInputLib from "react-phone-number-input";
import type { Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styles from "./PhoneInput.module.css";
import Label from "@dt/Label/Label";
import HelperText from "@dt/HelperText/HelperText";

export interface PhoneInputProps {
  label: string;
  value?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string | undefined) => void;
}

/**
 * PhoneInput component.
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  error,
  helperText,
  placeholder,
  disabled = false,
  onChange,
}) => {
  const handleChange = (phoneValue: Value) => {
    onChange?.(phoneValue);
  };

  return (
    <div className={styles["phone-input-container"]}>
      <Label
        htmlFor={label}
        required={!!error}
        tooltipText={error}
        disabled={disabled}
      >
        {label}
      </Label>
      <PhoneInputLib
        id={label}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${styles["phone-input"]} ${error ? styles.error : ""}`}
        international
        defaultCountry="FI"
      />
      {error && <span className={styles["errorMessage"]}>{error}</span>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </div>
  );
};

export default PhoneInput;
