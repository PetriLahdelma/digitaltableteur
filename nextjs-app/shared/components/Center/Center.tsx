import { type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

export interface CenterProps {
  /** Content to center inside the flex container. */
  children: ReactNode;
  /** Additional CSS class names (often a height constraint). */
  className?: string;
  /** Polymorphic wrapper element. @default "div" */
  as?: ElementType;
}

export function Center({
  children,
  className,
  as: Component = "div",
}: CenterProps) {
  return (
    <Component
      className={cn(
        "flex items-center justify-center",
        className
      )}
    >
      {children}
    </Component>
  );
}
