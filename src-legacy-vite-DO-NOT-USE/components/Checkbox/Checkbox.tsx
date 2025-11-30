import React, { forwardRef, useEffect, useRef } from "react";
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
    // local ref so component always has access to the input element even when no ref
    // is forwarded from the parent
    const innerRef = useRef<HTMLInputElement | null>(null);

    // combine forwarded ref and local ref
    const setRefs = (el: HTMLInputElement | null) => {
      innerRef.current = el;
      if (!ref) return;
      if (typeof ref === "function") {
        try {
          ref(el);
        } catch (err) {
          // ignore
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - assign to forwarded ref object
        ref.current = el;
      }
    };

    useEffect(() => {
      const element = innerRef.current;
      if (!element) return;

      // Set indeterminate property (native property, not an attribute)
      element.indeterminate = !!indeterminate;

      // Update visual state classes - CSS handles all styling
      if (indeterminate) {
        element.classList.remove(styles.checkedState);
        element.classList.add(styles.indeterminateState);
      } else if (checked) {
        element.classList.remove(styles.indeterminateState);
        element.classList.add(styles.checkedState);
      } else {
        element.classList.remove(styles.indeterminateState);
        element.classList.remove(styles.checkedState);
      }
    }, [checked, indeterminate, props.id]);

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      const element = innerRef.current;
      if (indeterminate && element) {
        // Clear indeterminate and notify parent. Do NOT prevent default so the
        // browser can toggle the native checked state and the change event will
        // fire and keep everything consistent.
        element.indeterminate = false;
        element.classList.remove(styles.indeterminateState);
        // Notify parent that checkbox should be checked; parent may set checked
        // prop accordingly in response to the onChange event which follows.
        if (onCheckedChange) onCheckedChange(true);
      }
    };

    return (
      <div className={styles["checkboxContainer"]}>
        <input
          id={props.id || "checkbox"}
          type="checkbox"
          className={`${styles.checkbox} ${checked ? styles.checkedState : ""}`}
          ref={setRefs}
          checked={checked}
          onClick={handleClick}
          onChange={(e) => {
            const isChecked = e.target.checked;

            // Update the visual state classes - CSS handles all styling
            const element = innerRef.current;
            if (element) {
              // Clear indeterminate state when user clicks
              element.indeterminate = false;

              if (isChecked) {
                element.classList.add(styles.checkedState);
              } else {
                element.classList.remove(styles.checkedState);
              }
            }

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
