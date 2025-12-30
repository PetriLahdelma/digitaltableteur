import React, { useState } from "react";
import styles from "./Switch.module.css";
import Label from "@dt/Label";
import HelperText from "@dt/HelperText";
import { normalizeSizeProp, type SizeUnified } from "../../utils/sizeNormalization";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  // v2.0.0 PROPS
  /** Checked state (controlled) */
  isChecked?: boolean;
  /** Disables the switch */
  isDisabled?: boolean;
  /** Shows loading state with spinner */
  isLoading?: boolean;
  /** Initial checked state for uncontrolled component */
  defaultChecked?: boolean;
  /** Size variant */
  size?: SizeUnified;
  /** Checked change handler */
  onCheckedChange?: (checked: boolean) => void;

  // EXISTING PROPS
  label?: React.ReactNode;
  labelPlacement?: "right" | "left" | "top";
  helperText?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      isChecked,
      isDisabled = false,
      isLoading = false,
      defaultChecked,
      size = "md",
      onCheckedChange,
      label,
      labelPlacement = "right",
      helperText,
      className = "",
      onClick,
      id,
      ...rest
    },
    ref,
  ) => {
    const normalizedSize = normalizeSizeProp(size);

    // Uncontrolled state management
    const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
    const isControlled = isChecked !== undefined;
    const actualChecked = isControlled ? isChecked : internalChecked;

    const effectiveIsDisabled = isDisabled || isLoading;
    const generatedId = React.useId();
    const switchId = id ?? generatedId;
    const labelId = label ? `${switchId}-label` : undefined;

    const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (effectiveIsDisabled) {
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
        disabled={effectiveIsDisabled}
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
            aria-busy={isLoading || undefined}
            aria-labelledby={
              label && labelId ? labelId : rest["aria-labelledby"]
            }
            aria-label={
              label
                ? undefined
                : (rest["aria-label"] ??
                  (typeof label === "string" ? label : undefined))
            }
            className={[
              styles.switch,
              styles[`switch--${normalizedSize}`],
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            data-checked={actualChecked}
            data-loading={isLoading}
            data-disabled={effectiveIsDisabled}
            disabled={isDisabled}
            onClick={(event) => {
              onClick?.(event);
              if (event.defaultPrevented) return;
              toggle(event);
            }}
          >
            <span className={styles.handle} aria-hidden="true">
              {isLoading && (
                <span className={styles.spinner} aria-hidden="true" />
              )}
            </span>
          </button>
          {shouldRenderLabelAfter ? renderLabel() : null}
        </span>
        {helperText && <HelperText>{helperText}</HelperText>}
      </>
    );
  },
);

Switch.displayName = "Switch";

export default Switch;
