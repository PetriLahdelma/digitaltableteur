import React, { forwardRef, useId } from "react";
import Label from "@dt/Label";
import styles from "./Radio.module.css";
import { normalizeSizeProp, type SizeUnified } from "../../utils/sizeNormalization";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "onChange"> {
  label: string;
  value: string;
  name: string;
  /** Checked state (controlled); use inside RadioGroup for sets. */
  checked?: boolean;
  defaultChecked?: boolean;
  /** Disables interaction and dims the control. @default false */
  disabled?: boolean;
  size?: SizeUnified;
  onCheckedChange?: (checked: boolean) => void;
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
