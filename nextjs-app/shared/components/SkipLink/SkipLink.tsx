"use client";

import { cn } from "@/lib/utils";

import styles from "./SkipLink.module.css";

export interface SkipLinkProps {
  /** Target fragment for the main content region. @default "#main-content" */
  href?: string;
  /** Visible link text on focus. @default "Skip to main content" */
  children?: React.ReactNode;
  /** Optional utility classes on the link. */
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
