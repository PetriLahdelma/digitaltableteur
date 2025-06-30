import React, { useState } from "react";
import styles from "./Inputs.module.css";
import Label from "../Label/Label";

interface InputProps {
  label: string;
  type: "text" | "number" | "email" | "password" | "search" | "tel";
  placeholder?: string;
  value?: string | number;
  error?: string;
  // eslint-disable-next-line no-unused-vars
  onChange?: (value: string | number) => void;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  type,
  placeholder,
  value,
  error,
  onChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [phoneError, setPhoneError] = useState("");

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9+\s]{1}[0-9\s]{0,15}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number;
    newValue = type === "number" ? +e.target.value : e.target.value;
    if (type === "tel") {
      if (validatePhoneNumber(e.target.value)) {
        setPhoneError("");
        setInputValue(e.target.value);
        if (onChange) onChange(e.target.value);
      } else {
        setPhoneError("Invalid phone number format");
        setInputValue(e.target.value);
        if (onChange) onChange(e.target.value);
      }
    } else {
      setInputValue(newValue);
      if (onChange) onChange(newValue);
    }
  };

  return (
    <div className={styles["input-container"]}>
      <Label
        htmlFor={label}
        required={!!error || !!phoneError}
        tooltipText={error || phoneError}
        disabled={disabled}
      >
        {label}
      </Label>
      <input
        id={label}
        name={label.replace(/\s+/g, "-").toLowerCase()}
        className={`${styles.input} ${error || phoneError ? styles.error : ""}`}
        type={type}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
      />
      {(error || phoneError) && (
        <span className={styles["errorMessage"]}>{error || phoneError}</span>
      )}
    </div>
  );
};

export default Input;
