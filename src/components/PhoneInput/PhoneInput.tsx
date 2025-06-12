import React, { useState } from "react";
import styles from "./PhoneInput.module.css";
import Label from "../Label/Label";

type PhoneInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
}) => {
  const [error, setError] = useState("");

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9+\s]{1}[0-9\s]{0,15}$/; // Accepts numbers 0-9, spaces, and optional '+' at the start
    return phoneRegex.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (validatePhoneNumber(newValue)) {
      setError("");
      onChange(newValue);
    } else {
      setError("Invalid phone number format");
    }
  };

  return (
    <div className={styles["phone-input-container"]}>
      <Label htmlFor={label} tooltipText={error} required={!!error}>
        {label}
      </Label>
      <input
        type="tel"
        className={`${styles["phone-input-field"]} ${error ? styles.error : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
      {error && <span className={styles["error-message"]}>{error}</span>}
    </div>
  );
};

export default PhoneInput;
