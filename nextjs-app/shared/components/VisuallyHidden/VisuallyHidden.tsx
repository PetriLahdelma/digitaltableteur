import { type ReactNode } from "react";

export interface VisuallyHiddenProps {
  children: ReactNode;
  as?: "span" | "div";
}

export function VisuallyHidden({
  children,
  as: Component = "span",
}: VisuallyHiddenProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}
