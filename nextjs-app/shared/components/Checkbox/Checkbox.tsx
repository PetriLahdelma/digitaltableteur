import React, { forwardRef, useEffect, useId, useRef, useState } from "react";
import Label from "@dt/Label";
import HelperText from "@dt/HelperText";
import styles from "./Checkbox.module.css";

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "checked" | "size"
  > {
  label?: string;
  showLabel?: boolean;
  /** Checked state (controlled). */
  checked?: boolean;
  /** Indeterminate (mixed) state. @default false */
  indeterminate?: boolean;
  /** Disables interaction and dims the control. @default false */
  disabled?: boolean;
  /** Initial checked state for uncontrolled use. */
  defaultChecked?: boolean;
  /** Size. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Called with the next checked value when toggled. */
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
  /** Error message under the control; sets aria-invalid and aria-describedby. */
  error?: string;
  /** Supporting text under the control; suppressed while `error` is set. */
  helperText?: string;
}

/** Accessible checkbox with label, sizes, and indeterminate state. */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      showLabel = true,
      checked,
      indeterminate,
      disabled = false,
      defaultChecked,
      size = "md",
      onCheckedChange,
      error,
      helperText,
      ...props
    },
    ref,
  ) => {
    // Uncontrolled state management
    const [internalChecked, setInternalChecked] = useState(
      defaultChecked ?? false,
    );
    const isControlled = checked !== undefined;
    const actualChecked = isControlled ? checked : internalChecked;
    // Stable fallback id so multiple unlabeled-id Checkbox siblings (e.g. in
    // FormField group mode) don't collide on a shared literal id, which would
    // break label association for all but the first instance.
    const generatedId = useId();
    const id = props.id ?? generatedId;
    // Local ref so the component can reach the input element even when the
    // parent does not forward a ref.
    const innerRef = useRef<HTMLInputElement | null>(null);

    // Merge the forwarded ref with the local ref.
    const setRefs = (el: HTMLInputElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
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
      } else if (actualChecked) {
        element.classList.remove(styles.indeterminateState);
        element.classList.add(styles.checkedState);
      } else {
        element.classList.remove(styles.indeterminateState);
        element.classList.remove(styles.checkedState);
      }
    }, [actualChecked, indeterminate, props.id]);

    const handleClick = () => {
      const element = innerRef.current;
      if (indeterminate && element) {
        // Clear indeterminate and notify parent. Do NOT prevent default so the
        // browser can toggle the native checked state and the change event will
        // fire and keep everything consistent.
        element.indeterminate = false;
        element.classList.remove(styles.indeterminateState);
        onCheckedChange?.(true);
      }
    };

    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    const describedBy =
      [
        error ? errorId : null,
        helperText && !error ? helperId : null,
        props["aria-describedby"],
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <>
      <div className={styles["checkboxContainer"]}>
        <input
          type="checkbox"
          className={`${styles.checkbox} ${styles[`checkbox--${size}`]} ${actualChecked ? styles.checkedState : ""}`}
          ref={setRefs}
          checked={actualChecked}
          onClick={handleClick}
          onChange={(e) => {
            const nextChecked = e.target.checked;

            // Update the visual state classes - CSS handles all styling
            const element = innerRef.current;
            if (element) {
              // Clear indeterminate state when user clicks
              element.indeterminate = false;

              if (nextChecked) {
                element.classList.add(styles.checkedState);
              } else {
                element.classList.remove(styles.checkedState);
              }
            }

            // Update internal state for uncontrolled mode
            if (!isControlled) {
              setInternalChecked(nextChecked);
            }

            onCheckedChange?.(nextChecked);
          }}
          disabled={disabled}
          {...props}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : props["aria-invalid"]}
        />
        <Label
          htmlFor={id}
          disabled={disabled}
          className={styles.label}
        >
          {showLabel && label}
        </Label>
      </div>
      {error ? (
        <HelperText id={errorId} state="error">
          {error}
        </HelperText>
      ) : helperText ? (
        <HelperText id={helperId}>{helperText}</HelperText>
      ) : null}
      </>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
