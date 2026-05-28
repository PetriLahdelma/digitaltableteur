"use client";

import React from "react";
import PageLayout from "../PageLayout/PageLayout";
import Title from "@dt/Title";
import Text from "@dt/Text";
import List from "@dt/List";
import styles from "./ProcessBlock.module.css";

/**
 * Represents a single process phase with its activities
 */
export interface ProcessPhase {
  /** Phase name (e.g., "Discover", "Define", "Ideate", "Design") */
  title: string;
  /** List of activities or deliverables in this phase */
  activities: string[];
}

/**
 * Props for the ProcessBlock component
 */
export interface ProcessBlockProps {
  /** Array of process phases to display */
  phases: ProcessPhase[];
  /** Optional main title for the process section */
  sectionTitle?: string;
  /** Optional description or introduction text */
  description?: React.ReactNode;
  /** Background color variant */
  backgroundColor?: "light" | "white" | "transparent";
  /** Maximum width constraint */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Spacing variant */
  spacing?: "compact" | "default" | "comfortable" | "spacious";
  /** Number of columns (2, 3, or 4) */
  columns?: 2 | 3 | 4;
  /** Additional CSS class */
  className?: string;
  /** Semantic HTML element to use */
  as?: "section" | "article" | "div";
  /** Accessible label for the section */
  ariaLabel?: string;
}

/**
 * ProcessBlock - A reusable design system component for displaying project process phases
 *
 * Displays a multi-column grid of process phases with their activities, commonly used in
 * case studies and work pages to showcase methodology.
 *
 * @example
 * ```tsx
 * <ProcessBlock
 *   phases={[
 *     { title: "Discover", activities: ["User Research", "Stakeholder Workshops"] },
 *     { title: "Define", activities: ["User Personas", "Journey Mapping"] },
 *   ]}
 *   sectionTitle="Our Process"
 *   columns={4}
 * />
 * ```
 */
const ProcessBlock: React.FC<ProcessBlockProps> = ({
  phases,
  sectionTitle = "Process",
  description,
  backgroundColor = "light",
  maxWidth = "lg",
  spacing = "comfortable",
  columns = 4,
  className = "",
  as = "section",
  ariaLabel,
}) => {
  const Wrapper = as;
  const bgColors = {
    light: "var(--color-light-bg)",
    white: "var(--color-white)",
    transparent: "transparent",
  };

  const gridClass =
    columns === 2
      ? styles.grid2Col
      : columns === 3
        ? styles.grid3Col
        : styles.grid4Col;

  return (
    <Wrapper
      className={`${styles.processBlock} ${className}`}
      style={{
        backgroundColor: bgColors[backgroundColor],
        paddingBlock: "var(--space-xl, 3rem)",
      }}
      aria-label={ariaLabel || sectionTitle}
    >
      <PageLayout maxWidth={maxWidth} spacing={spacing} as="div">
        {sectionTitle && (
          <Title
            level={2}
            size="M"
            terminals="sans"
            className={styles.sectionTitle}
            data-process-title
          >
            {sectionTitle}
          </Title>
        )}

        {description && (
          <div className={styles.description}>
            {typeof description === "string" ? (
              <Text size="M">{description}</Text>
            ) : (
              description
            )}
          </div>
        )}

        <div className={gridClass}>
          {phases.map((phase, index) => (
            <div key={phase.title || index} className={styles.col}>
              <Title
                size="XS"
                terminals="sans"
                level={3}
                className={styles.phaseTitle}
              >
                {phase.title}
              </Title>
              <List
                items={phase.activities}
                size="S"
                terminals="sans"
                className={styles.activityList}
                listStyleType="none"
              />
            </div>
          ))}
        </div>
      </PageLayout>
    </Wrapper>
  );
};

export default ProcessBlock;
