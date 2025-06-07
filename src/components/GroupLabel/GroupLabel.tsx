import React from "react";
import styles from "./GroupLabel.module.css";

interface GroupLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  tooltipText?: string;
  required?: boolean;
  disabled?: boolean;
  title?: string; // Add title for browser tooltips
}

const GroupLabel: React.FC<GroupLabelProps> = ({ htmlFor, children, tooltipText, required, disabled = false, title }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`${styles["group-label"]} ${disabled ? styles.disabled : ""}`}
      title={title || tooltipText} // Use title or fallback to tooltipText
    >
      {children}
      {required && <span className={styles.required}>*</span>}
    </label>
  );
};

export default GroupLabel;
