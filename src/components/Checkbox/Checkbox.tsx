import React, { forwardRef, useEffect } from "react";
import Label from "@dt/Label";
import styles from "./Checkbox.module.css";

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "checked"
  > {
  label?: string;
  showLabel?: boolean;
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      showLabel = true,
      checked,
      indeterminate,
      onCheckedChange,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    useEffect(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.indeterminate = indeterminate || false;
        ref.current.checked = checked;
      }
    }, [indeterminate, checked, ref]);

    const handleClick = () => {
      if (indeterminate && ref && typeof ref !== "function" && ref.current) {
        ref.current.indeterminate = false;
        onCheckedChange(false); // Reset to unchecked when clicked
      }
    };

    return (
      <div className={styles["checkboxContainer"]}>
        <input
          id={props.id || "checkbox"}
          type="checkbox"
          className={styles.checkbox}
          ref={ref}
          checked={checked}
          onClick={handleClick}
          onChange={(e) => {
            const isChecked = e.target.checked;
            if (onCheckedChange) {
              onCheckedChange(isChecked);
            }
          }}
          disabled={disabled}
          {...props}
        />
        <Label
          htmlFor={props.id || "checkbox"}
          disabled={disabled}
          className={styles.label}
        >
          {showLabel && label}
        </Label>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
