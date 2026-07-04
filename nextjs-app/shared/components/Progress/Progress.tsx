import React from "react";
import styles from "./Progress.module.css";

export interface ProgressProps {
  /** Current progress value, scaled against max. @default 0 */
  value?: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Accessible name for the progressbar. @default "Progress" */
  label?: string;
  /** Track height token. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Semantic fill color. @default "neutral" */
  state?: "neutral" | "success" | "info" | "warning" | "error";
  /** Unknown duration: animates a sweeping bar and drops aria-valuenow. */
  indeterminate?: boolean;
  /** Optional utility classes on the root. */
  className?: string;
}

/** Linear progress bar with optional label, semantic state colors, and an indeterminate mode. */
const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  label = "Progress",
  size = "md",
  state = "neutral",
  indeterminate = false,
  className,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={[styles.root, styles[size], className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
      aria-label={label}
    >
      <div
        className={[
          styles.bar,
          styles[state],
          indeterminate ? styles.indeterminate : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={indeterminate ? undefined : { transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
};

export default Progress;
