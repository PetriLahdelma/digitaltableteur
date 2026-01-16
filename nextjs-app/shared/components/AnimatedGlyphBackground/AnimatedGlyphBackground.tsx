import React from "react";
import { cn } from "@/lib/utils";
import styles from "./AnimatedGlyphBackground.module.css";
import "../../styles/variables.css";

type GlyphTone = "muted" | "primary" | "accent" | "contrast";

export interface AnimatedGlyphBackgroundProps {
  /** Optional className overrides */
  className?: string;
  /** Toggle animation on/off */
  animate?: boolean;
  /** Color tone for the glyph */
  tone?: GlyphTone;
}

const toneClasses: Record<GlyphTone, string> = {
  muted: styles.toneMuted,
  primary: styles.tonePrimary,
  accent: styles.toneAccent,
  contrast: styles.toneContrast,
};

const AnimatedGlyphBackground: React.FC<AnimatedGlyphBackgroundProps> = ({
  className,
  animate = true,
  tone = "muted",
}) => {
  return (
    <div
      className={cn(
        styles.backdrop,
        toneClasses[tone],
        animate ? styles.animate : styles.static,
        className
      )}
      aria-hidden="true"
      data-animated={animate ? "true" : "false"}
      data-tone={tone}
    >
      <svg
        className={styles.svg}
        viewBox="0 0 508 508"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <g className={cn(styles.frame, styles.frame1)} data-frame="1">
          <rect
            x="214.5"
            y="135"
            width="26"
            height="95"
            transform="rotate(-90 214.5 135)"
            fill="currentColor"
          />
          <rect
            x="249"
            y="266"
            width="26"
            height="95"
            fill="currentColor"
          />
          <rect
            x="300"
            y="267"
            width="26"
            height="85"
            transform="rotate(-90 300 267)"
            fill="currentColor"
          />
          <rect
            x="122"
            y="171"
            width="26"
            height="164"
            fill="currentColor"
          />
          <rect
            x="199"
            y="197"
            width="26"
            height="112"
            fill="currentColor"
          />
          <path
            d="M148 197L148 171L201 171L225 197L148 197Z"
            fill="currentColor"
          />
          <path
            d="M148 309L148 335L201 335L225 309L148 309Z"
            fill="currentColor"
          />
        </g>
        <g className={cn(styles.frame, styles.frame2)} data-frame="2">
          <rect x="249" y="146" width="26" height="95" fill="currentColor" />
          <rect x="249" y="266" width="26" height="95" fill="currentColor" />
          <rect
            x="300"
            y="267"
            width="26"
            height="85"
            transform="rotate(-90 300 267)"
            fill="currentColor"
          />
          <rect
            width="26"
            height="164"
            transform="matrix(-1 0 0 1 225 171)"
            fill="currentColor"
          />
          <rect
            width="26"
            height="112"
            transform="matrix(-1 0 0 1 148 197)"
            fill="currentColor"
          />
          <path
            d="M199 197L199 171L146 171L122 197L199 197Z"
            fill="currentColor"
          />
          <path
            d="M199 309L199 335L146 335L122 309L199 309Z"
            fill="currentColor"
          />
        </g>
        <g className={cn(styles.frame, styles.frame3)} data-frame="3">
          <rect
            width="26"
            height="95"
            transform="matrix(-1 0 0 1 385 146)"
            fill="currentColor"
          />
          <rect
            width="26"
            height="95"
            transform="matrix(-1 0 0 1 385 266)"
            fill="currentColor"
          />
          <rect
            width="26"
            height="85"
            transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 334 267)"
            fill="currentColor"
          />
          <rect
            x="122"
            y="171"
            width="26"
            height="164"
            fill="currentColor"
          />
          <rect
            x="199"
            y="197"
            width="26"
            height="112"
            fill="currentColor"
          />
          <path
            d="M148 197L148 171L201 171L225 197L148 197Z"
            fill="currentColor"
          />
          <path
            d="M148 309L148 335L201 335L225 309L148 309Z"
            fill="currentColor"
          />
        </g>
        <g className={cn(styles.frame, styles.frame4)} data-frame="4">
          <rect x="249" y="146" width="26" height="95" fill="currentColor" />
          <rect x="249" y="266" width="26" height="95" fill="currentColor" />
          <rect
            x="355.5"
            y="296.5"
            width="26"
            height="85"
            transform="rotate(180 355.5 296.5)"
            fill="currentColor"
          />
          <rect
            x="122"
            y="171"
            width="26"
            height="164"
            fill="currentColor"
          />
          <rect
            x="199"
            y="197"
            width="26"
            height="112"
            fill="currentColor"
          />
          <path
            d="M148 197L148 171L201 171L225 197L148 197Z"
            fill="currentColor"
          />
          <path
            d="M148 309L148 335L201 335L225 309L148 309Z"
            fill="currentColor"
          />
        </g>
        <g
          className={cn(styles.frame, styles.frame5, styles.frameBase)}
          data-frame="5"
        >
          <rect
            x="131.25"
            y="243.25"
            width="26"
            height="95"
            transform="rotate(-90 131.25 243.25)"
            fill="currentColor"
          />
          <rect
            x="251.25"
            y="243.25"
            width="26"
            height="95"
            transform="rotate(-90 251.25 243.25)"
            fill="currentColor"
          />
          <rect
            x="281.75"
            y="136.75"
            width="26"
            height="85"
            transform="rotate(90 281.75 136.75)"
            fill="currentColor"
          />
          <rect
            x="156.25"
            y="370.25"
            width="26"
            height="164"
            transform="rotate(-90 156.25 370.25)"
            fill="currentColor"
          />
          <rect
            x="182.25"
            y="293.25"
            width="26"
            height="112"
            transform="rotate(-90 182.25 293.25)"
            fill="currentColor"
          />
          <path
            d="M182.25 344.25L156.25 344.25L156.25 291.25L182.25 267.25L182.25 344.25Z"
            fill="currentColor"
          />
          <path
            d="M294.25 344.25H320.25L320.25 291.25L294.25 267.25V344.25Z"
            fill="currentColor"
          />
        </g>
        <g className={cn(styles.frame, styles.frame6)} data-frame="6">
          <rect
            x="227.996"
            y="229.987"
            width="26"
            height="95"
            transform="rotate(105 227.996 229.987)"
            fill="currentColor"
          />
          <rect
            x="256.233"
            y="255.101"
            width="26"
            height="95"
            transform="rotate(-105 256.233 255.101)"
            fill="currentColor"
          />
          <rect
            x="281.75"
            y="136.75"
            width="26"
            height="85"
            transform="rotate(90 281.75 136.75)"
            fill="currentColor"
          />
          <rect
            x="320.25"
            y="267.25"
            width="26"
            height="164"
            transform="rotate(90 320.25 267.25)"
            fill="currentColor"
          />
          <rect
            x="294.25"
            y="344.25"
            width="26"
            height="112"
            transform="rotate(90 294.25 344.25)"
            fill="currentColor"
          />
          <path
            d="M294.25 293.25L320.25 293.25L320.25 346.25L294.25 370.25L294.25 293.25Z"
            fill="currentColor"
          />
          <path
            d="M182.25 293.25L156.25 293.25L156.25 346.25L182.25 370.25L182.25 293.25Z"
            fill="currentColor"
          />
        </g>
      </svg>
    </div>
  );
};

AnimatedGlyphBackground.displayName = "AnimatedGlyphBackground";

export default AnimatedGlyphBackground;
