import React, { useEffect, useState } from "react";
import styles from "./Inputs.module.css";
import Label from "@dt/Label";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  type: "text" | "number" | "email" | "password" | "search" | "tel";
  value?: string | number;
  error?: string;
  // eslint-disable-next-line no-unused-vars
  onChange?: (value: string | number) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  type,
  placeholder,
  value,
  error,
  onChange,
  disabled = false,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState<string | number>(value ?? "");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9+\s]{1}[0-9\s]{0,15}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
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
    } else if (type === "email") {
      setInputValue(e.target.value);
      if (onChange) onChange(e.target.value);

      // Validate email format if field is not empty
      if (e.target.value.trim() !== "") {
        if (validateEmail(e.target.value)) {
          setEmailError("");
        } else {
          setEmailError("Please enter a valid email address");
        }
      } else {
        setEmailError("");
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
        required={!!error || !!phoneError || !!emailError}
        tooltipText={error || phoneError || emailError}
        disabled={disabled}
      >
        {label}
      </Label>
      <input
        id={label}
        name={label.replace(/\s+/g, "-").toLowerCase()}
        className={`${styles.input} ${error || phoneError || emailError ? styles.error : ""}`}
        type={type}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        {...rest}
      />
      {(error || phoneError || emailError) && (
        <span className={styles["errorMessage"]}>
          {error || phoneError || emailError}
        </span>
      )}
    </div>
  );
};

export default Input;
