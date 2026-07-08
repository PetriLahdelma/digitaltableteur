"use client";

import React from "react";
import Image from "next/image";
import PageLayout from "../PageLayout/PageLayout";
import { Text } from "@digitaltableteur/react";
import styles from "./GridBlock.module.css";

/**
 * Represents a grid cell with either text or image content
 */
export interface GridCell {
  /** Type of content in this cell */
  type: "text" | "image";
  /** Text content (for text cells) */
  content?: React.ReactNode;
  /** Text size variant (for text cells) */
  size?: "S" | "M" | "L" | "XL";
  /** Image source path (for image cells) */
  src?: string;
  /** Alt text (for image cells) */
  alt?: string;
  /** Image width in pixels (for image cells) */
  width?: number;
  /** Image height in pixels (for image cells) */
  height?: number;
  /** Optional CSS mix-blend-mode (for image cells) */
  mixBlendMode?: "multiply" | "normal";
  /** Apply inner padding to the cell */
  innerPadding?: boolean;
  /** Optional caption for image cells (visible only when stacked) */
  caption?: string;
}

/**
 * Props for the GridBlock component
 */
export interface GridBlockProps {
  /** Array of grid cells to render */
  cells: GridCell[];
  /** Number of columns in the grid */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between cells */
  gap?: "none" | "small" | "medium" | "large";
  /** Background color variant */
  backgroundColor?: "light" | "white" | "transparent";
  /** Maximum width constraint */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Spacing variant */
  spacing?: "compact" | "default" | "comfortable" | "spacious";
  /** Additional CSS class */
  className?: string;
  /** Semantic HTML element to use */
  as?: "section" | "div" | "article";
}

/**
 * GridBlock - A flexible grid layout component for mixing text and image content
 *
 * Allows arbitrary arrangements of text blocks and images in a grid formation.
 * Supports 1-4 column layouts with configurable gaps and content types.
 *
 * @example
 * ```tsx
 * <GridBlock
 *   columns={2}
 *   gap="none"
 *   cells={[
 *     { type: "text", content: <Text>...</Text>, size: "L", innerPadding: true },
 *     { type: "image", src: "/image.png", alt: "...", width: 1184, height: 500 }
 *   ]}
 * />
 * ```
 */
export default /**
 * GridBlock component.
 */
function GridBlock({
  cells,
  columns = 2,
  gap = "medium",
  backgroundColor = "transparent",
  maxWidth = "md",
  spacing = "comfortable",
  className = "",
  as = "section",
}: GridBlockProps) {
  const gridClassName = columns === 1 ? styles.grid1Col : styles.grid2Col;
  const gapClassName =
    gap === "none" ? styles.noGap : gap === "small" ? styles.smallGap : "";

  const responsiveGapClass = gap === "none" ? styles.responsiveGap : "";

  return (
    <section
      style={{
        backgroundColor:
          backgroundColor === "light"
            ? "var(--color-light-bg)"
            : backgroundColor === "white"
              ? "var(--color-white)"
              : "transparent",
      }}
    >
      <PageLayout maxWidth={maxWidth} spacing={spacing} as={as}>
        <div
          className={[gridClassName, gapClassName, responsiveGapClass, className]
            .filter(Boolean)
            .join(" ")}
        >
          {cells.map((cell, index) => {
            if (cell.type === "text") {
              return (
                <div
                  key={index}
                  className={`${styles.col} ${cell.innerPadding ? styles.innerPadding : ""}`}
                >
                  {cell.content}
                </div>
              );
            }

            if (cell.type === "image" && cell.src) {
              // Require alt text for all images - empty string is only valid for decorative images
              const altText = cell.alt ?? "";

              return (
                <figure key={index} className={styles.col}>
                  <Image
                    src={cell.src}
                    alt={altText}
                    layout="responsive"
                    width={cell.width || 1184}
                    height={cell.height || 500}
                    style={{
                      width: "100%",
                      height: "auto",
                      mixBlendMode: cell.mixBlendMode || "normal",
                    }}
                  />
                  {cell.caption && (
                    <figcaption className={styles.caption}>
                      <Text
                        size="xs"
                        style={{
                          fontStyle: "italic",
                          textAlign: "center",
                          marginBlockStart: "1rem",
                        }}
                      >
                        {cell.caption}
                      </Text>
                    </figcaption>
                  )}
                </figure>
              );
            }

            return null;
          })}
        </div>
      </PageLayout>
    </section>
  );
}
