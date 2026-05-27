import { cva } from "class-variance-authority";

export const labelVariants = cva("", {
  variants: { size: { sm: "", md: "", lg: "" } },
  defaultVariants: { size: "md" },
});

import React from "react";
import styles from "./Label.module.css";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor: string;
  tooltipText?: string;
  required?: boolean;
  disabled?: boolean;
}

/** Form field label with required, disabled, and tooltip affordances. */
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
      {required && (
        <>
          <span aria-hidden="true" className={styles.required}>
            *
          </span>
          <span className={styles.srOnly}>(required)</span>
        </>
      )}
    </label>
  );
};

export default Label;
