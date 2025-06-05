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
  (
    { label, showLabel = true, checked, indeterminate = false, onChange },
    ref
  ) => {
    useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    return (
      <div className={styles.checkboxContainer}>
        <input
          type="checkbox"
          ref={ref}
          className={styles.checkbox}
          checked={checked}
          aria-checked={indeterminate ? "mixed" : checked}
          onChange={(e) => {
            if (ref && "current" in ref && ref.current) {
              ref.current.indeterminate = false;
            }
            if (onChange) {
              onChange(e.target.checked);
            }
          }}
        />
        {showLabel && label && (
          <Label htmlFor="checkbox" disabled={false}>
            {label}
          </Label>
        )}
      </div>
    );
  }
);

export default Checkbox;
