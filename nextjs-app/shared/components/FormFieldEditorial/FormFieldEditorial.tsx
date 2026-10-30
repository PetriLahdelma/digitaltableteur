"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import Combobox, {
  optionsFromSelectChildren,
  splitPlaceholderOption,
} from "@dt/Combobox";
import {
  FieldShell,
  fieldDescribedBy,
  fieldStatusClass,
  resolveFieldStatus,
  type FieldAction,
  type FieldStatus,
} from "@dt/FieldShell";
import styles from "./FormFieldEditorial.module.css";

type InputType = "text" | "email" | "tel" | "textarea" | "select";

interface BaseProps {
  /** Field label */
  label: string;
  /** Error message; shorthand for status="error" with this message */
  error?: string;
  /** Semantic state: colours the border and styles statusMessage. `error` overrides it. */
  status?: FieldStatus;
  /** Message under the field for `status`, above the helper line */
  statusMessage?: string;
  /** Icon buttons at the end of the label row: each runs an operation or opens a menu */
  actions?: FieldAction[];
  /** Whether the field is required */
  required?: boolean;
  /** Additional className */
  className?: string;
  /** Field ID (auto-generated from label if not provided) */
  id?: string;
  /**
   * Supporting text under the field, linked with aria-describedby. Use it,
   * for example, to say why a read-only value is fixed.
   */
  helperText?: string;
}

interface TextInputProps extends BaseProps, Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> {
  type?: "text" | "email" | "tel";
  children?: never;
}

interface TextareaProps extends BaseProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  type: "textarea";
  /** Number of rows for textarea */
  rows?: number;
  children?: never;
}

interface SelectProps extends BaseProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  type: "select";
  /** Select options */
  children: ReactNode;
}

export type FormFieldEditorialProps = TextInputProps | TextareaProps | SelectProps;

function generateId(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function setForwardedRef<T>(
  ref: React.ForwardedRef<T>,
  value: T | null,
) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  if (ref) {
    ref.current = value;
  }
}

/**
 * FormFieldEditorial component.
 */
export const FormFieldEditorial = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldEditorialProps
>(function FormFieldEditorial(props, ref) {
  const {
    label,
    error,
    status,
    statusMessage,
    actions,
    required,
    className,
    id: providedId,
    type = "text",
    helperText,
    ...restProps
  } = props;
  const id = providedId || generateId(label);
  const field = resolveFieldStatus({ status, statusMessage, error });
  const hasError = field.status === "error";
  const describe = (external?: string) =>
    fieldDescribedBy(id, { statusMessage: field.statusMessage, helperText }, external);

  const shell = (control: ReactNode) => (
    <FieldShell
      controlId={id}
      label={label}
      required={required}
      disabled={"disabled" in restProps ? !!restProps.disabled : false}
      status={field.status}
      statusMessage={field.statusMessage}
      helperText={helperText}
      actions={actions}
      className={className}
    >
      {control}
    </FieldShell>
  );

  if (type === "textarea") {
    const { children, rows = 5, ...textareaProps } = restProps as Omit<TextareaProps, keyof BaseProps | "type">;
    const {
      "aria-describedby": externalDescribedBy,
      ...forwardedTextareaProps
    } = textareaProps;
    return shell(
      <textarea
        ref={(node) => setForwardedRef(ref, node)}
        id={id}
        rows={rows}
        className={cn(styles.textarea, fieldStatusClass(field.status))}
        aria-invalid={hasError}
        aria-required={required || undefined}
        aria-describedby={describe(externalDescribedBy)}
        {...forwardedTextareaProps}
      />,
    );
  }

  if (type === "select") {
    const { children, value, defaultValue, onChange, disabled, name } =
      restProps as Omit<SelectProps, keyof BaseProps | "type">;

    const parsedOptions = optionsFromSelectChildren(children);
    const { placeholder, options } = splitPlaceholderOption(parsedOptions);
    const currentValue =
      value === undefined || value === null
        ? defaultValue === undefined || defaultValue === null
          ? ""
          : String(defaultValue)
        : String(value);

    return (
      <Combobox
        id={id}
        label={label}
        options={options}
        value={currentValue}
        placeholder={placeholder}
        onValueChange={(nextValue) => {
          onChange?.({
            target: { value: nextValue, name: name ?? id },
            currentTarget: { value: nextValue, name: name ?? id },
          } as React.ChangeEvent<HTMLSelectElement>);
        }}
        error={error}
        status={status}
        statusMessage={statusMessage}
        helperText={helperText}
        actions={actions}
        required={required}
        disabled={disabled}
        className={className}
      />
    );
  }

  // Default: text, email, tel inputs
  const inputProps = restProps as Omit<TextInputProps, keyof BaseProps | "type">;
  const {
    "aria-describedby": externalDescribedBy,
    ...forwardedInputProps
  } = inputProps;
  return shell(
    <input
      ref={(node) => setForwardedRef(ref, node)}
      id={id}
      type={type}
      className={cn(styles.input, fieldStatusClass(field.status))}
      aria-invalid={hasError}
      aria-required={required || undefined}
      aria-describedby={describe(externalDescribedBy)}
      {...forwardedInputProps}
    />,
  );
});

FormFieldEditorial.displayName = "FormFieldEditorial";
