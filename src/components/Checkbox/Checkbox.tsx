import React, { forwardRef, useEffect } from "react";
import Label from "../Label/Label";
import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  label?: string;
  showLabel?: boolean;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      showLabel = true,
      checked,
      indeterminate,
      onChange,
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
        onChange(false); // Reset to unchecked when clicked
      }
    };

    return (
      <div className={styles["checkboxContainer"]}>
        <input
          id="checkbox"
          type="checkbox"
          className={styles.checkbox}
          ref={ref}
          checked={checked}
          onClick={handleClick}
          onChange={(e) => {
            const isChecked = e.target.checked;
            if (onChange) {
              onChange(isChecked);
            }
          }}
          disabled={disabled}
          {...props}
        />
        <Label htmlFor="checkbox" disabled={disabled} className={styles.label}>
          {showLabel && label}
        </Label>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
