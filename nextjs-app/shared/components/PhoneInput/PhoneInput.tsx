import React, { useId } from "react";
import PhoneInputLib, { getCountryCallingCode } from "react-phone-number-input";
import type { Country, Labels, Value } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";
import fi from "react-phone-number-input/locale/fi";
import sv from "react-phone-number-input/locale/sv";
import "react-phone-number-input/style.css";
import styles from "./PhoneInput.module.css";
import Label from "@dt/Label/Label";
import HelperText from "@dt/HelperText/HelperText";
import Icon from "@dt/Icon/Icon";
import { useLocalization } from "../../lib/translation";

const COUNTRY_LABELS: Record<string, Labels> = { en, fi, sv };

interface CountrySelectProps {
  value?: Country;
  onChange: (value?: Country) => void;
  options: { value?: Country; label: string; divider?: boolean }[];
  disabled?: boolean;
  readOnly?: boolean;
  onFocus?: React.FocusEventHandler<HTMLSelectElement>;
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
  "aria-label"?: string;
}

/**
 * Country code picker: a native select (full keyboard and screen reader
 * support, type-to-jump) listing "Finland +358", shown closed as "FI +358".
 * No flag images: they load from a third-party host that a strict CSP blocks.
 */
function CountrySelect({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  onFocus,
  onBlur,
  "aria-label": ariaLabel,
}: CountrySelectProps) {
  return (
    <span className={styles.country}>
      <span className={styles.countryValue} aria-hidden="true">
        {value ? `${value} +${getCountryCallingCode(value)}` : "+"}
        <Icon name="caret-down" size={16} decorative />
      </span>
      <select
        className={styles.countrySelect}
        value={value ?? ""}
        aria-label={ariaLabel}
        disabled={disabled || readOnly}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) =>
          onChange((event.target.value || undefined) as Country | undefined)
        }
      >
        {options.map((option, index) =>
          option.divider ? (
            <option key={`divider-${index}`} disabled value="">
              ──────────
            </option>
          ) : (
            <option key={option.value ?? "international"} value={option.value ?? ""}>
              {option.value
                ? `${option.label} +${getCountryCallingCode(option.value)}`
                : option.label}
            </option>
          ),
        )}
      </select>
    </span>
  );
}

export interface PhoneInputProps {
  /** Label text */
  label: string;
  /** Phone number value (E.164 format) */
  value?: string;
  /** Error message; renders above the helper line */
  error?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state. @default false */
  disabled?: boolean;
  /** Shows the required marker on the label. @default false */
  required?: boolean;
  /** Explicit control id (wires the label); auto-generated when omitted */
  id?: string;
  /** ISO 3166-1 alpha-2 code used when the value has no country prefix. @default "FI" */
  defaultCountry?: Country;
  /** Field size, matching TextInput; lg is the 3rem height every lg field shares. @default "md" */
  size?: "sm" | "md" | "lg";
  onChange?: (value: string | undefined) => void;
}

/** International phone field: country selector + E.164-formatted input with field chrome. */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  error,
  helperText,
  placeholder,
  disabled = false,
  required = false,
  id: providedId,
  defaultCountry = "FI",
  size = "md",
  onChange,
}) => {
  const { language } = useLocalization();
  const labels = COUNTRY_LABELS[language.slice(0, 2)] ?? en;
  const generatedId = useId();
  const fieldId = providedId ?? `phone-input-${generatedId}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;
  const describedBy = [error ? errorId : null, helperText ? helperId : null]
    .filter(Boolean)
    .join(" ");

  const handleChange = (phoneValue: Value) => {
    onChange?.(phoneValue);
  };

  // The field expects E.164 ("+358401234567"). A stored number written with
  // spaces or dashes ("+358 40 123 4567") is compacted rather than rejected.
  const e164 =
    value && /^\+[\d\s().-]+$/.test(value)
      ? `+${value.replace(/\D/g, "")}`
      : value;

  return (
    <div className={styles["phone-input-container"]}>
      <Label htmlFor={fieldId} required={required} disabled={disabled}>
        {label}
      </Label>
      <PhoneInputLib
        id={fieldId}
        value={e164}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : undefined}
        className={[
          styles["phone-input"],
          size !== "md" ? styles[`phone-input--${size}`] : null,
          error ? styles.error : null,
        ]
          .filter(Boolean)
          .join(" ")}
        defaultCountry={defaultCountry}
        initialValueFormat="national"
        labels={labels}
        addInternationalOption={false}
        countryOptionsOrder={[defaultCountry, "|", "..."]}
        countrySelectComponent={CountrySelect}
      />
      {error && (
        <HelperText id={errorId} state="error">
          {error}
        </HelperText>
      )}
      {helperText && <HelperText id={helperId}>{helperText}</HelperText>}
    </div>
  );
};

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
