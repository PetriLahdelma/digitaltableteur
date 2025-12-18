"use client";

import React from "react";
import Image from "next/image";
import PageLayout from "../PageLayout/PageLayout";
import Title from "@dt/Title";
import Text from "@dt/Text";
import styles from "./TeamBlock.module.css";

/**
 * Represents a single team member
 */
export interface TeamMember {
  /** Member's full name */
  name: string;
  /** Member's role or job title */
  title: string;
  /** Path to member's image */
  image: string;
  /** Alt text for the image (defaults to name if not provided) */
  imageAlt?: string;
  /** Image width in pixels */
  imageWidth?: number;
  /** Image height in pixels */
  imageHeight?: number;
  /** Optional link to member's profile or LinkedIn */
  link?: string;
}

/**
 * Props for the TeamBlock component
 */
export interface TeamBlockProps {
  /** Array of team members to display */
  members: TeamMember[];
  /** Optional section title */
  sectionTitle?: string;
  /** Optional description or introduction text */
  description?: React.ReactNode;
  /** Number of columns for desktop layout (2-6) */
  columns?: 2 | 3 | 4 | 5 | 6;
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
  /** Show member images as circles instead of rounded squares */
  roundImages?: boolean;
}

/**
 * TeamBlock - A reusable design system component for displaying team members
 *
 * Displays a multi-column grid of team members with images, names, and titles.
 * Commonly used in case studies and work pages to showcase project teams.
 *
 * @example
 * ```tsx
 * <TeamBlock
 *   members={[
 *     { name: "Laura Karhu", title: "Project Lead", image: "/path/to/image.png" },
 *     { name: "Petri Lahdelma", title: "Senior UX Designer", image: "/path/to/image.png" },
 *   ]}
 *   sectionTitle="Project Team"
 *   columns={5}
 * />
 * ```
 */
const TeamBlock: React.FC<TeamBlockProps> = ({
  members,
  sectionTitle = "Team",
  description,
  columns = 5,
  backgroundColor = "transparent",
  maxWidth = "lg",
  spacing = "comfortable",
  className = "",
  as = "section",
  ariaLabel,
  roundImages = false,
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
      : columns === 4
      ? styles.grid4Col
      : columns === 5
      ? styles.grid5Col
      : styles.grid6Col;

  const imageClass = roundImages
    ? `${styles.teamImage} ${styles.roundImage}`
    : styles.teamImage;

  return (
    <Wrapper
      className={`${styles.teamBlock} ${className}`}
      style={{
        backgroundColor: bgColors[backgroundColor],
        paddingBlock: backgroundColor !== "transparent" ? "var(--space-xl, 3rem)" : "0",
      }}
      aria-label={ariaLabel || sectionTitle}
    >
      <PageLayout maxWidth={maxWidth} spacing={spacing} as="div">
        {sectionTitle && (
          <Title
            level={2}
            size="M"
            className={styles.sectionTitle}
            data-team-title
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
          {members.map((member, index) => {
            const MemberWrapper = member.link ? "a" : "div";
            const memberProps = member.link
              ? {
                  href: member.link,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: styles.memberLink,
                }
              : {};

            return (
              <MemberWrapper
                key={`${member.name}-${index}`}
                className={styles.col}
                {...memberProps}
              >
                <Image
                  src={member.image}
                  alt={member.imageAlt || member.name}
                  width={member.imageWidth || 112}
                  height={member.imageHeight || 112}
                  className={imageClass}
                />
                <Title
                  level={4}
                  terminals="sans"
                  size="XS"
                  className={styles.memberName}
                >
                  {member.name}
                </Title>
                <Text size="S" className={styles.memberTitle}>
                  {member.title}
                </Text>
              </MemberWrapper>
            );
          })}
        </div>
      </PageLayout>
    </Wrapper>
  );
};

export default TeamBlock;
