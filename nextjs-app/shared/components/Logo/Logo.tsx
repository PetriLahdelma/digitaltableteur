import React from "react";
import styles from "./Logo.module.css";

export interface LogoProps {
  /** Square render box in pixels. Default 24. */
  size?: number;
  /** Enable the three-bar pulse on hover (respects prefers-reduced-motion). Default false. */
  animated?: boolean;
  /** Wrap the mark in the brand lime circle (`--logo-background` / `--logo-color`). Default false. */
  badge?: boolean;
  /** Accessible name for the mark. Ignored when `decorative`. Default "Digitaltableteur". */
  title?: string;
  /** When true the mark is purely decorative and removed from the accessibility tree. Default false. */
  decorative?: boolean;
  /** Optional utility/spacing classes. */
  className?: string;
}

/**
 * Digitaltableteur brand mark. Monochrome (inherits `currentColor`) and renders
 * inside a square `size`×`size` box. Opt into the hover pulse with `animated`,
 * or the lime brand badge with `badge` (a filled circle behind a contrast mark).
 */
export const Logo = React.forwardRef<SVGSVGElement, LogoProps>(function Logo(
  {
    size = 24,
    animated = false,
    badge = false,
    title = "Digitaltableteur",
    decorative = false,
    className,
  },
  ref,
) {
  const classNames = [
    styles.logo,
    badge ? styles.badged : "",
    animated ? styles.animated : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const a11yProps = decorative
    ? ({ "aria-hidden": true, role: "presentation" } as const)
    : // || not the destructure default alone: a cleared/seeded Controls text
      // field passes "" and must fall back, never render an empty aria-label.
      ({ role: "img", "aria-label": title || "Digitaltableteur" } as const);

  // Badge mode pads the mark inside a square viewBox so a full-bleed circle can
  // sit behind it; mark color flips to the contrast token via `.badged`.
  const viewBox = badge ? "-121 -157 637 637" : "0 0 395 323";

  return (
    <svg
      ref={ref}
      className={classNames}
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      {...a11yProps}
    >
      {decorative ? null : <title>{title}</title>}
      {badge ? (
        <circle className={styles.badgeBg} cx="197.5" cy="161.5" r="318.5" />
      ) : null}
      <rect
        className={styles.bar1}
        x="190.742"
        width="39.0494"
        height="142.681"
        fill="currentColor"
      />
      <rect
        className={styles.bar2}
        x="190.742"
        y="180.228"
        width="39.0494"
        height="142.681"
        fill="currentColor"
      />
      <rect
        className={styles.bar3}
        x="267.338"
        y="181.73"
        width="39.0494"
        height="127.662"
        transform="rotate(-90 267.338 181.73)"
        fill="currentColor"
      />
      <rect y="37.5475" width="39.0494" height="246.312" fill="currentColor" />
      <rect
        x="115.646"
        y="76.597"
        width="39.0494"
        height="168.213"
        fill="currentColor"
      />
      <path
        d="M39.0493 76.597L39.0493 37.5475L118.65 37.5475L154.696 76.5969L39.0493 76.597Z"
        fill="currentColor"
      />
      <path
        d="M39.0493 244.81L39.0493 283.859L118.65 283.859L154.696 244.81L39.0493 244.81Z"
        fill="currentColor"
      />
    </svg>
  );
});

Logo.displayName = "Logo";
export default Logo;
