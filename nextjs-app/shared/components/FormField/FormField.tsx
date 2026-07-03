"use client";

import {
  type ReactNode,
  type ReactElement,
  cloneElement,
  isValidElement,
  useId,
} from "react";
import { cn } from "@/lib/utils";
import Label from "@dt/Label";
import styles from "./FormField.module.css";

export interface FormFieldProps {
  /** Visible field label. Required in single-control mode; omit when `legend` is set. */
  label?: string;
  children: ReactNode;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  /**
   * Accessible name for a group of controls. Setting this switches FormField
   * into group mode: it renders a `<fieldset>` + `<legend>` around `children`
   * instead of the single-control label/aria-describedby wiring. Mutually
   * exclusive with `label`.
   */
  legend?: string;
  /** Helper text shown under the legend in group mode. */
  groupDescription?: string;
}

export function FormField({
  label,
  children,
  error,
  helperText,
  required,
  disabled,
  className,
  id: propId,
  legend,
  groupDescription,
}: FormFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  if (process.env.NODE_ENV !== "production") {
    if (label && legend) {
      // eslint-disable-next-line no-console
      console.error(
        "FormField: both `label` and `legend` were provided. Pass only `label` for single-control mode or only `legend` for group mode, not both.",
      );
    } else if (!label && !legend) {
      // eslint-disable-next-line no-console
      console.error(
        "FormField: neither `label` nor `legend` was provided. Pass `label` for single-control mode or `legend` for group mode.",
      );
    }
  }

  if (legend) {
    return (
      <fieldset
        className={cn(styles.fieldset, className)}
        disabled={disabled}
      >
        <legend className={styles.legend}>
          {legend}
          {required ? <span aria-hidden="true"> *</span> : null}
        </legend>
        {groupDescription ? (
          <p className={styles.groupDescription}>{groupDescription}</p>
        ) : null}
        <div className={styles.groupControls}>{children}</div>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </fieldset>
    );
  }

  // Wire description + validation state onto the actual control so assistive
  // tech announces the error/help text. The control keeps its own id when it
  // sets one; otherwise it inherits the id the Label points at.
  const control = isValidElement(children)
    ? (children as ReactElement<Record<string, unknown>>)
    : null;
  const controlId = (control?.props.id as string | undefined) ?? id;
  const describedBy =
    [
      error ? errorId : null,
      helperText && !error ? helperId : null,
      control?.props["aria-describedby"] as string | undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const field = control
    ? cloneElement(control, {
        id: controlId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : control.props["aria-invalid"],
      })
    : children;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={controlId} required={required} disabled={disabled}>
        {label}
      </Label>

      {field}

      {error && (
        <p
          id={errorId}
          className="font-body text-text-s text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}

      {helperText && !error && (
        <p
          id={helperId}
          className="font-body text-text-s text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
