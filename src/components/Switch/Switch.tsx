import React from "react";
import styles from "./Switch.module.css";
import Label from "@dt/Label";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  loading?: boolean;
  label?: React.ReactNode;
  labelPlacement?: "right" | "left" | "top";
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      onCheckedChange,
      disabled = false,
      loading = false,
      label,
      labelPlacement = "right",
      className = "",
      onClick,
      id,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const generatedId = React.useId();
    const switchId = id ?? generatedId;
    const labelId = label ? `${switchId}-label` : undefined;

    const toggle = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      onCheckedChange?.(!checked);
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
        disabled={isDisabled}
      >
        {label}
      </Label>
    );

    return (
      <span className={wrapperClassNames}>
        {shouldRenderLabelBefore ? renderLabel() : null}
        <button
          {...rest}
          id={switchId}
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-busy={loading || undefined}
          aria-labelledby={label && labelId ? labelId : rest["aria-labelledby"]}
          aria-label={
            label
              ? undefined
              : (rest["aria-label"] ??
                (typeof label === "string" ? label : undefined))
          }
          className={[styles.switch, className].filter(Boolean).join(" ")}
          data-checked={checked}
          data-loading={loading}
          data-disabled={isDisabled}
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
    );
  },
);

Switch.displayName = "Switch";

export default Switch;
