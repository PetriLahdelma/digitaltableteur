import { type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  center?: boolean;
  className?: string;
  as?: ElementType;
}

const sizeClasses = {
  sm: "max-w-container-sm",   // 640px
  md: "max-w-container-md",   // 960px
  lg: "max-w-container-lg",   // 1200px
  xl: "max-w-container-xl",   // 1440px
  full: "max-w-full",
} as const;

/**
 * Container component.
 */
export function Container({
  children,
  size = "lg",
  center = true,
  className,
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={cn(
        "w-full px-4 tablet:px-8 desktop:px-12",
        sizeClasses[size],
        center && "mx-auto",
        className
      )}
    >
      {children}
    </Component>
  );
}
