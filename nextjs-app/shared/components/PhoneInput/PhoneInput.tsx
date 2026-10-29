"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import PhoneInputLib, { getCountryCallingCode } from "react-phone-number-input";
import type { Country, Labels, Value } from "react-phone-number-input";
import en from "react-phone-number-input/locale/en";
import fi from "react-phone-number-input/locale/fi";
import sv from "react-phone-number-input/locale/sv";
import "react-phone-number-input/style.css";
import styles from "./PhoneInput.module.css";
import fieldStyles from "../Combobox/ComboboxField.module.css";
import { useComboboxDropdown } from "../Combobox/useComboboxDropdown";
import Label from "@dt/Label/Label";
import HelperText from "@dt/HelperText/HelperText";
import Icon from "@dt/Icon/Icon";
import { useLocalization } from "../../lib/translation";
import { cn } from "../../lib/cn";

const COUNTRY_LABELS: Record<string, Labels> = { en, fi, sv };

interface CountrySelectProps {
  value?: Country;
  onChange: (value?: Country) => void;
  options: { value?: Country; label: string; divider?: boolean }[];
  disabled?: boolean;
  readOnly?: boolean;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  "aria-label"?: string;
}

interface CountryOption {
  value: Country;
  label: string;
  /** First option after the default country: drawn with a rule above it */
  afterDivider: boolean;
}

/**
 * Country code picker, shown closed as "FI +358". Opens the same portaled
 * list as Combobox (select-only combobox pattern): arrow keys move, Enter or
 * Space picks, and typing jumps to a country name or a calling code ("358").
 * No flag images: they load from a third-party host that a strict CSP blocks.
 */
function CountrySelect({
  value,
  onChange,
  options: rawOptions,
  disabled,
  readOnly,
  onFocus,
  onBlur,
  "aria-label": ariaLabel,
}: CountrySelectProps) {
  const pickerId = `phone-country-${useId()}`;
  const listboxId = `${pickerId}-listbox`;
  const inactive = disabled || readOnly;
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const typeahead = useRef<{
    text: string;
    timer: ReturnType<typeof setTimeout> | null;
  }>({
    text: "",
    timer: null,
  });

  const options = useMemo(() => {
    const result: CountryOption[] = [];
    let pendingDivider = false;
    for (const option of rawOptions) {
      if (option.divider) {
        pendingDivider = true;
        continue;
      }
      // The international option is turned off, so every option has a value.
      if (!option.value) continue;
      result.push({
        value: option.value,
        label: `${option.label} +${getCountryCallingCode(option.value)}`,
        afterDivider: pendingDivider,
      });
      pendingDivider = false;
    }
    return result;
  }, [rawOptions]);

  const closeDropdown = useCallback(() => setOpen(false), []);
  const { mounted, dropdownStyle, controlRef, listRef, containerRef } =
    useComboboxDropdown(open, options.length, closeDropdown);

  const openDropdown = (index?: number) => {
    if (inactive) return;
    const selected = options.findIndex((option) => option.value === value);
    setHighlightedIndex(index ?? (selected >= 0 ? selected : 0));
    setOpen(true);
  };

  const selectOption = (option: CountryOption) => {
    onChange(option.value);
    setOpen(false);
  };

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current
      .querySelector(`[data-option-index="${highlightedIndex}"]`)
      ?.scrollIntoView?.({ block: "nearest" });
  }, [highlightedIndex, listRef, open]);

  useEffect(
    () => () => {
      if (typeahead.current.timer) clearTimeout(typeahead.current.timer);
    },
    [],
  );

  const findTypeaheadMatch = (search: string): number => {
    const query = search.toLocaleLowerCase();
    const byName = options.findIndex((option) =>
      option.label.toLocaleLowerCase().startsWith(query),
    );
    if (byName >= 0) return byName;
    return options.findIndex((option) =>
      option.label
        .toLocaleLowerCase()
        .split(/[\s/()_,.+-]+/)
        .some((word) => word.startsWith(query)),
    );
  };

  const handleTypeahead = (character: string) => {
    const state = typeahead.current;
    if (state.timer) clearTimeout(state.timer);
    state.text += character;
    state.timer = setTimeout(() => {
      state.text = "";
      state.timer = null;
    }, 700);
    const match = findTypeaheadMatch(state.text);
    if (!open) openDropdown(match >= 0 ? match : undefined);
    else if (match >= 0) setHighlightedIndex(match);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (inactive) return;
    const isPrintable =
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey;
    // A space while a search is being typed is part of it ("new z").
    if (isPrintable && (event.key !== " " || typeahead.current.text)) {
      event.preventDefault();
      handleTypeahead(event.key);
      return;
    }
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          openDropdown();
          return;
        }
        const step = event.key === "ArrowDown" ? 1 : -1;
        setHighlightedIndex(
          (current) => (current + step + options.length) % options.length,
        );
        break;
      }
      case "Home":
      case "End": {
        if (!open) return;
        event.preventDefault();
        setHighlightedIndex(event.key === "Home" ? 0 : options.length - 1);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (!open) {
          openDropdown();
          return;
        }
        const option = options[highlightedIndex];
        if (option) selectOption(option);
        break;
      }
      case "Escape": {
        if (!open) return;
        event.preventDefault();
        closeDropdown();
        break;
      }
      case "Tab": {
        closeDropdown();
        break;
      }
      default:
        break;
    }
  };

  const optionId = (option: CountryOption) =>
    `${pickerId}-option-${option.value}`;
  const highlighted = open ? options[highlightedIndex] : undefined;

  const dropdown = open && dropdownStyle && (
    <ul
      ref={listRef}
      id={listboxId}
      role="listbox"
      aria-label={ariaLabel}
      className={fieldStyles.dropdown}
      style={{
        top: dropdownStyle.top,
        left: dropdownStyle.left,
        width: dropdownStyle.width,
      }}
      data-state="open"
      data-lenis-prevent=""
      data-lenis-prevent-wheel=""
      data-lenis-prevent-touch=""
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <li
            key={option.value}
            role="presentation"
            className={option.afterDivider ? styles.countryDivider : undefined}
          >
            <button
              id={optionId(option)}
              type="button"
              role="option"
              tabIndex={-1}
              data-option-index={index}
              aria-selected={selected}
              className={cn(
                fieldStyles.option,
                selected && fieldStyles.optionSelected,
                index === highlightedIndex && fieldStyles.optionHighlighted,
              )}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectOption(option)}
            >
              <span className={fieldStyles.optionLabel}>{option.label}</span>
              {selected ? (
                <Icon
                  name="check"
                  className={fieldStyles.optionCheck}
                  ariaLabel=""
                />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        // The list opens under the whole phone field, as Combobox's does.
        // `composes` makes the field class a list; its first name is local.
        const fieldClass = styles["phone-input"].split(" ")[0];
        controlRef.current =
          node?.closest<HTMLDivElement>(`.${fieldClass}`) ?? node;
      }}
      className={styles.country}
    >
      <button
        type="button"
        role="combobox"
        className={styles.countryTrigger}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-activedescendant={highlighted ? optionId(highlighted) : undefined}
        disabled={inactive}
        data-state={open ? "open" : "closed"}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={() => (open ? closeDropdown() : openDropdown())}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.countryValue}>
          {value ? `${value} +${getCountryCallingCode(value)}` : "+"}
        </span>
        <Icon
          name="caret-down"
          size={16}
          decorative
          className={cn(styles.countryCaret, open && styles.countryCaretOpen)}
        />
      </button>
      {mounted && dropdown && createPortal(dropdown, document.body)}
    </div>
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
