"use client";

import React from "react";
import Image from "next/image";
import PageLayout from "../PageLayout/PageLayout";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Button from "@dt/Button";
import styles from "./Hero.module.css";

export interface HeroProps {
  /** Hero title (required) */
  title: string;
  /** Title semantic level (defaults to 1 for page hero) */
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Subtitle text */
  subtitle?: string;
  /** Descriptive body text */
  description?: string;
  /** Hero image source */
  imageSrc?: string;
  /** Hero image alt text (required if imageSrc provided) */
  imageAlt?: string;
  /** Image width for Next.js Image optimization */
  imageWidth?: number;
  /** Image height for Next.js Image optimization */
  imageHeight?: number;
  /** Call-to-action buttons */
  actions?: HeroAction[];
  /** Layout variant */
  variant?: "default" | "centered" | "split" | "minimal" | "stacked";
  /** Background color/gradient style */
  background?: "light" | "dark" | "gradient" | "image" | "transparent";
  /** Content alignment */
  align?: "left" | "center" | "right";
  /** Maximum content width */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Vertical spacing */
  spacing?: "compact" | "default" | "comfortable" | "spacious";
  /** Custom CSS class for styling extensions */
  className?: string;
  /** ARIA label for hero section */
  ariaLabel?: string;
}

export interface HeroAction {
  /** Unique identifier for action */
  key: string;
  /** Action button label */
  label: string;
  /** Button click handler */
  onClick?: () => void;
  /** Button href for link variant */
  href?: string;
  /** Button variant style */
  variant?: "primary" | "secondary" | "tertiary";
  /** Button size */
  size?: "s" | "m" | "l";
  /** Inverse color scheme */
  inverse?: boolean;
}

/**
 * Hero component.
 */
export const Hero: React.FC<HeroProps> = ({
  title,
  titleLevel = 1,
  subtitle,
  description,
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
  actions,
  variant = "default",
  background = "light",
  align = "left",
  maxWidth = "lg",
  spacing = "comfortable",
  className,
  ariaLabel,
}) => {
  const heroClasses = [
    styles.hero,
    styles[`variant-${variant}`],
    styles[`background-${background}`],
    styles[`align-${align}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderContent = () => (
    <div className={styles.heroContent}>
      <div className={styles.heroText}>
        <Title
          level={titleLevel}
          size="xl"
          terminals="sans"
          className={styles.heroTitle}
        >
          {title}
        </Title>

        {subtitle && (
          <Text
            size="l"
            terminals="sans"
            className={styles.heroSubtitle}
            as="p"
          >
            {subtitle}
          </Text>
        )}

        {description && (
          <Text size="m" className={styles.heroDescription} as="p">
            {description}
          </Text>
        )}

        {actions && actions.length > 0 && (
          <div className={styles.heroActions}>
            {actions.map((action) => {
              if (action.href) {
                return (
                  <a
                    key={action.key}
                    href={action.href}
                    className={styles.heroActionLink}
                  >
                    <Button
                      variant={action.variant || "primary"}
                      size={action.size === "s" ? "sm" : action.size === "m" ? "md" : "lg"}
                      surface={action.inverse ? "onDark" : "default"}
                      onClick={action.onClick}
                    >
                      {action.label}
                    </Button>
                  </a>
                );
              }

              return (
                <Button
                  key={action.key}
                  variant={action.variant || "primary"}
                  size={action.size === "s" ? "sm" : action.size === "m" ? "md" : "lg"}
                  surface={action.inverse ? "onDark" : "default"}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {imageSrc && (
        <div className={styles.heroImageWrapper}>
          {imageWidth && imageHeight ? (
            <Image
              src={imageSrc}
              alt={imageAlt || title}
              width={imageWidth}
              height={imageHeight}
              className={styles.heroImage}
              priority
            />
          ) : (
            <Image
              src={imageSrc}
              alt={imageAlt || title}
              fill
              className={styles.heroImage}
              priority
              style={{ objectFit: "cover" }}
            />
          )}
        </div>
      )}
    </div>
  );

  // Stacked variant: text in PageLayout, image full-width below
  if (variant === "stacked") {
    return (
      <section
        className={heroClasses}
        aria-label={ariaLabel || `${title} hero section`}
      >
        <PageLayout maxWidth={maxWidth} spacing={spacing} as="div">
          <div className={styles.heroText}>
            <Title
              level={titleLevel}
              size="xl"
              terminals="sans"
              className={styles.heroTitle}
            >
              {title}
            </Title>

            {subtitle && (
              <Text
                size="l"
                terminals="sans"
                className={styles.heroSubtitle}
                as="p"
              >
                {subtitle}
              </Text>
            )}

            {description && (
              <Text size="m" className={styles.heroDescription} as="p">
                {description}
              </Text>
            )}

            {actions && actions.length > 0 && (
              <div className={styles.heroActions}>
                {actions.map((action) => {
                  if (action.href) {
                    return (
                      <a
                        key={action.key}
                        href={action.href}
                        className={styles.heroActionLink}
                      >
                        <Button
                          variant={action.variant || "primary"}
                          size={action.size === "s" ? "sm" : action.size === "m" ? "md" : "lg"}
                          surface={action.inverse ? "onDark" : "default"}
                          onClick={action.onClick}
                        >
                          {action.label}
                        </Button>
                      </a>
                    );
                  }

                  return (
                    <Button
                      key={action.key}
                      variant={action.variant || "primary"}
                      size={action.size === "s" ? "sm" : action.size === "m" ? "md" : "lg"}
                      surface={action.inverse ? "onDark" : "default"}
                      onClick={action.onClick}
                    >
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </PageLayout>

        {imageSrc && (
          <div className={styles.heroImageWrapperStacked}>
            {imageWidth && imageHeight ? (
              <Image
                src={imageSrc}
                alt={imageAlt || title}
                width={imageWidth}
                height={imageHeight}
                className={styles.heroImage}
                priority
              />
            ) : (
              <Image
                src={imageSrc}
                alt={imageAlt || title}
                fill
                className={styles.heroImage}
                priority
                style={{ objectFit: "cover" }}
              />
            )}
          </div>
        )}
      </section>
    );
  }

  // Default variants: text and image in same container
  return (
    <section
      className={heroClasses}
      aria-label={ariaLabel || `${title} hero section`}
    >
      <PageLayout maxWidth={maxWidth} spacing={spacing} as="div">
        {renderContent()}
      </PageLayout>
    </section>
  );
};

Hero.displayName = "Hero";
export default Hero;
