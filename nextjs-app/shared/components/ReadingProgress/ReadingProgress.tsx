"use client";

import { useEffect, useState, type RefObject } from "react";
import styles from "./ReadingProgress.module.css";

export interface ReadingProgressProps {
  /** Ref to the content container to track */
  targetRef: RefObject<HTMLElement | null>;
  /** Show percentage text */
  showPercentage?: boolean;
  className?: string;
}

/** Fixed top progress bar for long-form reading (articles, docs). */
export function ReadingProgress({
  targetRef,
  showPercentage = false,
  className,
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const calculateProgress = () => {
      const rect = target.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const targetTop = rect.top;
      const scrolledInto = Math.max(0, windowHeight - targetTop);
      const totalHeight = rect.height;
      const percent = Math.min(100, Math.max(0, (scrolledInto / totalHeight) * 100));
      setProgress(percent);
      setIsVisible(targetTop < windowHeight * 0.8);
    };

    calculateProgress();
    window.addEventListener("scroll", calculateProgress, { passive: true });
    window.addEventListener("resize", calculateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", calculateProgress);
      window.removeEventListener("resize", calculateProgress);
    };
  }, [targetRef]);

  if (!isVisible && progress === 0) {
    return null;
  }

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-visible={isVisible ? "true" : "false"}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div className={styles.bar} style={{ transform: `scaleX(${progress / 100})` }} />
      {showPercentage && progress > 0 ? (
        <span className={styles.percentage}>{Math.round(progress)}%</span>
      ) : null}
    </div>
  );
}

ReadingProgress.displayName = "ReadingProgress";
export default ReadingProgress;
