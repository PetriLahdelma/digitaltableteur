import { type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

import styles from "./Container.module.css";

export interface ContainerProps {
  /** Page content inside the width constraint. */
  children: ReactNode;
  /** Max-width token. @default "lg" */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Center the container horizontally. */
  center?: boolean;
  /** Wrapper class names. */
  className?: string;
  /** Polymorphic element. @default "div" */
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
        styles.container,
        sizeClasses[size],
        center && styles.centered,
        className
      )}
    >
      {children}
    </Component>
  );
}
