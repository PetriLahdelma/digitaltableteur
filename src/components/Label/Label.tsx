import React from "react";
import styles from "./Label.module.css";

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
  tooltipText?: string;
  required?: boolean;
  disabled?: boolean;
  title?: string; // Add title for browser tooltips
}

const Label: React.FC<LabelProps> = ({
  htmlFor,
  children,
  tooltipText,
  required,
  disabled = false,
  title,
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`${styles.label} ${disabled ? styles.disabled : ""}`}
      title={title || tooltipText} // Use title or fallback to tooltipText
    >
      {children}
      {required && <span className={styles.required}>*</span>}
    </label>
  );
};

export default Label;
