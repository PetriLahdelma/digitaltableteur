import React from "react";
import styles from "./GroupLabel.module.css";

interface GroupLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
  tooltipText?: string;
  required?: boolean;
  disabled?: boolean;
  title?: string; // Add title for browser tooltips
}

const GroupLabel: React.FC<GroupLabelProps> = ({
  htmlFor,
  children,
  tooltipText,
  required,
  disabled = false,
  title,
  ...rest
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`${styles["groupLabel"]} ${disabled ? styles.disabled : ""}`}
      title={title || tooltipText} // Use title or fallback to tooltipText
      {...rest}
    >
      {children}
      {required && <span className={styles.required}>*</span>}
    </label>
  );
};

export default GroupLabel;
