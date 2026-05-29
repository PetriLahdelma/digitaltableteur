"use client";

import { type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SectionProps {
  children: ReactNode;
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  background?: "default" | "muted" | "accent" | "inverse";
  className?: string;
  id?: string;
}

const spacingClasses = {
  none: "",
  sm: "py-8 tablet:py-12 desktop:py-16",
  md: "py-12 tablet:py-16 desktop:py-24",
  lg: "py-16 tablet:py-24 desktop:py-32",
  xl: "py-24 tablet:py-32 desktop:py-48",
} as const;

const backgroundClasses = {
  default: "bg-background",
  muted: "bg-muted",
  accent: "bg-primary/5",
  inverse: "bg-foreground text-background",
} as const;

/**
 * Section component.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ children, spacing = "md", background = "default", className, id }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          spacingClasses[spacing],
          backgroundClasses[background],
          className
        )}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";
