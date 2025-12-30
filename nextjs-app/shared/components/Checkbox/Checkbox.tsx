import React, { forwardRef, useEffect, useRef, useState } from "react";
import Label from "@dt/Label";
import styles from "./Checkbox.module.css";
import { warnPropRename } from "../../utils/deprecationWarning";
import { normalizeSizeProp, type SizeUnified } from "../../utils/sizeNormalization";

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "checked" | "size"
  > {
  label?: string;
  showLabel?: boolean;

  // NEW PROPS (v1.1.0)
  /** Checked state (controlled) */
  isChecked?: boolean;
  /** Indeterminate state */
  isIndeterminate?: boolean;
  /** Disables the checkbox */
  isDisabled?: boolean;
  /** Initial checked state for uncontrolled component */
  defaultChecked?: boolean;
  /** Size variant */
  size?: SizeUnified;
  /** Checked change handler */
  onCheckedChange?: (checked: boolean) => void;

  // DEPRECATED PROPS
  /** @deprecated Use isChecked instead. Will be removed in v2.0.0 */
  checked?: boolean;
  /** @deprecated Use isIndeterminate instead. Will be removed in v2.0.0 */
  indeterminate?: boolean;

  id?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      showLabel = true,
      // New props (v1.1.0)
      isChecked,
      isIndeterminate,
      isDisabled,
      defaultChecked,
      size = "md",
      onCheckedChange,
      // Deprecated props
      checked,
      indeterminate,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    // Deprecation warnings (development only)
    if (process.env.NODE_ENV !== "production") {
      if (checked !== undefined && isChecked === undefined) {
        warnPropRename("Checkbox", "checked", "isChecked");
      }
      if (indeterminate !== undefined && isIndeterminate === undefined) {
        warnPropRename("Checkbox", "indeterminate", "isIndeterminate");
      }
      if (disabled !== false && isDisabled === undefined) {
        warnPropRename("Checkbox", "disabled", "isDisabled");
      }
    }

    // Resolve effective values (new props take precedence)
    const effectiveChecked = isChecked ?? checked;
    const effectiveIndeterminate = isIndeterminate ?? indeterminate;
    const effectiveDisabled = isDisabled ?? disabled;
    const normalizedSize = normalizeSizeProp(size);

    // Uncontrolled state management
    const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
    const isControlled = effectiveChecked !== undefined;
    const actualChecked = isControlled ? effectiveChecked : internalChecked;
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
      element.indeterminate = !!effectiveIndeterminate;

      // Update visual state classes - CSS handles all styling
      if (effectiveIndeterminate) {
        element.classList.remove(styles.checkedState);
        element.classList.add(styles.indeterminateState);
      } else if (actualChecked) {
        element.classList.remove(styles.indeterminateState);
        element.classList.add(styles.checkedState);
      } else {
        element.classList.remove(styles.indeterminateState);
        element.classList.remove(styles.checkedState);
      }
    }, [actualChecked, effectiveIndeterminate, props.id]);

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      const element = innerRef.current;
      if (effectiveIndeterminate && element) {
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
          className={`${styles.checkbox} ${styles[`checkbox--${normalizedSize}`]} ${actualChecked ? styles.checkedState : ""}`}
          ref={setRefs}
          checked={actualChecked}
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

            // Update internal state for uncontrolled mode
            if (!isControlled) {
              setInternalChecked(isChecked);
            }

            if (onCheckedChange) {
              onCheckedChange(isChecked);
            }
          }}
          disabled={effectiveDisabled}
          {...props}
        />
        <Label
          htmlFor={props.id || "checkbox"}
          disabled={effectiveDisabled}
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
