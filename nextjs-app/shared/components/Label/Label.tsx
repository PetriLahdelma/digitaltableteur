import React from "react";
import styles from "./Label.module.css";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** id of the form control this label describes. */
  htmlFor: string;
  /** Native tooltip text; used as a fallback when `title` is not set. */
  tooltipText?: string;
  /** Appends a "*" marker plus an sr-only "(required)" hint. @default false */
  required?: boolean;
  /** Dims the label and shows a not-allowed cursor. @default false */
  disabled?: boolean;
}

/** Form field label with required, disabled, and tooltip affordances. */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      htmlFor,
      children,
      className = "",
      tooltipText,
      required,
      disabled = false,
      title,
      ...rest
    },
    ref,
  ) => {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={[styles.label, disabled ? styles.disabled : "", className]
          .filter(Boolean)
          .join(" ")}
        title={title || tooltipText}
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
  },
);

Label.displayName = "Label";

export default Label;
