"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import Combobox, {
  optionsFromSelectChildren,
  splitPlaceholderOption,
} from "@dt/Combobox";
import styles from "./FormFieldEditorial.module.css";

type InputType = "text" | "email" | "tel" | "textarea" | "select";

interface BaseProps {
  /** Field label (displayed as uppercase) */
  label: string;
  /** Error message */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Additional className */
  className?: string;
  /** Field ID (auto-generated from label if not provided) */
  id?: string;
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
  const { label, error, required, className, id: providedId, type = "text", ...restProps } = props;
  const id = providedId || generateId(label);
  const errorId = `${id}-error`;

  const labelElement = (
    <label htmlFor={id} className={styles.label}>
      {label}
      {required && <span className={styles.required}>*</span>}
    </label>
  );

  const errorElement = error && (
    <p id={errorId} className={styles.error} role="alert">
      {error}
    </p>
  );

  if (type === "textarea") {
    const { children, rows = 5, ...textareaProps } = restProps as Omit<TextareaProps, keyof BaseProps | "type">;
    return (
      <div className={cn(styles.field, className)}>
        {labelElement}
        <textarea
          ref={(node) => setForwardedRef(ref, node)}
          id={id}
          rows={rows}
          className={cn(styles.textarea, error && styles.hasError)}
          aria-invalid={!!error}
          aria-required={required || undefined}
          aria-describedby={error ? errorId : undefined}
          {...textareaProps}
        />
        {errorElement}
      </div>
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
        required={required}
        disabled={disabled}
        className={className}
      />
    );
  }

  // Default: text, email, tel inputs
  const inputProps = restProps as Omit<TextInputProps, keyof BaseProps | "type">;
  return (
    <div className={cn(styles.field, className)}>
      {labelElement}
      <input
        ref={(node) => setForwardedRef(ref, node)}
        id={id}
        type={type}
        className={cn(styles.input, error && styles.hasError)}
        aria-invalid={!!error}
        aria-required={required || undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {errorElement}
    </div>
  );
});

FormFieldEditorial.displayName = "FormFieldEditorial";
