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

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
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
}: FormFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

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
