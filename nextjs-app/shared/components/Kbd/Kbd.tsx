import React from "react";
import { cn } from "@/lib/utils";
import styles from "./Kbd.module.css";

export type KbdSize = "sm" | "md" | "lg";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** Size token. @default "md" */
  size?: KbdSize;
}

/** Keyboard key indicator: renders a semantic <kbd> styled as a keycap. */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ size = "md", className, children, ...rest }, ref) => (
    <kbd
      ref={ref}
      className={cn(styles.kbd, styles[size], className)}
      {...rest}
    >
      {children}
    </kbd>
  ),
);

Kbd.displayName = "Kbd";

export default Kbd;
