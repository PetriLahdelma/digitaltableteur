import React from "react";
import styles from "./GroupLabel.module.css";

export interface GroupLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** ID of the grouped control for label association */
  htmlFor: string;
  /** Optional browser tooltip; fallback when title is not set */
  tooltipText?: string;
  /** Shows the required asterisk. @default false */
  required?: boolean;
  /** Muted disabled styling. @default false */
  disabled?: boolean;
  /** Native title attribute override */
  title?: string;
}

/**
 * Fieldset/legend-style label for grouped form controls.
 */
export const GroupLabel: React.FC<GroupLabelProps> = ({
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

GroupLabel.displayName = "GroupLabel";

export default GroupLabel;
