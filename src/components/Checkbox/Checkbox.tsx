import React, { forwardRef, useEffect } from "react";
import Label from "../Label/Label";
import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  label?: string;
  showLabel?: boolean;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, showLabel = true, checked, indeterminate, onChange }, ref) => {
    useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        ref.current.indeterminate = indeterminate || false;
        ref.current.checked = checked;
      }
    }, [indeterminate, ref]);

    const handleClick = () => {
      if (indeterminate && ref && "current" in ref && ref.current) {
        ref.current.indeterminate = false;
        onChange(false); // Reset to unchecked when clicked
      }
    };

    return (
      <div className={styles["checkbox-container"]}>
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
        />
        {showLabel && label && (
          <Label htmlFor="checkbox" disabled={false} className={styles.label}>
            {label}
          </Label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
