"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ValueCardProps {
  /** Icon element */
  icon: ReactNode;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Optional className for the icon wrapper */
  iconClassName?: string;
  /** Card variant */
  variant?: "default" | "bordered" | "elevated";
  /** Custom className */
  className?: string;
}

const variantClasses: Record<NonNullable<ValueCardProps["variant"]>, string> = {
  default: "bg-background",
  bordered: "bg-background border border-border",
  elevated: "bg-card shadow-lg",
};

const hoverClasses: Record<NonNullable<ValueCardProps["variant"]>, string> = {
  default: "hover:bg-muted/50",
  bordered: "hover:border-primary/50 hover:shadow-sm",
  elevated: "hover:shadow-xl hover:-translate-y-1",
};

export function ValueCard({
  icon,
  title,
  description,
  iconClassName,
  variant = "default",
  className,
}: ValueCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden p-6 rounded-lg",
        "transition-all duration-300 ease-out",
        variantClasses[variant],
        hoverClasses[variant],
        className,
      )}
    >
      <div className="relative z-10">
        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center",
            "w-12 h-12 rounded-lg mb-4",
            "bg-primary/10 text-primary",
            "transition-colors duration-300",
            "group-hover:bg-primary/20",
            iconClassName,
          )}
        >
          {icon}
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-display font-semibold",
            "text-lg tablet:text-xl",
            "text-foreground mb-2",
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={cn(
            "font-body text-sm tablet:text-base",
            "text-muted-foreground",
            "leading-relaxed",
          )}
        >
          {description}
        </p>
      </div>
    </article>
  );
}

ValueCard.displayName = "ValueCard";
