import React, { useState } from "react";
import styles from "./Inputs.module.css";
import Label from "../Label/Label";

interface TextAreaProps {
  label: string;
  placeholder?: string;
  value?: string;
  error?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  rows?: number;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  placeholder,
  value = "",
  error,
  onChange,
  disabled = false,
  rows = 4,
}) => {
  const [textValue, setTextValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className={styles["input-container"]}>
      <Label
        htmlFor={label}
        required={!!error}
        tooltipText={error}
        disabled={disabled}
      >
        {label}
      </Label>
      <textarea
        id={label}
        className={`${styles.input} ${error ? styles.error : ""}`}
        placeholder={placeholder}
        value={textValue}
        onChange={handleChange}
        disabled={disabled}
        rows={rows}
      />
      {error && <span className={styles["error-message"]}>{error}</span>}
    </div>
  );
};

export default TextArea;
