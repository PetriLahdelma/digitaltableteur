"use client";

import { cn } from "@/lib/utils";

import styles from "./SkipLink.module.css";

export interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * SkipLink component.
 *
 * Visually hidden until focused, then surfaces as a high-contrast pill so
 * keyboard users can jump straight to the main content.
 */
export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a href={href} className={cn(styles.skipLink, className)}>
      {children}
    </a>
  );
}
