"use client";

import { useState, useEffect, type RefObject } from "react";
import { cn } from "@/lib/utils";

export interface ReadingProgressProps {
  /** Ref to the content container to track */
  targetRef: RefObject<HTMLElement | null>;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * ReadingProgress - Fixed progress bar showing reading position
 */
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

      // Target top relative to viewport
      const targetTop = rect.top;
      // How much we've scrolled into the content
      const scrolledInto = Math.max(0, windowHeight - targetTop);
      // Total scrollable height of the content
      const totalHeight = rect.height;

      // Calculate percentage (0-100)
      const percent = Math.min(100, Math.max(0, (scrolledInto / totalHeight) * 100));

      setProgress(percent);

      // Show progress bar after scrolling past the start
      setIsVisible(targetTop < windowHeight * 0.8);
    };

    // Initial calculation
    calculateProgress();

    // Listen to scroll
    window.addEventListener("scroll", calculateProgress, { passive: true });
    window.addEventListener("resize", calculateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", calculateProgress);
      window.removeEventListener("resize", calculateProgress);
    };
  }, [targetRef]);

  // Don't render if not visible
  if (!isVisible && progress === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "h-1 bg-muted",
        "transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      {/* Progress bar */}
      <div
        className={cn(
          "h-full bg-primary",
          "transition-transform duration-100 ease-out origin-left"
        )}
        style={{ transform: `scaleX(${progress / 100})` }}
      />

      {/* Percentage indicator */}
      {showPercentage && progress > 0 && (
        <span
          className={cn(
            "absolute right-2 top-full mt-1",
            "text-xs font-body text-muted-foreground",
            "bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded"
          )}
        >
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}

ReadingProgress.displayName = "ReadingProgress";
