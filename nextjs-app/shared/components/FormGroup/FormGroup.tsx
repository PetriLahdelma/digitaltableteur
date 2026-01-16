import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FormGroupProps {
  children: ReactNode;
  legend?: string;
  description?: string;
  className?: string;
}

export function FormGroup({
  children,
  legend,
  description,
  className,
}: FormGroupProps) {
  return (
    <fieldset className={cn("space-y-4", className)}>
      {legend && (
        <legend className="font-heading text-title-s font-semibold mb-2">
          {legend}
        </legend>
      )}
      {description && (
        <p className="font-body text-text-s text-muted-foreground -mt-1 mb-4">
          {description}
        </p>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </fieldset>
  );
}
