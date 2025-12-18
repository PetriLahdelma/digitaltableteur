import React from "react";
import styles from "./Label.module.css";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
  tooltipText?: string;
  required?: boolean;
  disabled?: boolean;
}

const Label: React.FC<LabelProps> = ({
  htmlFor,
  children,
  className = "",
  tooltipText,
  required,
  disabled = false,
  title,
  ...rest
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={[styles.label, disabled ? styles.disabled : "", className]
        .filter(Boolean)
        .join(" ")}
      title={title || tooltipText} // Use title or fallback to tooltipText
      {...rest}
    >
      {children}
      {required && <span className={styles.required}>*</span>}
    </label>
  );
};

export default Label;
