import React, { useId, useState } from "react";
import Radio from "@dt/Radio";
import HelperText from "@dt/HelperText";
import styles from "./RadioGroup.module.css";
import type { SizeUnified } from "../../utils/sizeNormalization";

export type RadioGroupOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface RadioGroupProps {
  name?: string;
  legend: string;
  options: RadioGroupOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  size?: SizeUnified;
  /** Disables the whole set. @default false */
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

/** Accessible radio set with legend, helper, and error text. */
const RadioGroup: React.FC<RadioGroupProps> = ({
  name: nameProp,
  legend,
  options,
  value,
  defaultValue,
  onValueChange,
  orientation = "vertical",
  size = "md",
  disabled = false,
  error,
  helperText,
  className,
}) => {
  const autoName = useId();
  const name = nameProp ?? `radio-group-${autoName}`;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internal;
  const helperId = `${name}-helper`;
  const errorId = `${name}-error`;

  const pick = (next: string) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <fieldset
      className={[styles.fieldset, className].filter(Boolean).join(" ")}
      aria-describedby={[helperText ? helperId : null, error ? errorId : null]
        .filter(Boolean)
        .join(" ") || undefined}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
    >
      <legend className={styles.legend}>{legend}</legend>
      <div
        className={[
          styles.options,
          orientation === "horizontal" ? styles.horizontal : styles.vertical,
        ].join(" ")}
      >
        {options.map((opt) => (
          <Radio
            key={opt.value}
            name={name}
            value={opt.value}
            label={opt.label}
            size={size}
            checked={selected === opt.value}
            disabled={disabled || opt.disabled}
            onCheckedChange={() => pick(opt.value)}
          />
        ))}
      </div>
      {helperText ? (
        <HelperText id={helperId}>{helperText}</HelperText>
      ) : null}
      {error ? (
        <HelperText id={errorId} state="error">
          {error}
        </HelperText>
      ) : null}
    </fieldset>
  );
};

RadioGroup.displayName = "RadioGroup";

export default RadioGroup;
