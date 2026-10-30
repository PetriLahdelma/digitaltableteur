"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslate } from "../../lib/translation";
import { cn } from "../../lib/cn";
import Badge from "@dt/Badge";
import {
  FieldShell,
  fieldDescribedBy,
  fieldIds,
  fieldStatusClass,
  resolveFieldStatus,
  type FieldAction,
  type FieldStatus,
} from "@dt/FieldShell";
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
  /** Error message; shorthand for status="error" with this message. Sets aria-invalid */
  error?: string;
  /** Semantic state: colours the border and styles statusMessage. `error` overrides it. */
  status?: FieldStatus;
  /** Message under the field for `status`, above the helper line */
  statusMessage?: string;
  /** Icon buttons at the end of the label row: each runs an operation or opens a menu */
  actions?: FieldAction[];
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
  status,
  statusMessage,
  actions,
  required = false,
  disabled = false,
  className,
}: MultiComboboxProps) {
  const t = useTranslate();
  const generatedId = useId();
  const fieldId = providedId ?? `multicombobox-${generatedId}`;
  const listboxId = `${fieldId}-listbox`;
  const field = resolveFieldStatus({ status, statusMessage, error });
  const labelId = fieldIds(fieldId).label;

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

  const describedBy = fieldDescribedBy(fieldId, {
    statusMessage: field.statusMessage,
    helperText,
  });

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
      // A pick ends the search, so the next one starts from the full list.
      setQuery("");
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

  // Chips stay on one line: the ones that do not fit collapse into a "+N"
  // badge. A hidden copy of every chip (and of the widest "+N") is measured
  // against the room left beside the filter input.
  const innerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(Number.POSITIVE_INFINITY);
  const [measurable, setMeasurable] = useState(false);

  const measure = useCallback(() => {
    const inner = innerRef.current;
    // Not laid out (hidden, or a test DOM): show every chip, skip the ruler.
    if (!inner || inner.clientWidth === 0) {
      setMeasurable(false);
      setVisibleCount(Number.POSITIVE_INFINITY);
      return;
    }
    setMeasurable(true);
    const ruler = measureRef.current;
    if (!ruler) return;
    const chips = Array.from(
      ruler.querySelectorAll<HTMLElement>("[data-measure-chip]"),
    );
    const more = ruler.querySelector<HTMLElement>("[data-measure-more]");
    const innerStyle = getComputedStyle(inner);
    const gap = parseFloat(innerStyle.columnGap) || 0;
    const room =
      inner.clientWidth -
      (parseFloat(innerStyle.paddingInlineStart) || 0) -
      (parseFloat(innerStyle.paddingInlineEnd) || 0) -
      (inputRef.current
        ? parseFloat(getComputedStyle(inputRef.current).minInlineSize) || 0
        : 0) -
      gap;
    let used = 0;
    let fits = 0;
    for (let index = 0; index < chips.length; index += 1) {
      const isLast = index === chips.length - 1;
      const reserve = isLast ? 0 : (more?.offsetWidth ?? 0) + gap;
      const next = used + chips[index].offsetWidth + (index > 0 ? gap : 0);
      if (next + reserve > room) break;
      used = next;
      fits = index + 1;
    }
    // Always show one chip (it truncates) so the field never reads as empty.
    setVisibleCount(chips.length > 0 ? Math.max(1, fits) : 0);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, value, labelByValue, measurable]);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(inner);
    return () => observer.disconnect();
  }, [measure]);

  const shownValues = value.slice(0, visibleCount);
  const hiddenValues = value.slice(visibleCount);

  const { mounted, dropdownStyle, controlRef, listRef, containerRef } =
    useComboboxDropdown(open, filteredOptions.length, closeDropdown);

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
    <FieldShell
      ref={containerRef}
      className={className}
      controlId={fieldId}
      label={label}
      required={required}
      disabled={disabled}
      status={field.status}
      statusMessage={field.statusMessage}
      helperText={helperText}
      actions={actions}
    >
      <div className={fieldStyles.wrapper}>
        <div
          ref={controlRef}
          className={cn(
            fieldStyles.control,
            styles.control,
            open && fieldStyles.controlOpen,
            fieldStatusClass(field.status),
            disabled && fieldStyles.disabled,
          )}
          data-state={open ? "open" : "closed"}
          data-field-status={field.status}
          onMouseDown={(event) => {
            if ((event.target as HTMLElement).closest("[data-chip-remove]")) {
              return;
            }
            if (
              (event.target as HTMLElement).closest("[data-chevron-toggle]")
            ) {
              return;
            }
            event.preventDefault();
            inputRef.current?.focus();
            openDropdown();
          }}
        >
          <div className={styles.inner} ref={innerRef}>
            {shownValues.map((selectedValue) => {
              const optionLabel =
                labelByValue.get(selectedValue) ?? selectedValue;
              return (
                <span
                  key={selectedValue}
                  className={cn(
                    styles.badgeWrap,
                    shownValues.length === 1 && styles.badgeWrapShrink,
                  )}
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

            {hiddenValues.length > 0 ? (
              <span
                className={styles.badgeWrap}
                title={hiddenValues
                  .map((entry) => labelByValue.get(entry) ?? entry)
                  .join(", ")}
              >
                <Badge variant="secondary" tone="neutral" size="sm">
                  <span aria-hidden="true">+{hiddenValues.length}</span>
                  <span className="sr-only">
                    {t(
                      "multiComboboxMoreSelected",
                      "{{count}} more selected: {{labels}}",
                      {
                        count: hiddenValues.length,
                        labels: hiddenValues
                          .map((entry) => labelByValue.get(entry) ?? entry)
                          .join(", "),
                      },
                    )}
                  </span>
                </Badge>
              </span>
            ) : null}

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
              aria-labelledby={labelId}
              aria-describedby={describedBy}
              aria-invalid={field.status === "error" ? true : undefined}
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

          {measurable ? (
            <div ref={measureRef} className={styles.measure} aria-hidden="true">
              {value.map((selectedValue) => (
                <span
                  key={selectedValue}
                  className={styles.badgeWrap}
                  data-measure-chip
                >
                  <Badge
                    variant="secondary"
                    tone="neutral"
                    size="sm"
                    removable={!disabled}
                    className={styles.badge}
                  >
                    <span className={styles.badgeLabel}>
                      {labelByValue.get(selectedValue) ?? selectedValue}
                    </span>
                  </Badge>
                </span>
              ))}
              <span className={styles.badgeWrap} data-measure-more>
                <Badge variant="secondary" tone="neutral" size="sm">
                  +{value.length}
                </Badge>
              </span>
            </div>
          ) : null}

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
              className={cn(
                fieldStyles.chevron,
                open && fieldStyles.chevronOpen,
              )}
              ariaLabel=""
            />
          </button>
        </div>

        {mounted && dropdown && createPortal(dropdown, document.body)}
      </div>

    </FieldShell>
  );
}

MultiCombobox.displayName = "MultiCombobox";

export default MultiCombobox;
