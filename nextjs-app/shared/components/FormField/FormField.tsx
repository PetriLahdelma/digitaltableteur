"use client";

import { type ReactNode, useId } from "react";
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

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} required={required} disabled={disabled}>
        {label}
      </Label>

      {/* Children should be Input, Textarea, or Select with id prop */}
      {children}

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
