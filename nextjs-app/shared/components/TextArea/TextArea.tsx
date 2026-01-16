"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  error?: boolean;
}

const sizeClasses = {
  sm: "min-h-[80px] px-3 py-2 text-text-s",
  md: "min-h-[120px] px-4 py-3 text-text-m",
  lg: "min-h-[160px] px-5 py-4 text-text-l",
} as const;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      size = "md",
      showCount,
      maxLength,
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
    const charCount = String(displayValue).length;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            "w-full rounded-md border border-input bg-background font-body resize-y",
            "transition-colors placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive",
            showCount && "pb-8",
            sizeClasses[size],
            className
          )}
          {...props}
        />

        {showCount && (
          <span
            className={cn(
              "absolute bottom-2 right-3 font-body text-text-s text-muted-foreground",
              maxLength && charCount >= maxLength && "text-destructive"
            )}
          >
            {charCount}
            {maxLength && `/${maxLength}`}
          </span>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
