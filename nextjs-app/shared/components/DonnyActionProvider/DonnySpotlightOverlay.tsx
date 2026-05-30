"use client";

import { useEffect, useState } from "react";
import type { DonnyActiveHighlight } from "./donnyActionTypes";
import styles from "./DonnyActionProvider.module.css";

export interface DonnySpotlightOverlayProps {
  activeHighlight: DonnyActiveHighlight | null;
  prefersReducedMotion: boolean;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measureSpotlightRect(element: HTMLElement): SpotlightRect {
  const rect = element.getBoundingClientRect();
  const padding = 8;
  return {
    top: Math.max(rect.top - padding, 0),
    left: Math.max(rect.left - padding, 0),
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

/**
 * Non-layout spotlight frame for Donny page targets.
 */
export function DonnySpotlightOverlay({
  activeHighlight,
  prefersReducedMotion,
}: DonnySpotlightOverlayProps) {
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  useEffect(() => {
    if (!activeHighlight || activeHighlight.highlightMode !== "spotlight") {
      setRect(null);
      return undefined;
    }

    const { element } = activeHighlight;

    const update = () => {
      setRect(measureSpotlightRect(element));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [activeHighlight]);

  if (!activeHighlight || activeHighlight.highlightMode !== "spotlight" || !rect) {
    return null;
  }

  return (
    <div
      className={styles.spotlightLayer}
      aria-hidden="true"
      data-testid="donny-spotlight-overlay"
    >
      <div
        className={
          prefersReducedMotion ? styles.spotlightFrameStatic : styles.spotlightFrame
        }
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      />
    </div>
  );
}
