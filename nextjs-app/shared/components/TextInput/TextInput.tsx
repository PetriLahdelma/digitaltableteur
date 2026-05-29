"use client";

import { forwardRef, type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "@phosphor-icons/react";

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  error?: boolean;
}

const sizeClasses = {
  sm: "h-8 px-3 text-text-s",
  md: "h-10 px-4 text-text-m",
  lg: "h-12 px-5 text-text-l",
} as const;

const iconSizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

/**
 * Single-line text input with optional icons and clear affordance.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      size = "md",
      startIcon,
      endIcon,
      clearable,
      onClear,
      error,
      className,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value ?? "");
    const displayValue = value ?? internalValue;
    const hasValue = Boolean(displayValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = () => {
      setInternalValue("");
      onClear?.();
    };

    return (
      <div className="relative">
        {startIcon && (
          <span
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
              iconSizeClasses[size]
            )}
          >
            {startIcon}
          </span>
        )}

        <input
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "w-full rounded-md border border-input bg-background font-body",
            "transition-colors placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive",
            sizeClasses[size],
            startIcon && "pl-10",
            (endIcon || clearable) && "pr-10",
            className
          )}
          {...props}
        />

        {(endIcon || (clearable && hasValue)) && (
          <span
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              iconSizeClasses[size]
            )}
          >
            {clearable && hasValue ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear input"
              >
                <X className={iconSizeClasses[size]} />
              </button>
            ) : (
              <span className="text-muted-foreground">{endIcon}</span>
            )}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
