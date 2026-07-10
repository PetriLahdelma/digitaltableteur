"use client";

import { type ReactNode } from "react";
import { Link } from "../../lib/linkComponent";
import { cn } from "../../lib/cn";

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
  /** Donny site action target id when this card is a spotlight anchor */
  donnyTarget?: string;
}

const variantClasses: Record<NonNullable<ServiceCardProps["variant"]>, string> = {
  default: "bg-card border-2 border-border",
  bordered: "bg-transparent border-2 border-foreground/10",
  elevated: "bg-card shadow-2xl border-0",
  minimal: "bg-transparent border-b-2 border-border/30 rounded-none pb-8",
};

const hoverVariantClasses: Record<NonNullable<ServiceCardProps["variant"]>, string> = {
  default: "hover:border-primary hover:shadow-lg",
  bordered: "hover:border-foreground/40 hover:bg-primary/5 hover:scale-[1.02]",
  elevated: "hover:shadow-3xl hover:-translate-y-2",
  minimal: "hover:border-foreground",
};

/**
 * ServiceCard component.
 */
export function ServiceCard({
  icon,
  title,
  description,
  href,
  variant = "default",
  iconPosition = "top",
  className,
  donnyTarget,
}: ServiceCardProps) {
  const cardContent = (
    <>
      {icon && (
        <div
          className={cn(
            "flex-shrink-0 text-primary transition-all duration-500 ease-out motion-reduce:transition-none",
            iconPosition === "top" ? "mb-6" : "mr-6",
            "[&>svg]:size-10 lg:[&>svg]:size-12 [&>svg]:stroke-[1.25]",
            // Premium hover: subtle scale + lift + enhanced color vibrancy
            "group-hover:scale-105 group-hover:-translate-y-0.5",
            "group-hover:text-primary/90 group-hover:drop-shadow-sm"
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-display font-bold text-xl text-foreground mb-3">
          {title}
        </h3>
        <p className="font-body text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </>
  );

  const baseClasses = cn(
    // motion-reduce guard: reducedMotion is claimed in the contract but the
    // global reset only covers the logo marquee; kill the animated hover
    // transitions (scale/lift) for reduced-motion users.
    "group flex h-full rounded-lg p-8 lg:p-10 transition-all duration-500 motion-reduce:transition-none",
    iconPosition === "top" ? "flex-col" : "flex-row items-start",
    variantClasses[variant],
    hoverVariantClasses[variant],
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={baseClasses}
        data-donny-interest="service"
        data-donny-target={donnyTarget}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={baseClasses} data-donny-target={donnyTarget}>
      {cardContent}
    </div>
  );
}

ServiceCard.displayName = "ServiceCard";
