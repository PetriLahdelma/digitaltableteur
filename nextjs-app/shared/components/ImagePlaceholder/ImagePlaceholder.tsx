"use client";

import React from "react";
import styles from "./ImagePlaceholder.module.css";

export interface ImagePlaceholderProps {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Alt text for accessibility */
  alt?: string;
  /** Caption text displayed below the image */
  caption?: string;
  /** Background color variant */
  variant?: "light" | "medium" | "dark" | "gradient";
  /** Display the dimensions on the placeholder */
  showDimensions?: boolean;
  /** Display an icon on the placeholder */
  showIcon?: boolean;
  /** Text to display on the placeholder */
  text?: string;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * ImagePlaceholder - A versatile placeholder component for Storybook previews
 *
 * Provides a styled placeholder that can replace real images in Storybook stories,
 * useful for demonstrating layouts without requiring actual image assets.
 *
 * @example
 * ```tsx
 * <ImagePlaceholder
 *   width={800}
 *   height={400}
 *   alt="Example placeholder"
 *   caption="Image caption"
 *   variant="gradient"
 *   showDimensions
 * />
 * ```
 */
export default /**
 * ImagePlaceholder component.
 */
function ImagePlaceholder({
  width,
  height,
  alt = "Placeholder image",
  caption,
  variant = "gradient",
  showDimensions = true,
  showIcon = true,
  text,
  className = "",
  style,
}: ImagePlaceholderProps) {
  const dimensions = `${width} × ${height}`;

  return (
    <figure className={styles.figure}>
      <div
        className={`${styles.placeholder} ${styles[variant]} ${className}`}
        style={{
          aspectRatio: `${width} / ${height}`,
          width: "100%",
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        <div className={styles.content}>
          {showIcon && (
            <svg
              className={styles.icon}
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          )}
          {text && <span className={styles.text}>{text}</span>}
          {showDimensions && !text && (
            <span className={styles.dimensions}>{dimensions}</span>
          )}
        </div>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}

/**
 * Common preset configurations for typical use cases
 */
export const ImagePlaceholderPresets = {
  /** Wide landscape format (16:9) */
  landscape: { width: 1920, height: 1080 },
  /** Portrait format (3:4) */
  portrait: { width: 600, height: 800 },
  /** Square format (1:1) */
  square: { width: 800, height: 800 },
  /** Helsinki Design System wireframe format */
  wireframe: { width: 1204, height: 538 },
  /** Helsinki Design System component format */
  component: { width: 1184, height: 500 },
  /** Helsinki Design System detail format */
  detail: { width: 738, height: 506 },
  /** Ultra-wide component structure format */
  structure: { width: 3934, height: 1816 },
  /** Standard card cover */
  cardCover: { width: 800, height: 400 },
};
