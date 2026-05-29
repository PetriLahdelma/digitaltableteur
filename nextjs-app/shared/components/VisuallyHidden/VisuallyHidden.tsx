import React from "react";
import styles from "./VisuallyHidden.module.css";

export interface VisuallyHiddenProps {
  children: React.ReactNode;
  /** Element to render (default span) */
  as?: "span" | "div" | "p" | "h2";
  className?: string;
}

/** Screen-reader-only content; visible on focus when wrapped in interactive parents. */
export function VisuallyHidden({
  children,
  as: Component = "span",
  className,
}: VisuallyHiddenProps) {
  return (
    <Component className={[styles.root, className].filter(Boolean).join(" ")}>
      {children}
    </Component>
  );
}

VisuallyHidden.displayName = "VisuallyHidden";
export default VisuallyHidden;
