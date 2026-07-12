import React from "react";
import { cn } from "../../lib/cn";

export interface DisplayProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render, defaults to h1 */
  as?: "h1" | "h2" | "p" | "span" | "div";
  /** Content to display */
  children: React.ReactNode;
}

/**
 * Display component for hero and large text
 * Uses Satoshi at display size for maximum visual impact
 *
 * @example
 * <Display>Hero Title</Display>
 * <Display as="h2">Section Hero</Display>
 * <Display as="p" className="max-w-4xl">Tagline text</Display>
 */
export function Display({
  as: Tag = "h1",
  className,
  children,
  ...props
}: DisplayProps) {
  return (
    <Tag
      className={cn(
        "font-heading text-dt-display font-bold leading-tight text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export default Display;
