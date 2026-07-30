"use client";

import React from "react";
import Image from "next/image";
import PageLayout from "../PageLayout/PageLayout";
import { Text, Title } from "@digitaltableteur/react";
import styles from "./StoryBlock.module.css";

/**
 * Represents a single image with caption
 */
export interface StoryImage {
  /** Image source path */
  src: string;
  /** Alt text for the image */
  alt: string;
  /** Image width in pixels */
  width: number;
  /** Image height in pixels */
  height: number;
  /** Optional caption text */
  caption?: string;
  /** Optional CSS mix-blend-mode */
  mixBlendMode?: "multiply" | "normal";
}

/**
 * Props for the StoryBlock component
 */
export interface StoryBlockProps {
  /** Optional subtitle/category label */
  subtitle?: string;
  /** Main title of the story section */
  title: string;
  /** Body content as array of paragraphs or React nodes */
  content: React.ReactNode[];
  /** Optional image or images to display */
  images?: StoryImage | StoryImage[];
  /** Image layout: "single" (1 col), "grid" (2 col), or "none" */
  imageLayout?: "single" | "grid" | "none";
  /** Background color variant */
  backgroundColor?: "light" | "white" | "transparent";
  /** Maximum width constraint */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Spacing variant */
  spacing?: "compact" | "default" | "comfortable" | "spacious";
  /** Additional CSS class */
  className?: string;
  /** Semantic HTML element to use */
  as?: "section" | "article" | "div";
  /** Accessible label for the section */
  ariaLabel?: string;
}

/**
 * StoryBlock - A reusable design system component for narrative content sections
 *
 * Displays a story section with optional subtitle, title, body copy, and images.
 * Supports various layouts: text-only, single image, or grid of images.
 * Commonly used in case studies and work pages for project narratives.
 *
 * @example
 * ```tsx
 * <StoryBlock
 *   subtitle="Discovery Process"
 *   title="Research and Analysis"
 *   content={[
 *     <Text size="s">First paragraph...</Text>,
 *     <Text size="s">Second paragraph...</Text>,
 *   ]}
 *   images={[
 *     { src: "/image1.png", alt: "Image 1", width: 738, height: 506, caption: "Caption 1" },
 *     { src: "/image2.png", alt: "Image 2", width: 738, height: 506, caption: "Caption 2" },
 *   ]}
 *   imageLayout="grid"
 *   backgroundColor="light"
 * />
 * ```
 */
const StoryBlock: React.FC<StoryBlockProps> = ({
  subtitle,
  title,
  content,
  images,
  imageLayout = "none",
  backgroundColor = "transparent",
  maxWidth = "md",
  spacing = "comfortable",
  className = "",
  as = "section",
  ariaLabel,
}) => {
  const Wrapper = backgroundColor !== "transparent" ? "section" : as;
  const bgColors = {
    light: "var(--color-light-bg)",
    white: "var(--color-white)",
    transparent: "transparent",
  };

  const hasImages = images && imageLayout !== "none";
  const imagesArray = Array.isArray(images) ? images : images ? [images] : [];
  const gridClass =
    imageLayout === "grid" && imagesArray.length > 1
      ? styles.grid2Col
      : styles.grid1Col;

  const wrapperStyle =
    backgroundColor !== "transparent"
      ? { backgroundColor: bgColors[backgroundColor] }
      : undefined;

  return (
    <Wrapper
      className={`${styles.storyBlock} ${className}`}
      style={wrapperStyle}
      aria-label={ariaLabel || title}
    >
      <PageLayout
        maxWidth={maxWidth}
        spacing={spacing}
        as={backgroundColor !== "transparent" ? "section" : "div"}
      >
        <div className={styles.grid1Col}>
          <div className={styles.col}>
            {subtitle && (
              // Kicker, not a heading: it must not outrank or precede the real
              // section title in the outline AT users navigate by.
              <Text size="s" className={styles.subtitle}>
                {subtitle}
              </Text>
            )}
            <Title level={4} size="s" className={styles.title}>
              {title}
            </Title>
            {content.map((paragraph, index) => (
              <div key={index} className={styles.paragraph}>
                {paragraph}
              </div>
            ))}
          </div>
        </div>

        {hasImages && (
          <div className={gridClass} style={{ marginBlockStart: "2rem" }}>
            {imagesArray.map((image, index) => (
              <figure key={index} className={`${styles.col} ${styles.figure}`}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(max-width: 768px) 100vw, 768px"
                  style={{
                    width: "100%",
                    height: "auto",
                    ...(image.mixBlendMode && {
                      mixBlendMode: image.mixBlendMode,
                    }),
                  }}
                />
                {image.caption && (
                  <figcaption>
                    <Text
                      size="xs"
                      style={{
                        fontStyle: "italic",
                        textAlign: "center",
                        marginBlockStart: "1rem",
                      }}
                    >
                      {image.caption}
                    </Text>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </PageLayout>
    </Wrapper>
  );
};

export default StoryBlock;
