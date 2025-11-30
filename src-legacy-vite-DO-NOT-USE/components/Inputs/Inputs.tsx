import React, { useCallback, useEffect, useState } from "react";
import styles from "./Inputs.module.css";
import Label from "@dt/Label";
import HelperText from "@dt/HelperText";
import { useTranslation } from "react-i18next";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  type: "text" | "number" | "email" | "password" | "search" | "tel";
  value?: string | number;
  error?: string;
  helperText?: string;
  // eslint-disable-next-line no-unused-vars
  onChange?: (value: string | number) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  type,
  placeholder,
  value,
  error,
  helperText,
  onChange,
  disabled = false,
  ...rest
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string | number>(value ?? "");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const formatPhoneNumber = useCallback((raw: string) => {
    const trimmed = raw.trim();
    const hasPlus = trimmed.startsWith("+");
    const digits = trimmed.replace(/\D/g, "").slice(0, 15);

    if (!digits) {
      return hasPlus ? "+" : "";
    }

    const segments: string[] = [];
    const country = digits.slice(0, 3);
    const rest = digits.slice(3);

    if (country) segments.push(country);
    if (rest) {
      const groups = [
        rest.slice(0, 2),
        rest.slice(2, 5),
        rest.slice(5, 9),
        rest.slice(9, 13),
        rest.slice(13, 15),
      ].filter(Boolean);
      segments.push(...groups);
    }

    const formatted = segments.join(" ").trim();
    return hasPlus ? `+${formatted}` : formatted;
  }, []);

  useEffect(() => {
    if (type === "tel") {
      setInputValue(formatPhoneNumber(String(value ?? "")));
      setPhoneError("");
      return;
    }
    setInputValue(value ?? "");
  }, [formatPhoneNumber, type, value]);

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex =
      /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
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
      const formatted = formatPhoneNumber(e.target.value);
      const digits = formatted.replace(/\D/g, "");
      const hasInvalidChars = /[^\d+\s()-]/.test(e.target.value);

      setInputValue(formatted);
      if (onChange) onChange(formatted);

      if (hasInvalidChars || (digits && !validatePhoneNumber(formatted))) {
        setPhoneError(t("inputValidationPhoneInvalid"));
      } else {
        setPhoneError("");
      }
    } else if (type === "email") {
      setInputValue(e.target.value);
      if (onChange) onChange(e.target.value);

      // Validate email format if field is not empty
      if (e.target.value.trim() !== "") {
        if (validateEmail(e.target.value)) {
          setEmailError("");
        } else {
          setEmailError(t("inputValidationEmailInvalid"));
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
      {helperText && !error && !phoneError && !emailError && (
        <HelperText>{helperText}</HelperText>
      )}
    </div>
  );
};

export default Input;
