"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import Checkbox from "@dt/Checkbox";

export interface CheckboxFieldProps {
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export function CheckboxField({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  required,
  error,
  className,
  id: propId,
}: CheckboxFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  return (
    <div className={cn("space-y-1", className)}>
      <Checkbox
        id={id}
        label={label}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : undefined}
      />
      {description && (
        <p className="font-body text-text-s text-muted-foreground pl-0">
          {description}
        </p>
      )}
      {error && (
        <p className="font-body text-text-s text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
