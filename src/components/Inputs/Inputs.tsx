import React, { useState } from "react";
import styles from "./Inputs.module.css";
import Label from "../Label/Label";

interface InputProps {
  label: string;
  type: "text" | "number" | "email" | "password" | "search";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === "number" ? +e.target.value : e.target.value;
    setInputValue(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <div className={styles["input-container"]}>
      <Label
        htmlFor={label}
        required={!!error}
        tooltipText={error}
        disabled={disabled} // Pass 'disabled' prop to Label
      >
        {label}
      </Label>
      <input
        id={label}
        className={`${styles.input} ${error ? styles.error : ""}`}
        type={type}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        disabled={disabled} // Apply disabled prop
      />
      {error && <span className={styles["error-message"]}>{error}</span>}
    </div>
  );
};

export default Input;
