"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Button from "@dt/Button";
import type { ButtonProps } from "@dt/Button";
import styles from "./HighlightSection.module.css";

/**
 * Background variant for the section
 */
export type HighlightSectionVariant =
  | "gradient"
  | "pattern"
  | "dots"
  | "solid";

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
  /** Rel attribute for link */
  rel?: string;
  /** Button style variant */
  variant?: ButtonProps["variant"];
  /** Button size variant */
  size?: ButtonProps["size"];
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
  /** CTA button configuration (up to 3 items) */
  cta?: HighlightSectionCTA | HighlightSectionCTA[];
  /** Background variant */
  variant?: HighlightSectionVariant;
  /** Section size (affects padding and spacing) */
  size?: HighlightSectionSize;
  /** Custom className for additional styling */
  className?: string;
  /** ARIA label for the section */
  ariaLabel?: string;
  /** Section id for anchor linking */
  id?: string;
  /** Donny site action target id */
  donnyTarget?: string;
}

/**
 * HighlightSection - A reusable call-to-action section with gradient/pattern backgrounds
 *
 * @example
 * ```tsx
 * <HighlightSection
 *   title="Download my component schema template for GenAI Design System creation"
 *   description="Supercharge your AI driven design system..."
 *   cta={[
 *     { label: "Download Schema", onClick: handleDownload },
 *     { label: "View Docs", href: "/docs" },
 *     { label: "Contact", href: "/contact" }
 *   ]}
 *   variant="pattern"
 * />
 * ```
 *
 * @remarks
 * - Uses design system Title, Text, and Button components
 * - Supports four background variants: gradient, pattern, dots, solid
 * - Three size options for flexible layouts
 * - CTA supports up to three buttons (third aligns to the far edge)
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
  id = "component-schema",
  donnyTarget = "home.componentSchema",
}) => {
  const { t } = useTranslation();
  const ctaItems = Array.isArray(cta) ? cta : cta ? [cta] : [];
  const cappedCtas = ctaItems.slice(0, 3);
  const primaryCtas = cappedCtas.slice(0, 2);
  const trailingCta = cappedCtas[2];

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
      id={id}
      data-donny-target={donnyTarget}
      className={sectionClasses}
      aria-label={ariaLabel || t("createSection.ariaLabel")}
    >
      <div className={styles.background} aria-hidden="true">
        <div className={styles.backgroundBase} />
        {(variant === "pattern" || variant === "dots") && (
          <div className={styles.backgroundPattern} />
        )}
      </div>
      <div className={styles.border} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.copy}>
          {overline && (
            <Text
              as="span"
              size="s"
              className={styles.overline}
            >
              {overline}
            </Text>
          )}
          <Title
            level={2}
            size="l"
            lineHeight="tight"
            className={styles.title}
          >
            {title}
          </Title>
          <Text
            as="p"
            size="l"
            lineHeight="relaxed"
            className={styles.description}
          >
            {description}
          </Text>
          {ctaItems.length > 0 && (
            <div className={styles.ctaRow}>
              <div className={styles.ctaGroup}>
                {primaryCtas.map((item, index) => {
                  const variantFallback =
                    index === 0 ? "primary" : "secondary";
                  const sizeValue = item.size ?? "lg";
                  const variantValue = item.variant ?? variantFallback;

                  return item.href ? (
                    <Button
                      key={index}
                      variant={variantValue}
                      size={sizeValue}
                      onClick={item.onClick}
                      href={item.href}
                      target={item.target}
                      rel={item.rel}
                    >
                      {item.label}
                    </Button>
                  ) : (
                    <Button
                      key={index}
                      variant={variantValue}
                      size={sizeValue}
                      onClick={item.onClick}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </div>
              {trailingCta && (
                <div className={styles.ctaTrailing}>
                  {trailingCta.href ? (
                    <Button
                      variant={trailingCta.variant ?? "tertiary"}
                      size={trailingCta.size ?? "lg"}
                      onClick={trailingCta.onClick}
                      href={trailingCta.href}
                      target={trailingCta.target}
                      rel={trailingCta.rel}
                    >
                      {trailingCta.label}
                    </Button>
                  ) : (
                    <Button
                      variant={trailingCta.variant ?? "tertiary"}
                      size={trailingCta.size ?? "lg"}
                      onClick={trailingCta.onClick}
                    >
                      {trailingCta.label}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

HighlightSection.displayName = "HighlightSection";

export default HighlightSection;
