"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface TextLinkProps {
  href: string;
  children: ReactNode;
  variant?: "default" | "muted" | "accent";
  underline?: "always" | "hover" | "none";
  external?: boolean;
  className?: string;
}

const variantClasses = {
  default: "text-foreground hover:text-foreground/80",
  muted: "text-muted-foreground hover:text-foreground",
  accent: "text-primary hover:text-primary/80",
} as const;

const underlineClasses = {
  always: "underline underline-offset-4",
  hover: "hover:underline underline-offset-4",
  none: "",
} as const;

export function TextLink({
  href,
  children,
  variant = "default",
  underline = "hover",
  external,
  className,
}: TextLinkProps) {
  const isExternal = external ?? (!href.startsWith("/") && !href.startsWith("#"));

  const linkClasses = cn(
    // rounded-sm matches header controls so the :focus-visible outline
    // renders with consistent corner rounding site-wide.
    "inline-flex items-center gap-1 transition-colors font-body rounded-sm",
    variantClasses[variant],
    underlineClasses[underline],
    className
  );

  if (isExternal) {
    return (
      <a
        href={href}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
        <span className="inline-block size-3.5" aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <Link href={href} className={linkClasses}>
      {children}
    </Link>
  );
}
