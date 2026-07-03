import React, { useId } from "react";
import Label from "@dt/Label";
import SelectOption from "./SelectOption";
import HelperText from "@dt/HelperText";
import styles from "./Select.module.css";
import Icon from "@dt/Icon";
import { warnPropRename } from "../../utils/deprecationWarning";
import { normalizeSizeProp, type SizeUnified } from "../../utils/sizeNormalization";

interface SelectOptionItem {
  value: string;
  label: string;
  /** Disables this option. */
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "size"> {
  label: string;
  options?: SelectOptionItem[];
  /** Supporting text under the control; suppressed while `error` is set. */
  helperText?: string;
  /** Error message under the control; sets aria-invalid and aria-describedby. */
  error?: string;
  /** Size variant for select */
  size?: SizeUnified;
  /** Value change handler (recommended) */
  onValueChange?: (value: string) => void;

  // DEPRECATED PROPS
  /** @deprecated Use onValueChange instead. Will be removed in v2.0.0 */
  onChange?: (value: string) => void;
}

/** Native select with label, options, and error/helper text. */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      id,
      options = [],
      helperText,
      error,
      size = "md",
      children,
      className,
      disabled = false,
      onChange,
      onValueChange,
      value,
      defaultValue,
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? `select-${generatedId}`;

    // Deprecation warnings (development only)
    if (process.env.NODE_ENV !== "production") {
      if (onChange && !onValueChange) {
        warnPropRename("Select", "onChange", "onValueChange");
      }

      if (value !== undefined && defaultValue !== undefined) {
        // eslint-disable-next-line no-console
        console.warn(
          "Select received both `value` and `defaultValue`. `value` will take precedence to keep the component controlled.",
        );
      }
    }

    // Normalize size prop
    const normalizedSize = normalizeSizeProp(size);

    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;
    const describedBy =
      [
        error ? errorId : null,
        helperText && !error ? helperId : null,
        rest["aria-describedby"],
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    const combinedSelectClassName = [
      styles.select,
      styles[`select--${normalizedSize}`],
      error ? styles.error : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextValue = event.target.value;

      // Call new callback first (recommended)
      onValueChange?.(nextValue);

      // Call deprecated callback for backwards compatibility
      onChange?.(nextValue);
    };

    return (
      <div className={styles.container}>
        {label && <Label htmlFor={selectId}>{label}</Label>}
        <div className={styles.wrapper}>
          <select
            id={selectId}
            ref={ref}
            className={combinedSelectClassName}
            disabled={disabled}
            onChange={handleChange}
            {...(value !== undefined
              ? { value }
              : defaultValue !== undefined
                ? { defaultValue }
                : {})}
            {...rest}
            aria-describedby={describedBy}
            aria-invalid={error ? true : rest["aria-invalid"]}
          >
            {children
              ? children
              : options.map((option) => (
                  <SelectOption
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    disabled={option.disabled}
                  />
                ))}
          </select>
          <Icon
            name="caret-down"
            className={styles.chevronIcon}
            ariaLabel="Toggle options"
          />
        </div>
        {error && (
          <HelperText id={errorId} state="error">
            {error}
          </HelperText>
        )}
        {helperText && !error && (
          <HelperText id={helperId}>{helperText}</HelperText>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
