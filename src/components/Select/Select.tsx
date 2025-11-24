import React, { useId } from "react";
import Label from "@dt/Label";
import SelectOption from "./SelectOption";
import HelperText from "@dt/HelperText";
import styles from "./Select.module.css";
import Icon from "@dt/Icon";

interface SelectOptionItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string;
  options?: SelectOptionItem[];
  helperText?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      id,
      options = [],
      helperText,
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
    if (process.env.NODE_ENV !== "production") {
      if (value !== undefined && defaultValue !== undefined) {
        // eslint-disable-next-line no-console
        console.warn(
          "Select received both `value` and `defaultValue`. `value` will take precedence to keep the component controlled.",
        );
      }
    }

    const combinedSelectClassName = [styles.select, className]
      .filter(Boolean)
      .join(" ");

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextValue = event.target.value;
      onChange?.(nextValue);
      onValueChange?.(nextValue);
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
        {helperText && <HelperText>{helperText}</HelperText>}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
