"use client";

import React, { createContext, useContext, useId, useState } from "react";
import Card, { type CardProps } from "@dt/Card";
import HelperText from "@dt/HelperText";
import styles from "./SelectableCard.module.css";

export type SelectableCardSelectionType = "single" | "multiple";

interface GroupContextValue {
  type: SelectableCardSelectionType;
  name: string;
  disabled: boolean;
  isSelected: (value: string) => boolean;
  toggle: (value: string) => void;
}

const GroupContext = createContext<GroupContextValue | null>(null);

/** Normalize a controlled/default value (string | string[]) to an array. */
function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value === "" ? [] : [value];
}

export interface SelectableCardGroupProps {
  /** Selection model — single is an exclusive set (radio), multiple toggles independently (checkbox). @default "single" */
  type?: SelectableCardSelectionType;
  /** Group label rendered as the fieldset legend (required for an accessible name). */
  legend: string;
  /** Native radio group name shared by the set (single); auto-generated when omitted. */
  name?: string;
  /** Controlled selection: `string` for single, `string[]` for multiple. `""` / `[]` treated as absent (uncontrolled). */
  value?: string | string[];
  /** Initial selection when uncontrolled. */
  defaultValue?: string | string[];
  /** Fired with the next selection — a `string` for single, a `string[]` for multiple. */
  onValueChange?: (value: string | string[]) => void;
  /** Stack direction. @default "vertical" */
  orientation?: "vertical" | "horizontal";
  /** Disables the whole set; per-card disabled still keeps individual choices visible. @default false */
  disabled?: boolean;
  /** Error message; announces via role=alert and sets aria-invalid. */
  error?: string;
  /** Helper copy below the group; suppressed while error is set. */
  helperText?: string;
  /** Merged onto the fieldset. */
  className?: string;
  /** SelectableCard children. */
  children: React.ReactNode;
}

/**
 * A set of selectable cards. Single-select behaves as an exclusive radio set;
 * multiple toggles each card independently. Selection is owned here (controlled
 * or uncontrolled) and shared with the cards through context.
 */
export const SelectableCardGroup: React.FC<SelectableCardGroupProps> = ({
  type = "single",
  legend,
  name: nameProp,
  value,
  defaultValue,
  onValueChange,
  orientation = "vertical",
  disabled = false,
  error,
  helperText,
  className,
  children,
}) => {
  const autoName = useId();
  const name = nameProp || `selectable-card-group-${autoName}`;
  // "" / [] mean absent — the group stays uncontrolled and clickable, matching
  // the RadioGroup controls convention.
  const providedValue = toArray(value);
  const isControlled = value !== undefined && providedValue.length > 0;
  const [internal, setInternal] = useState<string[]>(toArray(defaultValue));
  const selected = isControlled ? providedValue : internal;
  const helperId = `${name}-helper`;
  const errorId = `${name}-error`;

  const emit = (next: string[]) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(type === "single" ? (next[0] ?? "") : next);
  };

  const toggle = (val: string) => {
    if (type === "single") {
      emit([val]);
      return;
    }
    emit(
      selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val],
    );
  };

  const ctx: GroupContextValue = {
    type,
    name,
    disabled,
    isSelected: (val) => selected.includes(val),
    toggle,
  };

  return (
    <fieldset
      className={[styles.group, className].filter(Boolean).join(" ")}
      aria-describedby={
        [helperText ? helperId : null, error ? errorId : null]
          .filter(Boolean)
          .join(" ") || undefined
      }
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
        <GroupContext.Provider value={ctx}>{children}</GroupContext.Provider>
      </div>
      {helperText ? <HelperText id={helperId}>{helperText}</HelperText> : null}
      {error ? (
        <HelperText id={errorId} state="error">
          {error}
        </HelperText>
      ) : null}
    </fieldset>
  );
};

SelectableCardGroup.displayName = "SelectableCardGroup";

export interface SelectableCardProps extends Omit<
  CardProps,
  "onChange" | "link" | "linkLabel"
> {
  /** Submitted value / selection key. */
  value: string;
  /** Per-card disable; the choice stays visible. @default false */
  disabled?: boolean;
  /** Standalone selected state when used outside a SelectableCardGroup. */
  selected?: boolean;
  /** Standalone change handler when used outside a SelectableCardGroup. */
  onSelectedChange?: (selected: boolean) => void;
}

/**
 * A Card that is one selectable option. Inside a SelectableCardGroup it reads
 * its selected state from context and submits `value`; standalone it is a
 * controlled checkbox-style toggle via `selected` / `onSelectedChange`. The
 * whole card is a label wrapping a visually-hidden native input, so keyboard,
 * focus, and form submission come from the platform.
 */
export const SelectableCard: React.FC<SelectableCardProps> = ({
  value,
  disabled = false,
  selected,
  onSelectedChange,
  className,
  children,
  ...cardProps
}) => {
  const group = useContext(GroupContext);
  const inGroup = group !== null;
  const checked = inGroup ? group.isSelected(value) : Boolean(selected);
  const isDisabled = disabled || (inGroup ? group.disabled : false);
  const inputType: "radio" | "checkbox" =
    inGroup && group.type === "single" ? "radio" : "checkbox";
  const inputId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    if (inGroup) group.toggle(value);
    else onSelectedChange?.(e.target.checked);
  };

  return (
    <label
      className={[styles.card, isDisabled ? styles.disabled : ""]
        .filter(Boolean)
        .join(" ")}
      data-selected={checked ? "true" : "false"}
      data-disabled={isDisabled ? "true" : undefined}
    >
      <input
        id={inputId}
        type={inputType}
        className={styles.input}
        name={inGroup ? group.name : undefined}
        value={value}
        checked={checked}
        // Mirror the controlled state as an attribute so CSS/tests (and the
        // controls effect audit) can observe it, matching Radio/Checkbox.
        data-checked={String(checked)}
        disabled={isDisabled}
        onChange={handleChange}
      />
      <Card {...cardProps} className={styles.surface}>
        {children}
        <span
          className={styles.indicator}
          data-type={inputType}
          aria-hidden="true"
        />
      </Card>
    </label>
  );
};

SelectableCard.displayName = "SelectableCard";

export default SelectableCard;
