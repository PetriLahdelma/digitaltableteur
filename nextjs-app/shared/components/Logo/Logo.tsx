import React from "react";
import styles from "./Logo.module.css";

export interface LogoProps {
  /** Optional image URL (PNG, JPEG, or SVG) rendered instead of the built-in
   * Digitaltableteur mark. `title` becomes the alt text; `animated` and
   * `background` apply to the built-in mark only and are ignored when `src` is
   * set. */
  src?: string;
  /** Square render box in pixels. Default 24. */
  size?: number;
  /** Pulse the three leading bars while true; a controlled signal driven from the
   * consumer's hover/focus state (respects prefers-reduced-motion). Default false. */
  animated?: boolean;
  /** Render the brand lime circle background behind a contrast mark
   * (`--logo-background` / `--logo-color`). Default false. */
  background?: boolean;
  /** Accessible name for the mark. Ignored when `decorative`. Default "Digitaltableteur". */
  title?: string;
  /** When true the mark is purely decorative and removed from the accessibility tree. Default false. */
  decorative?: boolean;
  /** Optional utility/spacing classes. */
  className?: string;
}

/**
 * Logo atom. By default renders the built-in Digitaltableteur mark — monochrome
 * (inherits `currentColor`) inside a square `size`×`size` box, with the three-bar
 * pulse (`animated`) and lime circle background (`background`) options. Pass `src` to render
 * any custom logo image (PNG, JPEG, or SVG) inside the same square box instead;
 * the image letterboxes via `object-fit: contain` and `title` names it.
 */
export const Logo = React.forwardRef<
  SVGSVGElement | HTMLImageElement,
  LogoProps
>(function Logo(
  {
    src,
    size = 24,
    animated = false,
    background = false,
    title = "Digitaltableteur",
    decorative = false,
    className,
  },
  ref,
) {
  // || not the destructure default alone: a cleared/seeded Controls text field
  // passes "" and must fall back to the built-in mark / brand name.
  if (src) {
    return (
      <img
        ref={ref as React.ForwardedRef<HTMLImageElement>}
        className={[styles.logo, styles.image, className]
          .filter(Boolean)
          .join(" ")}
        src={src}
        alt={decorative ? "" : title || "Digitaltableteur"}
        width={size}
        height={size}
        {...(decorative ? { "aria-hidden": true } : null)}
      />
    );
  }

  const classNames = [
    styles.logo,
    background ? styles.withBackground : "",
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

  // Background mode pads the mark inside a square viewBox so a full-bleed
  // circle can sit behind it; mark color flips to the contrast token via
  // `.withBackground`.
  const viewBox = background ? "-121 -157 637 637" : "0 0 395 323";

  return (
    <svg
      ref={ref as React.ForwardedRef<SVGSVGElement>}
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
      {background ? (
        <circle
          className={styles.backgroundCircle}
          cx="197.5"
          cy="161.5"
          r="318.5"
        />
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
