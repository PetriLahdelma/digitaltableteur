import React, { useState } from "react";
import styles from "./Switch.module.css";
import Label from "@dt/Label";
import HelperText from "@dt/HelperText";
import { warnPropRename } from "../../utils/deprecationWarning";
import { normalizeSizeProp, type SizeUnified } from "../../utils/sizeNormalization";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  // NEW PROPS (v1.1.0)
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

  // DEPRECATED PROPS
  /** @deprecated Use isChecked instead. Will be removed in v2.0.0 */
  checked?: boolean;
  /** @deprecated Use isLoading instead. Will be removed in v2.0.0 */
  loading?: boolean;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      // New props (v1.1.0)
      isChecked,
      isDisabled,
      isLoading,
      defaultChecked,
      size = "md",
      onCheckedChange,
      // Deprecated props
      checked,
      loading = false,
      disabled = false,
      // Other props
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
    // Deprecation warnings (development only)
    if (process.env.NODE_ENV !== "production") {
      if (checked !== undefined && isChecked === undefined) {
        warnPropRename("Switch", "checked", "isChecked");
      }
      if (loading !== false && isLoading === undefined) {
        warnPropRename("Switch", "loading", "isLoading");
      }
      if (disabled !== false && isDisabled === undefined) {
        warnPropRename("Switch", "disabled", "isDisabled");
      }
    }

    // Resolve effective values (new props take precedence)
    const effectiveChecked = isChecked ?? checked;
    const effectiveLoading = isLoading ?? loading;
    const effectiveDisabled = isDisabled ?? disabled;
    const normalizedSize = normalizeSizeProp(size);

    // Uncontrolled state management
    const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);
    const isControlled = effectiveChecked !== undefined;
    const actualChecked = isControlled ? effectiveChecked : internalChecked;

    const effectiveIsDisabled = effectiveDisabled || effectiveLoading;
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
            aria-busy={effectiveLoading || undefined}
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
            data-loading={effectiveLoading}
            data-disabled={effectiveIsDisabled}
            disabled={effectiveDisabled}
            onClick={(event) => {
              onClick?.(event);
              if (event.defaultPrevented) return;
              toggle(event);
            }}
          >
            <span className={styles.handle} aria-hidden="true">
              {effectiveLoading && (
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
