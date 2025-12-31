"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Button from "@dt/Button";
import styles from "./HighlightSection.module.css";

/**
 * Background variant for the section
 */
export type HighlightSectionVariant = "gradient" | "pattern" | "solid";

/**
 * Size variants for spacing
 */
export type HighlightSectionSize = "compact" | "comfortable" | "spacious";

/**
 * CTA button configuration
 */
export interface HighlightSectionCTA {
  /** Button label text */
  label: string;
  /** Click handler for button action */
  onClick?: () => void;
  /** URL for navigation (renders as link) */
  href?: string;
  /** Target attribute for link */
  target?: "_blank" | "_self" | "_parent" | "_top";
}

/**
 * HighlightSection component props
 */
export interface HighlightSectionProps {
  /** Section title/headline */
  title: string;
  /** Optional overline text above title */
  overline?: string;
  /** Supporting description text */
  description: string;
  /** CTA button configuration */
  cta?: HighlightSectionCTA;
  /** Background variant */
  variant?: HighlightSectionVariant;
  /** Section size (affects padding and spacing) */
  size?: HighlightSectionSize;
  /** Custom className for additional styling */
  className?: string;
  /** ARIA label for the section */
  ariaLabel?: string;
}

/**
 * HighlightSection - A reusable call-to-action section with gradient/pattern backgrounds
 *
 * @example
 * ```tsx
 * <HighlightSection
 *   title="Download my component schema template for GenAI Design System creation"
 *   description="Supercharge your AI driven design system..."
 *   cta={{
 *     label: "Download Schema",
 *     onClick: handleDownload
 *   }}
 *   variant="pattern"
 * />
 * ```
 *
 * @remarks
 * - Uses design system Title, Text, and Button components
 * - Supports three background variants: gradient, pattern, solid
 * - Three size options for flexible layouts
 * - Fully responsive with mobile-first approach
 * - Theme-aware styling (Light, Dark, HCW, HCB)
 * - Internationalization ready
 */
const HighlightSection: React.FC<HighlightSectionProps> = ({
  title,
  overline,
  description,
  cta,
  variant = "gradient",
  size = "comfortable",
  className = "",
  ariaLabel,
}) => {
  const { t } = useTranslation();

  const sectionClasses = [
    styles.section,
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={sectionClasses}
      aria-label={ariaLabel || t("createSection.ariaLabel")}
    >
      <div className={styles.background} aria-hidden="true">
        <div className={styles.backgroundBase} />
        {variant === "pattern" && <div className={styles.backgroundPattern} />}
      </div>
      <div className={styles.border} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.content}>
          {overline && (
            <Text
              as="span"
              size="S"
              terminals="sans"
              className={styles.overline}
            >
              {overline}
            </Text>
          )}
          <Title
            level={2}
            size="L"
            terminals="sans"
            lineHeight="tight"
            className={styles.title}
          >
            {title}
          </Title>
          <Text
            as="p"
            size="L"
            terminals="sans"
            lineHeight="relaxed"
            className={styles.description}
          >
            {description}
          </Text>
          {cta && (
            <div className={styles.ctaWrapper}>
              <Button
                variant="primary"
                size="lg"
                onClick={cta.onClick}
                href={cta.href}
                target={cta.target}
              >
                {cta.label}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

HighlightSection.displayName = "HighlightSection";

export default HighlightSection;
