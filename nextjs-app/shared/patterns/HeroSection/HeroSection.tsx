"use client";

import { type ReactNode, type ElementType } from "react";
import { cn } from "../../lib/cn";

export interface HeroSectionProps {
  /** Hero content */
  children: ReactNode;
  /** Background style variant */
  background?: "gradient" | "solid" | "image" | "transparent";
  /** Background image URL (only used when background="image") */
  backgroundImage?: string;
  /** Minimum height of the hero section */
  minHeight?: "screen" | "hero" | "half" | "auto";
  /** Content vertical alignment */
  align?: "start" | "center" | "end";
  /** Content horizontal alignment */
  justify?: "start" | "center" | "end";
  /** Custom className for styling extensions */
  className?: string;
  /** Semantic HTML element to render as */
  as?: ElementType;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

const minHeightClasses: Record<NonNullable<HeroSectionProps["minHeight"]>, string> = {
  screen: "min-h-screen",
  hero: "min-h-[75vh]",
  half: "min-h-[50vh]",
  auto: "min-h-0",
};

const alignClasses: Record<NonNullable<HeroSectionProps["align"]>, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
};

const justifyClasses: Record<NonNullable<HeroSectionProps["justify"]>, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

const backgroundClasses: Record<NonNullable<HeroSectionProps["background"]>, string> = {
  gradient: "bg-gradient-to-br from-background via-background to-muted",
  solid: "bg-background",
  image: "bg-cover bg-center bg-no-repeat",
  transparent: "bg-transparent",
};

/**
 * HeroSection component.
 */
export function HeroSection({
  children,
  background = "transparent",
  backgroundImage,
  minHeight = "hero",
  align = "center",
  justify = "center",
  className,
  as: Component = "section",
  ariaLabel,
}: HeroSectionProps) {
  const hasBackgroundImage = background === "image" && backgroundImage;

  return (
    <Component
      className={cn(
        "relative flex flex-col w-full overflow-hidden",
        minHeightClasses[minHeight],
        alignClasses[align],
        justifyClasses[justify],
        backgroundClasses[background],
        className
      )}
      style={hasBackgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </Component>
  );
}

HeroSection.displayName = "HeroSection";
