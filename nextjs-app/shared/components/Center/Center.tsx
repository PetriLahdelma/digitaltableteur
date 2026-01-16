import { type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

export interface CenterProps {
  children: ReactNode;
  className?: string;
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
