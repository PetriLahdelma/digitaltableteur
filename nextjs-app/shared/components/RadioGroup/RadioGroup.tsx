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
  /** Native form field name shared by the set; auto-generated when omitted */
  name?: string;
  /** Group label rendered as the fieldset legend */
  legend: string;
  /** Radio options; per-option disabled keeps the choice visible */
  options: RadioGroupOption[];
  /** Controlled selected value; "" is treated as absent (uncontrolled) */
  value?: string;
  /** Initial value when uncontrolled */
  defaultValue?: string;
  /** Fired with the next value when selection changes */
  onValueChange?: (value: string) => void;
  /** Stack direction. @default "vertical" */
  orientation?: "vertical" | "horizontal";
  /** Radio control size. @default "md" */
  size?: SizeUnified;
  /** Disables the whole set. @default false */
  disabled?: boolean;
  /** Error message; announces via role=alert and sets aria-invalid */
  error?: string;
  /** Helper copy below the group; suppressed while error is set */
  helperText?: string;
  /** Merged onto the fieldset */
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
  // Controls convention: "" means absent — empty name falls back to the
  // generated one, empty value keeps the group uncontrolled and clickable.
  const name = nameProp || `radio-group-${autoName}`;
  const controlledValue = value === "" ? undefined : value;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const selected = isControlled ? controlledValue : internal;
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
