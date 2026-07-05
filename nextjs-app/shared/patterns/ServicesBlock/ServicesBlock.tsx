"use client";

import React from "react";
import PageLayout from "../PageLayout/PageLayout";
import Title from "@dt/Title";
import Text from "@dt/Text";
import List from "@dt/List";
import styles from "./ServicesBlock.module.css";

export interface ServiceItem {
  /** Service name or description */
  label: string;
}

export interface ToolIcon {
  /** Unique identifier */
  key: string;
  /** Icon component */
  icon: React.ReactNode;
  /** Accessible label for icon */
  ariaLabel: string;
}

export interface ServicesBlockProps {
  /** List of services provided */
  services?: ServiceItem[];
  /** Project duration or timeline */
  duration?: string;
  /** Tools/technologies used (icon objects) */
  tools?: ToolIcon[];
  /** Overview title (defaults to "Overview") */
  overviewTitle?: string;
  /** Overview content (can be string or React node for rich content) */
  overview: React.ReactNode;
  /** Optional title for services section (defaults to "Services") */
  servicesTitle?: string;
  /** Optional title for duration section (defaults to "Duration") */
  durationTitle?: string;
  /** Optional title for tools section (defaults to "Tools") */
  toolsTitle?: string;
  /** Maximum content width */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /** Vertical spacing */
  spacing?: "compact" | "default" | "comfortable" | "spacious";
  /** Custom CSS class for styling extensions */
  className?: string;
  /** Semantic HTML element to render as */
  as?: "section" | "article" | "div";
  /** ARIA label for section */
  ariaLabel?: string;
}

/**
 * ServicesBlock component.
 */
export const ServicesBlock: React.FC<ServicesBlockProps> = ({
  services = [],
  duration,
  tools = [],
  overview,
  // || below, not just destructure defaults: a cleared/seeded Controls text
  // field passes "" and must fall back the same way — an empty section
  // heading fails axe (empty-heading).
  overviewTitle: overviewTitleProp,
  servicesTitle: servicesTitleProp,
  durationTitle: durationTitleProp,
  toolsTitle: toolsTitleProp,
  maxWidth = "md",
  spacing = "comfortable",
  className,
  as = "section",
  ariaLabel,
}) => {
  const overviewTitle = overviewTitleProp || "Overview";
  const servicesTitle = servicesTitleProp || "Services";
  const durationTitle = durationTitleProp || "Duration";
  const toolsTitle = toolsTitleProp || "Tools";

  const hasServices = services.length > 0;
  const hasDuration = Boolean(duration);
  const hasTools = tools.length > 0;
  const hasMetadata = hasServices || hasDuration || hasTools;

  const rootClassName = className
    ? `${styles.servicesBlock} ${className}`
    : styles.servicesBlock;

  // Fallback ARIA label: default to overviewTitle when none provided
  const computedAriaLabel = ariaLabel || overviewTitle;

  return (
    <PageLayout
      maxWidth={maxWidth}
      spacing={spacing}
      as={as}
      className={rootClassName}
      ariaLabel={computedAriaLabel}
    >
      <div className={styles.grid}>
        {hasMetadata && (
          <div className={styles.metadata}>
            {hasServices && (
              <div className={styles.section}>
                <Title
                  size="xs"
                  level={3}
                  className={styles.sectionTitle}
                >
                  {servicesTitle}
                </Title>
                <List
                  items={services.map((s) => s.label)}
                  size="s"
                />
              </div>
            )}

            {hasDuration && (
              <div className={styles.section}>
                <Title
                  size="xs"
                  level={3}
                  className={styles.sectionTitle}
                >
                  {durationTitle}
                </Title>
                <Text size="s">{duration}</Text>
              </div>
            )}

            {hasTools && (
              <div className={styles.section}>
                <Title
                  size="xs"
                  level={3}
                  className={styles.sectionTitle}
                >
                  {toolsTitle}
                </Title>
                <div
                  className={styles.toolsIcons}
                  role="list"
                  aria-label={toolsTitle}
                >
                  {tools.map((tool) => (
                    <div
                      key={tool.key}
                      role="listitem"
                      aria-label={tool.ariaLabel}
                    >
                      {React.isValidElement(tool.icon)
                        ? React.cloneElement(
                            tool.icon as React.ReactElement<{
                              "aria-hidden"?: boolean;
                              focusable?: boolean;
                            }>,
                            { "aria-hidden": true, focusable: false },
                          )
                        : tool.icon}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.overview}>
          <Title
            size="xs"
            level={3}
            className={styles.sectionTitle}
          >
            {overviewTitle}
          </Title>
          {typeof overview === "string" ? (
            <Text size="s">{overview}</Text>
          ) : (
            <div className={styles.overviewContent}>{overview}</div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

ServicesBlock.displayName = "ServicesBlock";

export default ServicesBlock;
