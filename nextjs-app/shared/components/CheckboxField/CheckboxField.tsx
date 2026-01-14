"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
    <div className={cn("flex gap-3", className)}>
      <Checkbox
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-invalid={!!error}
        className="mt-0.5"
      />
      <div className="space-y-1">
        <Label
          htmlFor={id}
          className={cn(
            "font-body text-text-m leading-none cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-hidden>*</span>
          )}
        </Label>
        {description && (
          <p className="font-body text-text-s text-muted-foreground">
            {description}
          </p>
        )}
        {error && (
          <p className="font-body text-text-s text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
