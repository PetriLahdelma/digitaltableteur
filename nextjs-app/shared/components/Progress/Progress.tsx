import React from "react";
import styles from "./Progress.module.css";

export interface ProgressProps {
  value?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  state?: "neutral" | "success" | "info" | "warning" | "error";
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  label = "Progress",
  size = "md",
  state = "neutral",
  className,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={[styles.root, styles[size], className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <div
        className={[styles.bar, styles[state]].join(" ")}
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
};

export default Progress;
