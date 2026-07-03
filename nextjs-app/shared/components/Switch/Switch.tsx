import React, { useState } from "react";
import styles from "./Switch.module.css";
import Label from "@dt/Label";
import HelperText from "@dt/HelperText";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Checked state (controlled). @default false */
  checked?: boolean;
  /** Initial checked state for uncontrolled use. @default false */
  defaultChecked?: boolean;
  /** Disables interaction and dims the control. @default false */
  disabled?: boolean;
  /** Shows a loading spinner and blocks interaction; sets `aria-busy`. @default false */
  loading?: boolean;
  /** Size. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Called with the next checked value when the switch is toggled. */
  onCheckedChange?: (checked: boolean) => void;
  /** Visible label. */
  label?: React.ReactNode;
  /** Where the label sits relative to the control. @default "right" */
  labelPlacement?: "right" | "left" | "top";
  /** Supporting text rendered beneath the control; suppressed while `error` is set. */
  helperText?: string;
  /** Error message beneath the control; sets aria-invalid and aria-describedby. */
  error?: string;
}

/** Toggle with label, helper text, and loading affordances. */
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked,
      disabled = false,
      loading = false,
      size = "md",
      onCheckedChange,
      label,
      labelPlacement = "right",
      helperText,
      error,
      className = "",
      onClick,
      id,
      ...rest
    },
    ref,
  ) => {
    // Uncontrolled state management
    const [internalChecked, setInternalChecked] = useState(
      defaultChecked ?? false,
    );
    const isControlled = checked !== undefined;
    const actualChecked = isControlled ? checked : internalChecked;

    const effectiveDisabled = disabled || loading;
    const generatedId = React.useId();
    const switchId = id ?? generatedId;
    const labelId = label ? `${switchId}-label` : undefined;
    const errorId = error ? `${switchId}-error` : undefined;
    const helperId = helperText && !error ? `${switchId}-helper` : undefined;
    const describedBy =
      [errorId, helperId, rest["aria-describedby"]].filter(Boolean).join(" ") ||
      undefined;

    const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (effectiveDisabled) {
        event.preventDefault();
        return;
      }
      const newChecked = !actualChecked;

      // Update internal state for uncontrolled mode
      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      onCheckedChange?.(newChecked);
    };

    const wrapperClassNames = [
      styles.switchWrapper,
      labelPlacement === "top" ? styles.wrapperLabelTop : "",
      labelPlacement === "left" ? styles.wrapperLabelLeft : "",
    ]
      .filter(Boolean)
      .join(" ");

    const shouldRenderLabelBefore =
      label && (labelPlacement === "top" || labelPlacement === "left");
    const shouldRenderLabelAfter = label && labelPlacement === "right";

    const renderLabel = () => (
      <Label
        id={labelId}
        htmlFor={switchId}
        className={styles.label}
        disabled={effectiveDisabled}
      >
        {label}
      </Label>
    );

    return (
      <>
        <span className={wrapperClassNames}>
          {shouldRenderLabelBefore ? renderLabel() : null}
          <button
            {...rest}
            id={switchId}
            ref={ref}
            type="button"
            role="switch"
            aria-checked={actualChecked}
            aria-busy={loading || undefined}
            aria-labelledby={
              label && labelId ? labelId : rest["aria-labelledby"]
            }
            aria-label={
              label
                ? undefined
                : (rest["aria-label"] ??
                  (typeof label === "string" ? label : undefined))
            }
            aria-describedby={describedBy}
            aria-invalid={error ? true : rest["aria-invalid"]}
            className={[styles.switch, styles[`switch--${size}`], className]
              .filter(Boolean)
              .join(" ")}
            data-checked={actualChecked}
            data-loading={loading}
            data-disabled={effectiveDisabled}
            disabled={disabled}
            onClick={(event) => {
              onClick?.(event);
              if (event.defaultPrevented) return;
              toggle(event);
            }}
          >
            <span className={styles.handle} aria-hidden="true">
              {loading && <span className={styles.spinner} aria-hidden="true" />}
            </span>
          </button>
          {shouldRenderLabelAfter ? renderLabel() : null}
        </span>
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

Switch.displayName = "Switch";

export default Switch;
