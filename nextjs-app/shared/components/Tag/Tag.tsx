import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, Warning, XCircle, Info } from "@phosphor-icons/react";

export interface TagProps {
  children: ReactNode;
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Show icon for semantic variants (success, warning, error, info). Default: true for color independence (WCAG 1.4.1) */
  showIcon?: boolean;
}

const variantClasses = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border border-border bg-transparent text-foreground",
  /* Semantic inks are one-two steps darker than the usual *-600: on the 10%
     tinted backgrounds the 600 shades sit below WCAG AA (green-600 measured
     2.95:1, yellow-600 2.75:1, red-600 4.14:1). These land at 5.5-6.6:1;
     the dark-theme *-400 inks measure 5.6-9.2:1 on the dark tints. */
  success: "bg-green-500/10 text-green-800 dark:text-green-400",
  warning: "bg-yellow-500/10 text-yellow-800 dark:text-yellow-400",
  error: "bg-red-500/10 text-red-700 dark:text-red-400",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
} as const;

const sizeClasses = {
  sm: "px-2 py-0.5 text-text-s",
  md: "px-2.5 py-1 text-text-s",
  lg: "px-3 py-1.5 text-text-m",
} as const;

const iconSizeClasses = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
} as const;

// Semantic variants that get icons for color independence (WCAG 1.4.1)
const semanticIcons = {
  success: CheckCircle,
  warning: Warning,
  error: XCircle,
  info: Info,
} as const;

type SemanticVariant = keyof typeof semanticIcons;

function isSemanticVariant(variant: string): variant is SemanticVariant {
  return variant in semanticIcons;
}

export function Tag({
  children,
  variant = "default",
  size = "md",
  className,
  showIcon = true,
}: TagProps) {
  const IconComponent = isSemanticVariant(variant) ? semanticIcons[variant] : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-body font-medium rounded-sm",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {showIcon && IconComponent && (
        <IconComponent
          weight="fill"
          className={cn("flex-shrink-0", iconSizeClasses[size])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
