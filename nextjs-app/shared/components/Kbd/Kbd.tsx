import React from "react";
import { cn } from "../../lib/cn";
import styles from "./Kbd.module.css";

export type KbdSize = "sm" | "md" | "lg";

export type KbdVariant = "primary" | "secondary";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** Size token. @default "md" */
  size?: KbdSize;
  /**
   * Visual style. `primary` is a filled light-gray keycap with a bottom edge
   * that reads like a physical key; `secondary` is the flatter outlined chip.
   * @default "primary"
   */
  variant?: KbdVariant;
}

/** Keyboard key indicator: renders a semantic <kbd> styled as a keycap. */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ size = "md", variant = "primary", className, children, ...rest }, ref) => (
    <kbd
      ref={ref}
      className={cn(styles.kbd, styles[variant], styles[size], className)}
      {...rest}
    >
      {children}
    </kbd>
  ),
);

Kbd.displayName = "Kbd";

export default Kbd;
