import { type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

export interface StackProps {
  /** Stacked children. */
  children: ReactNode;
  /** Stack axis. @default "vertical" */
  direction?: "vertical" | "horizontal";
  /** Gap token between items. @default "md" */
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  /** Cross-axis alignment. @default "center" */
  align?: "start" | "center" | "end" | "stretch";
  /** Main-axis distribution. */
  justify?: "start" | "center" | "end" | "between" | "around";
  /** Allow wrapping on horizontal stacks. */
  wrap?: boolean;
  /** Stack class names. */
  className?: string;
  /** Polymorphic element. @default "div" */
  as?: ElementType;
}

const gapClasses = {
  none: "gap-0",
  xs: "gap-1",      // 4px
  sm: "gap-2",      // 8px
  md: "gap-4",      // 16px
  lg: "gap-6",      // 24px
  xl: "gap-8",      // 32px
} as const;

const alignClasses = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const justifyClasses = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
} as const;

/**
 * Stack component.
 */
export function Stack({
  children,
  direction = "vertical",
  gap = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  className,
  as: Component = "div",
}: StackProps) {
  return (
    <Component
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </Component>
  );
}
