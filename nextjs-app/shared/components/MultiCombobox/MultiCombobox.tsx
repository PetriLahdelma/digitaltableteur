"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import Badge from "@dt/Badge";
import HelperText from "@dt/HelperText";
import Icon from "@dt/Icon";
import fieldStyles from "../Combobox/ComboboxField.module.css";
import { useComboboxDropdown } from "../Combobox/useComboboxDropdown";
import styles from "./MultiCombobox.module.css";

export interface MultiComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiComboboxProps {
  /** Field label; associates the input */
  label: string;
  /** Selectable options */
  options: MultiComboboxOption[];
  /** Selected values (controlled) */
  value: string[];
  /** Called with the next selected values */
  onValueChange: (value: string[]) => void;
  /** Explicit control id (wires the label); auto-generated when omitted */
  id?: string;
  /** Shown when nothing is selected */
  placeholder?: string;
  /** Assistive text below the field */
  helperText?: string;
  /** Error message; replaces the helper line and sets aria-invalid */
  error?: string;
  /** Marks the field required. @default false */
  required?: boolean;
  /** Disables the control. @default false */
  disabled?: boolean;
  /** Classes on the field wrapper */
  className?: string;
}

/** Combobox for choosing multiple options — chips in the field, type-to-filter dropdown. */
export function MultiCombobox({
  label,
  options,
  value,
  onValueChange,
  id: providedId,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  className,
}: MultiComboboxProps) {
  const { t } = useTranslation();
  const generatedId = useId();
  const fieldId = providedId ?? `multicombobox-${generatedId}`;
  const listboxId = `${fieldId}-listbox`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const labelByValue = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of options) {
      map.set(option.value, option.label);
    }
    return map;
  }, [options]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedQuery),
    );
  }, [options, query]);

  const describedBy = [error ? errorId : null, helperText ? helperId : null]
    .filter(Boolean)
    .join(" ");

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHighlightedIndex(0);
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setOpen(true);
  }, [disabled]);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    setOpen((current) => {
      if (current) {
        setQuery("");
        setHighlightedIndex(0);
      }
      return !current;
    });
  }, [disabled]);

  const toggleOption = useCallback(
    (optionValue: string) => {
      if (value.includes(optionValue)) {
        onValueChange(value.filter((entry) => entry !== optionValue));
        return;
      }
      onValueChange([...value, optionValue]);
    },
    [onValueChange, value],
  );

  const removeOption = useCallback(
    (optionValue: string) => {
      onValueChange(value.filter((entry) => entry !== optionValue));
      inputRef.current?.focus();
    },
    [onValueChange, value],
  );

  const inputRef = React.useRef<HTMLInputElement>(null);

  const {
    mounted,
    dropdownStyle,
    controlRef,
    listRef,
    containerRef,
  } = useComboboxDropdown(open, filteredOptions.length, closeDropdown);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const highlighted = listRef.current.querySelector(
      `[data-option-index="${highlightedIndex}"]`,
    );
    highlighted?.scrollIntoView?.({ block: "nearest" });
  }, [highlightedIndex, listRef, open]);

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        if (filteredOptions.length === 0) return;
        setHighlightedIndex((current) =>
          current >= filteredOptions.length - 1 ? 0 : current + 1,
        );
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        if (filteredOptions.length === 0) return;
        setHighlightedIndex((current) =>
          current <= 0 ? filteredOptions.length - 1 : current - 1,
        );
        break;
      }
      case "Enter": {
        event.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        const option = filteredOptions[highlightedIndex];
        if (option && !option.disabled) {
          toggleOption(option.value);
        }
        break;
      }
      case "Escape": {
        event.preventDefault();
        closeDropdown();
        break;
      }
      case "Backspace": {
        if (query.length === 0 && value.length > 0) {
          onValueChange(value.slice(0, -1));
        }
        break;
      }
      default:
        break;
    }
  };

  const activeDescendant =
    open && filteredOptions[highlightedIndex]
      ? `${fieldId}-option-${filteredOptions[highlightedIndex].value}`
      : undefined;

  const dropdown = open && dropdownStyle && (
    <ul
      ref={listRef}
      id={listboxId}
      role="listbox"
      aria-multiselectable="true"
      aria-label={label}
      className={fieldStyles.dropdown}
      style={{
        top: dropdownStyle.top,
        left: dropdownStyle.left,
        width: dropdownStyle.width,
      }}
      data-testid={`${fieldId}-dropdown`}
      data-state="open"
      data-lenis-prevent=""
      data-lenis-prevent-wheel=""
      data-lenis-prevent-touch=""
    >
      {filteredOptions.length === 0 ? (
        <li className={fieldStyles.empty} role="presentation">
          {t("multiComboboxNoResults", "No matching options")}
        </li>
      ) : (
        filteredOptions.map((option, index) => {
          const selected = value.includes(option.value);
          const optionDisabled = disabled || option.disabled;
          const optionId = `${fieldId}-option-${option.value}`;

          return (
            <li key={option.value} role="presentation">
              <button
                id={optionId}
                type="button"
                role="option"
                data-option-index={index}
                aria-selected={selected}
                disabled={optionDisabled}
                className={cn(
                  fieldStyles.option,
                  selected && fieldStyles.optionSelected,
                  index === highlightedIndex && fieldStyles.optionHighlighted,
                )}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggleOption(option.value)}
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
        })
      )}
    </ul>
  );

  return (
    <div className={cn(fieldStyles.field, className)} ref={containerRef}>
      <label id={`${fieldId}-label`} htmlFor={fieldId} className={fieldStyles.label}>
        {label}
        {required && (
          <>
            <span className={fieldStyles.required} aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>

      <div className={fieldStyles.wrapper}>
        <div
          ref={controlRef}
          className={cn(
            fieldStyles.control,
            styles.control,
            open && fieldStyles.controlOpen,
            error && fieldStyles.controlError,
            disabled && fieldStyles.disabled,
          )}
          data-state={open ? "open" : "closed"}
          onMouseDown={(event) => {
            if ((event.target as HTMLElement).closest("[data-chip-remove]")) {
              return;
            }
            if ((event.target as HTMLElement).closest("[data-chevron-toggle]")) {
              return;
            }
            event.preventDefault();
            inputRef.current?.focus();
            openDropdown();
          }}
        >
          <div className={styles.inner}>
            {value.map((selectedValue) => {
              const optionLabel =
                labelByValue.get(selectedValue) ?? selectedValue;
              return (
                <span
                  key={selectedValue}
                  className={styles.badgeWrap}
                  data-chip-remove
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <Badge
                    variant="secondary"
                    tone="neutral"
                    size="sm"
                    removable={!disabled}
                    className={styles.badge}
                    onRemove={() => removeOption(selectedValue)}
                  >
                    <span className={styles.badgeLabel}>{optionLabel}</span>
                  </Badge>
                </span>
              );
            })}

            <input
              ref={inputRef}
              id={fieldId}
              type="text"
              role="combobox"
              autoComplete="off"
              spellCheck={false}
              className={styles.input}
              value={query}
              disabled={disabled}
              placeholder={value.length === 0 ? placeholder : undefined}
              aria-labelledby={`${fieldId}-label`}
              aria-describedby={describedBy || undefined}
              aria-invalid={error ? true : undefined}
              aria-required={required || undefined}
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeDescendant}
              data-testid={`${fieldId}-input`}
              onChange={(event) => {
                setQuery(event.target.value);
                openDropdown();
              }}
              onFocus={openDropdown}
              onKeyDown={handleInputKeyDown}
            />
          </div>

          <button
            type="button"
            data-chevron-toggle
            className={cn(fieldStyles.chevronButton, styles.chevronButton)}
            aria-label={t("multiComboboxToggleOptions", "Toggle options")}
            aria-expanded={open}
            disabled={disabled}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              toggleDropdown();
            }}
          >
            <Icon
              name="caret-down"
              className={cn(fieldStyles.chevron, open && fieldStyles.chevronOpen)}
              ariaLabel=""
            />
          </button>
        </div>

        {mounted && dropdown && createPortal(dropdown, document.body)}
      </div>

      {error ? (
        <HelperText id={errorId} state="error">
          {error}
        </HelperText>
      ) : helperText ? (
        <HelperText id={helperId}>{helperText}</HelperText>
      ) : null}
    </div>
  );
}

MultiCombobox.displayName = "MultiCombobox";

export default MultiCombobox;
