"use client";

import React, { useMemo, useState } from "react";
import Combobox, {
  optionsFromSelectChildren,
  splitPlaceholderOption,
} from "@dt/Combobox";
import type { FieldAction, FieldStatus } from "@dt/FieldShell";
import { warnPropRename } from "../../utils/deprecationWarning";
import { normalizeSizeProp, type SizeUnified } from "../../utils/sizeNormalization";

export interface SelectOptionItem {
  value: string;
  label: string;
  /** Disables this option. */
  disabled?: boolean;
}

export interface SelectProps {
  /** Label text displayed above the field */
  label: string;
  /** Option objects with value, label, and optional disabled; children override this */
  options?: SelectOptionItem[];
  /** `<option>` or `SelectOption` children; an option with value "" becomes the placeholder */
  children?: React.ReactNode;
  /** Supporting text under the control, below the status message. */
  helperText?: string;
  /** Error message under the control; shorthand for status="error" with this message. Sets aria-invalid. */
  error?: string;
  /** Semantic state: colours the border and styles statusMessage. `error` overrides it. */
  status?: FieldStatus;
  /** Message under the control for `status`, above the helper line */
  statusMessage?: string;
  /** Icon buttons at the end of the label row: each runs an operation or opens a menu */
  actions?: FieldAction[];
  /** Size variant for select */
  size?: SizeUnified;
  /** Selected value (controlled); "" shows the placeholder */
  value?: string;
  /** Initial value when uncontrolled */
  defaultValue?: string;
  /** Value change handler (recommended) */
  onValueChange?: (value: string) => void;
  /** Disables the select. */
  disabled?: boolean;
  /** Marks the field required. */
  required?: boolean;
  /** Explicit control id (wires the label); auto-generated when omitted */
  id?: string;
  /** Submits the value with a surrounding form, through a hidden input */
  name?: string;
  /** Classes on the field wrapper */
  className?: string;

  // DEPRECATED PROPS
  /** @deprecated Use onValueChange instead. Will be removed in v2.0.0 */
  onChange?: (value: string) => void;
}

/**
 * Single-choice field. Opens the DS option list (Combobox's select-only
 * combobox), never the operating system's native popup, so it looks and
 * behaves like every other DS dropdown.
 */
const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      label,
      options = [],
      children,
      helperText,
      error,
      status,
      statusMessage,
      actions,
      size = "md",
      value,
      defaultValue,
      onValueChange,
      onChange,
      disabled = false,
      required = false,
      id,
      name,
      className,
    },
    ref,
  ) => {
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

    const { placeholder, items } = useMemo(() => {
      const all = children ? optionsFromSelectChildren(children) : options;
      const split = splitPlaceholderOption(all);
      return { placeholder: split.placeholder, items: split.options };
    }, [children, options]);

    const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
    const current = value ?? uncontrolled;

    const handleValueChange = (next: string) => {
      if (value === undefined) setUncontrolled(next);
      onValueChange?.(next);
      onChange?.(next);
    };

    return (
      <Combobox
        ref={ref}
        id={id}
        label={label}
        options={items}
        value={current}
        placeholder={placeholder}
        onValueChange={handleValueChange}
        helperText={helperText}
        error={error}
        status={status}
        statusMessage={statusMessage}
        actions={actions}
        size={normalizeSizeProp(size)}
        required={required}
        disabled={disabled}
        name={name}
        className={className}
      />
    );
  },
);

Select.displayName = "Select";

export default Select;
