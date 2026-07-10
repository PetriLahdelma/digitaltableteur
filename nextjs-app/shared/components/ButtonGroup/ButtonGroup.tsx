import React from "react";
import { cn } from "../../lib/cn";
import styles from "./ButtonGroup.module.css";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name for the group (announced by screen readers). */
  ariaLabel?: string;
  /** Fuse the children into one segmented control surface. @default true */
  attached?: boolean;
  /** Buttons / IconButtons of the same variant and size. */
  children: React.ReactNode;
}

/** Groups related Buttons into one row — attached (segmented) or evenly spaced. */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ ariaLabel, attached = true, children, className, ...rest }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      className={cn(styles.group, attached ? styles.attached : styles.spaced, className)}
      {...rest}
    >
      {children}
    </div>
  ),
);

ButtonGroup.displayName = "ButtonGroup";

export default ButtonGroup;
