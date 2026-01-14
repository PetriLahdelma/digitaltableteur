"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ServiceCardProps {
  /** Icon element displayed at the top */
  icon?: ReactNode;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Optional link URL */
  href?: string;
  /** Card style variant */
  variant?: "default" | "bordered" | "elevated" | "minimal";
  /** Icon position */
  iconPosition?: "top" | "left";
  /** Custom className */
  className?: string;
}

const variantClasses: Record<NonNullable<ServiceCardProps["variant"]>, string> = {
  default: "bg-card border border-border",
  bordered: "bg-transparent border-2 border-border",
  elevated: "bg-card shadow-lg border border-border/50",
  minimal: "bg-transparent",
};

const hoverVariantClasses: Record<NonNullable<ServiceCardProps["variant"]>, string> = {
  default: "hover:border-primary/50 hover:shadow-md",
  bordered: "hover:border-primary hover:bg-primary/5",
  elevated: "hover:shadow-xl hover:-translate-y-1",
  minimal: "hover:bg-muted/50",
};

export function ServiceCard({
  icon,
  title,
  description,
  href,
  variant = "default",
  iconPosition = "top",
  className,
}: ServiceCardProps) {
  const cardContent = (
    <>
      {icon && (
        <div
          className={cn(
            "flex-shrink-0 text-primary",
            iconPosition === "top" ? "mb-4" : "mr-4",
            "[&>svg]:size-8 [&>svg]:stroke-[1.5]"
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-display font-semibold text-lg text-foreground mb-2">
          {title}
        </h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </>
  );

  const baseClasses = cn(
    "group flex rounded-lg p-6 transition-all duration-300",
    iconPosition === "top" ? "flex-col" : "flex-row items-start",
    variantClasses[variant],
    hoverVariantClasses[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {cardContent}
      </Link>
    );
  }

  return <div className={baseClasses}>{cardContent}</div>;
}

ServiceCard.displayName = "ServiceCard";
