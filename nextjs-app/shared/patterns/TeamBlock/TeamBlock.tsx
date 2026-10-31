"use client";

import React from "react";
import PageLayout from "../PageLayout/PageLayout";
import { Avatar, Text, Title } from "@digitaltableteur/react";
import styles from "./TeamBlock.module.css";

/**
 * Represents a single team member
 */
export interface TeamMember {
  /** Member's full name */
  name: string;
  /** Member's role or job title */
  title: string;
  /** Path to member's photo; without one the avatar shows initials */
  image?: string;
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
  /** Avatar diameter as any CSS length (default 7rem) */
  avatarSize?: string;
}

/**
 * TeamBlock - A reusable design system component for displaying team members
 *
 * Displays a centred grid of team members: an Avatar, the name and the title.
 * Rows that hold fewer members than `columns` stay centred instead of
 * hugging the start edge. Commonly used in case studies to credit teams.
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
  avatarSize,
}) => {
  const Wrapper = as;
  const bgColors = {
    light: "var(--color-light-bg)",
    white: "var(--color-white)",
    transparent: "transparent",
  };

  const columnClass = styles[`columns${columns}`];

  return (
    <Wrapper
      className={[styles.teamBlock, className].filter(Boolean).join(" ")}
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
            size="m"
            className={styles.sectionTitle}
            data-team-title
          >
            {sectionTitle}
          </Title>
        )}

        {description && (
          <div className={styles.description}>
            {typeof description === "string" ? (
              <Text size="m">{description}</Text>
            ) : (
              description
            )}
          </div>
        )}

        <div className={[styles.grid, columnClass].join(" ")}>
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
                {/* The name is printed below, so the avatar stays silent. */}
                <Avatar
                  name={member.name}
                  imageUrl={member.image}
                  variant={member.image ? "image" : "initials"}
                  size={avatarSize || "7rem"}
                  alt=""
                />
                <Title
                  level={3}
                  size="xs"
                  className={styles.memberName}
                >
                  {member.name}
                </Title>
                <Text size="s" className={styles.memberTitle}>
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
