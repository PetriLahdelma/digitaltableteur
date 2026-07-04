import React, { forwardRef, useId } from "react";
import Label from "@dt/Label";
import styles from "./Radio.module.css";
import { normalizeSizeProp, type SizeUnified } from "../../utils/sizeNormalization";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "onChange"> {
  /** Option label */
  label: string;
  /** Submitted value when selected */
  value: string;
  /** Group name; must match siblings to form the exclusive set */
  name: string;
  /** Checked state (controlled); use inside RadioGroup for sets. */
  checked?: boolean;
  /** Initial checked state (uncontrolled mode only) */
  defaultChecked?: boolean;
  /** Disables interaction and dims the control. @default false */
  disabled?: boolean;
  /** Control hit area. @default "md" */
  size?: SizeUnified;
  /** Fired with the next checked value when selection changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Render the visible label. @default true */
  showLabel?: boolean;
}

/** Single radio control — use inside RadioGroup for sets. */
const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    label,
    value,
    name,
    checked,
    defaultChecked,
    disabled = false,
    size = "md",
    onCheckedChange,
    showLabel = true,
    className,
    id: idProp,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const normalizedSize = normalizeSizeProp(size);

  return (
    <div className={[styles.container, className].filter(Boolean).join(" ")}>
      <input
        {...rest}
        ref={ref}
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        // React syncs the checked PROPERTY only; expose the controlled state as
        // an attribute so CSS/tests (and the controls effect audit) can see it.
        data-checked={checked === undefined ? undefined : String(checked)}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className={[styles.input, styles[`input--${normalizedSize}`]].join(" ")}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
      {showLabel ? <Label htmlFor={id}>{label}</Label> : null}
    </div>
  );
});

Radio.displayName = "Radio";
export default Radio;
