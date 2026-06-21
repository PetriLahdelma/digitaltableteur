import React from "react";
import { cn } from "@/lib/utils";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "display" | "xl" | "lg" | "md" | "sm" | "xs";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Semantic heading level (1-6), defaults to 2 */
  level?: HeadingLevel;
  /** Override the rendered element (h1-h6) */
  as?: `h${HeadingLevel}`;
  /** Visual size variant */
  size?: HeadingSize;
  /** Content to display */
  children: React.ReactNode;
}

const sizeClasses: Record<HeadingSize, string> = {
  display: "text-display font-bold leading-tight",
  xl: "text-title-xl font-bold leading-tight",
  lg: "text-title-l font-semibold leading-snug",
  md: "text-title-m font-semibold leading-snug",
  sm: "text-title-s font-medium leading-normal",
  xs: "text-text-l font-medium leading-normal",
};

/**
 * Heading component using Tailwind CSS utilities
 * Uses Satoshi via font-heading for display/heading typography
 *
 * @example
 * <Heading level={1} size="xl">Page Title</Heading>
 * <Heading level={2}>Section Heading</Heading>
 * <Heading as="h3" size="sm">Small Heading</Heading>
 */
export function Heading({
  level = 2,
  as,
  size,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = as || (`h${level}` as const);
  const defaultSize: HeadingSize =
    level === 1 ? "xl" : level === 2 ? "lg" : level === 3 ? "md" : "sm";
  const sizeClass = sizeClasses[size || defaultSize];

  return (
    <Tag
      className={cn("font-heading text-foreground", sizeClass, className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default Heading;
