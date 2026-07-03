"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import HelperText from "@dt/HelperText";
import Icon from "@dt/Icon";
import styles from "./ComboboxField.module.css";
import { useComboboxDropdown } from "./useComboboxDropdown";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  label: string;
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Single-select combobox with portaled dropdown (matches MultiCombobox UX). */
export const Combobox = forwardRef<HTMLButtonElement, ComboboxProps>(
  function Combobox(
    {
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
    },
    ref,
  ) {
    const { t } = useTranslation();
    const generatedId = useId();
    const fieldId = providedId ?? `combobox-${generatedId}`;
    const listboxId = `${fieldId}-listbox`;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    const [open, setOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const selectedLabel = useMemo(
      () => options.find((option) => option.value === value)?.label,
      [options, value],
    );

    const describedBy = [error ? errorId : null, helperText ? helperId : null]
      .filter(Boolean)
      .join(" ");

    const closeDropdown = useCallback(() => {
      setOpen(false);
      setHighlightedIndex(0);
    }, []);

    const openDropdown = useCallback(() => {
      if (disabled) return;
      setOpen(true);
    }, [disabled]);

    const toggleDropdown = useCallback(() => {
      if (disabled) return;
      setOpen((current) => !current);
    }, [disabled]);

    const selectOption = useCallback(
      (optionValue: string) => {
        onValueChange(optionValue);
        closeDropdown();
      },
      [closeDropdown, onValueChange],
    );

    const {
      mounted,
      dropdownStyle,
      controlRef,
      listRef,
      containerRef,
    } = useComboboxDropdown(open, options.length, closeDropdown);

    useEffect(() => {
      if (!open) return;
      const selectedIndex = options.findIndex((option) => option.value === value);
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }, [open, options, value]);

    useEffect(() => {
      if (!open || !listRef.current) return;
      const highlighted = listRef.current.querySelector(
        `[data-option-index="${highlightedIndex}"]`,
      );
      highlighted?.scrollIntoView?.({ block: "nearest" });
    }, [highlightedIndex, listRef, open]);

    const handleTriggerKeyDown = (
      event: React.KeyboardEvent<HTMLButtonElement>,
    ) => {
      if (disabled) return;

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          if (!open) {
            openDropdown();
            return;
          }
          setHighlightedIndex((current) =>
            current >= options.length - 1 ? 0 : current + 1,
          );
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          if (!open) {
            openDropdown();
            return;
          }
          setHighlightedIndex((current) =>
            current <= 0 ? options.length - 1 : current - 1,
          );
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
          if (option && !option.disabled) {
            selectOption(option.value);
          }
          break;
        }
        case "Escape": {
          event.preventDefault();
          closeDropdown();
          break;
        }
        default:
          break;
      }
    };

    const activeDescendant =
      open && options[highlightedIndex]
        ? `${fieldId}-option-${options[highlightedIndex].value}`
        : undefined;

    const dropdown = open && dropdownStyle && (
      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label={label}
        className={styles.dropdown}
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
        {options.length === 0 ? (
          <li className={styles.empty} role="presentation">
            {t("multiComboboxNoResults", "No matching options")}
          </li>
        ) : (
          options.map((option, index) => {
            const selected = value === option.value;
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
                    styles.option,
                    selected && styles.optionSelected,
                    index === highlightedIndex && styles.optionHighlighted,
                  )}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option.value)}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {selected ? (
                    <Icon
                      name="check"
                      className={styles.optionCheck}
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
      <div className={cn(styles.field, className)} ref={containerRef}>
        <label id={`${fieldId}-label`} htmlFor={fieldId} className={styles.label}>
          {label}
          {required && (
            <>
              <span className={styles.required} aria-hidden="true">
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>

        <div className={styles.wrapper}>
          <div
            ref={controlRef}
            className={cn(
              styles.control,
              open && styles.controlOpen,
              error && styles.controlError,
              disabled && styles.disabled,
            )}
            data-state={open ? "open" : "closed"}
          >
            <button
              ref={ref}
              id={fieldId}
              type="button"
              role="combobox"
              className={styles.trigger}
              disabled={disabled}
              aria-labelledby={`${fieldId}-label`}
              aria-describedby={describedBy || undefined}
              aria-invalid={error ? true : undefined}
              aria-required={required || undefined}
              aria-expanded={open}
              aria-controls={listboxId}
              aria-activedescendant={activeDescendant}
              data-testid={`${fieldId}-trigger`}
              onClick={() => toggleDropdown()}
              onKeyDown={handleTriggerKeyDown}
            >
              <span
                className={cn(
                  styles.triggerLabel,
                  !selectedLabel && placeholder && styles.triggerPlaceholder,
                )}
              >
                {selectedLabel ?? placeholder ?? ""}
              </span>
            </button>

            <button
              type="button"
              data-chevron-toggle
              className={styles.chevronButton}
              aria-label={t("multiComboboxToggleOptions", "Toggle options")}
              aria-expanded={open}
              disabled={disabled}
              tabIndex={-1}
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
                className={cn(styles.chevron, open && styles.chevronOpen)}
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
  },
);

Combobox.displayName = "Combobox";

export default Combobox;
