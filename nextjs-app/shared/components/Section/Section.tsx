"use client";

import { type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SectionProps {
  /** Section content. */
  children: ReactNode;
  /** Block padding scale. @default "md" */
  spacing?: "none" | "sm" | "md" | "lg" | "xl" | "hero" | "follow";
  /** Surface background token. @default "default" */
  background?: "default" | "muted" | "accent" | "inverse";
  /** Section class names. */
  className?: string;
  /** Section id (anchor target). */
  id?: string;
  /** Whitelisted Donny spotlight / navigation target id */
  donnyTarget?: string;
}

const spacingClasses = {
  none: "",
  sm: "py-8 tablet:py-12 desktop:py-16",
  md: "py-12 tablet:py-16 desktop:py-24",
  lg: "py-16 tablet:py-24 desktop:py-32",
  xl: "py-24 tablet:py-32 desktop:py-48",
  /** Page hero — generous top, tight bottom (pair with `follow`) */
  hero: "pt-16 tablet:pt-24 desktop:pt-32 pb-8 tablet:pb-10 desktop:pb-12",
  /** Content directly after a page hero — avoids double vertical gap */
  follow: "pt-0 pb-16 tablet:pb-24 desktop:pb-32",
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
  ({ children, spacing = "md", background = "default", className, id, donnyTarget }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        data-donny-target={donnyTarget}
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
