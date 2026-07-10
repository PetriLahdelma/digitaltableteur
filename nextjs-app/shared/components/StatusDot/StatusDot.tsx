import React from "react";
import { cn } from "../../lib/cn";
import styles from "./StatusDot.module.css";

export type StatusDotTone = "neutral" | "success" | "warning" | "error" | "info";
export type StatusDotSize = "sm" | "md" | "lg";

export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic tone of the status. @default "neutral" */
  tone?: StatusDotTone;
  /** Size token. @default "md" */
  size?: StatusDotSize;
  /** Animates a soft pulse for live/ongoing states (respects reduced motion). @default false */
  pulse?: boolean;
  /** Accessible label when no visible children are given (e.g. "Online"). */
  label?: string;
  /** Visible label text rendered next to the dot. */
  children?: React.ReactNode;
}

/** Tiny semantic status indicator: a colored dot with a visible or sr-only label. */
export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  (
    { tone = "neutral", size = "md", pulse = false, label, children, className, ...rest },
    ref,
  ) => (
    <span ref={ref} className={cn(styles.root, styles[size], className)} {...rest}>
      <span
        aria-hidden="true"
        className={cn(styles.dot, styles[tone], pulse && styles.pulse)}
      />
      {children ? (
        <span className={styles.label}>{children}</span>
      ) : label ? (
        <span className={styles.srOnly}>{label}</span>
      ) : null}
    </span>
  ),
);

StatusDot.displayName = "StatusDot";

export default StatusDot;
