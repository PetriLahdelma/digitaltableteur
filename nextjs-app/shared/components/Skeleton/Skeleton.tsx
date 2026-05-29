import React from "react";
import styles from "./Skeleton.module.css";

export interface SkeletonProps {
  /** Shape variant */
  variant?: "text" | "circle" | "rect" | "avatar" | "card";
  /** Width (px or %) */
  width?: number | string;
  /** Height (px) */
  height?: number | string;
  /** Number of lines for text variant */
  lines?: number;
  /** Optional className */
  className?: string;
  /** ARIA label for screen readers (hidden visually) */
  label?: string;
  /** Animate shimmer (disabled with prefers-reduced-motion) */
  animate?: boolean;
}

/**
 * Skeleton component.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "text",
  width,
  height,
  lines = 3,
  className = "",
  label = "Loading content",
  animate = true,
}) => {
  const rootClass = [
    styles.root,
    styles[variant],
    animate ? styles.animate : styles.static,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  if (variant === "text") {
    return (
      <span
        className={rootClass}
        style={width ? { width: style.width } : {}}
        role="status"
        aria-label={label}
        aria-live="polite"
      >
        {Array.from({ length: lines }).map((_, i) => (
          <span key={i} className={styles.line} />
        ))}
      </span>
    );
  }

  return (
    <span
      className={rootClass}
      style={style}
      role="status"
      aria-label={label}
      aria-live="polite"
    />
  );
};

export default Skeleton;
