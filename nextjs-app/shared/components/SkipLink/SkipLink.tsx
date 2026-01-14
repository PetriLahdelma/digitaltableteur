"use client";

import { cn } from "@/lib/utils";

export interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only",
        "focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "focus:px-4 focus:py-2 focus:rounded-md",
        "focus:bg-foreground focus:text-background",
        "focus:font-body focus:text-text-m focus:font-medium",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring",
        className
      )}
    >
      {children}
    </a>
  );
}
