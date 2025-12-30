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
  /** @deprecated Use isDisabled instead. Will be removed in v2.0.0 */
  disabled?: boolean;
  /** Disables this option (v1.1.0+) */
  isDisabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "size"> {
  label: string;
  options?: SelectOptionItem[];
  helperText?: string;

  // NEW PROPS (v1.1.0)
  /** Error message to display (changes border color and shows error HelperText) */
  error?: string;
  /** Size variant for select */
  size?: SizeUnified;
  /** Disables the select */
  isDisabled?: boolean;
  /** Value change handler (recommended) */
  onValueChange?: (value: string) => void;

  // DEPRECATED PROPS
  /** @deprecated Use onValueChange instead. Will be removed in v2.0.0 */
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      id,
      options = [],
      helperText,
      error,
      size = "md",
      isDisabled,
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

      if (disabled !== false) {
        warnPropRename("Select", "disabled", "isDisabled");
      }

      if (value !== undefined && defaultValue !== undefined) {
        // eslint-disable-next-line no-console
        console.warn(
          "Select received both `value` and `defaultValue`. `value` will take precedence to keep the component controlled.",
        );
      }
    }

    // Resolve effective disabled state (isDisabled takes precedence)
    const effectiveDisabled = isDisabled ?? disabled;

    // Normalize size prop
    const normalizedSize = normalizeSizeProp(size);

    // Process options with isDisabled fallback
    const processedOptions = options.map((option) => ({
      ...option,
      disabled: option.isDisabled ?? option.disabled,
    }));

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
            disabled={effectiveDisabled}
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
              : processedOptions.map((option) => (
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
        {error && <HelperText state="error">{error}</HelperText>}
        {helperText && !error && <HelperText>{helperText}</HelperText>}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
