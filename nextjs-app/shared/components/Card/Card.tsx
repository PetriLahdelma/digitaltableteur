import React from "react";
import styles from "./Card.module.css";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Skeleton from "@dt/Skeleton";

export type CardVariant = "default" | "muted" | "transparent";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardTitleProps {
  /** Heading level for the document outline @default 3 */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Rendered element (defaults to h{level}) */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** Title size on the type ladder @default "xxs" */
  size?: "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
  /** Title terminals @default "sans" */
  terminals?: "sans" | "serif";
  className?: string;
}

export interface CardDescriptionProps {
  /** Text size on the text ladder @default "s" */
  size?: "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";
  /** Rendered element for the description @default "p" */
  as?: "p" | "span" | "div";
  className?: string;
}

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /**
   * Background variant. All variants keep a transparent border so
   * switching never causes layout jitter.
   * - default: surface background with a hairline border
   * - muted: recessed light background, no visible border
   * - transparent: no background, no border — grouping without weight
   */
  variant?: CardVariant;
  /** Internal padding step on the space scale (12/16/24px) @default "md" */
  padding?: CardPadding;
  /** Semantic element for the card surface @default "div" */
  as?: "div" | "article" | "section" | "aside" | "li";
  /** Optional heading rendered at the top of the card */
  title?: string;
  /** Heading configuration */
  titleProps?: CardTitleProps;
  /** Optional supporting line under the title */
  description?: string;
  /** Description configuration */
  descriptionProps?: CardDescriptionProps;
  /** Right-aligned slot in the header row (badge, timestamp, action) */
  extra?: React.ReactNode;
  /** Makes the whole card one link to this href */
  link?: string;
  /** Accessible name for the link when title alone is ambiguous */
  linkLabel?: string;
  /** Skeleton loading state (role=status, aria-busy) */
  loading?: boolean;
  children?: React.ReactNode;
}

const paddingClassMap: Record<CardPadding, string> = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: "",
  lg: styles.paddingLg,
};

const variantClassMap: Record<CardVariant, string> = {
  default: styles.default,
  muted: styles.muted,
  transparent: styles.transparent,
};

/**
 * A quiet, bordered surface for discrete content. The container owns
 * background, hairline border, radius, and padding; structure comes from
 * composition (Title/Text/Divider/Stack) or the thin title/description/
 * extra layer. `link` stretches a single anchor across the card.
 */
export const Card: React.FC<CardProps> = ({
  variant = "default",
  padding = "md",
  as: Tag = "div",
  title,
  titleProps = {},
  description,
  descriptionProps = {},
  extra,
  link,
  linkLabel,
  loading = false,
  className,
  children,
  ...rest
}) => {
  const hasHeader = Boolean(title || extra);
  const titleLevel = titleProps.level ?? 3;

  const titleNode = title ? (
    <Title
      level={titleLevel}
      as={titleProps.as ?? (`h${titleLevel}` as CardTitleProps["as"])}
      size={titleProps.size ?? "xxs"}
      terminals={titleProps.terminals ?? "sans"}
      lineHeight="snug"
      className={[styles.title, titleProps.className]
        .filter(Boolean)
        .join(" ")}
    >
      {link ? (
        <a
          href={link}
          className={styles.cardLink}
          aria-label={linkLabel && linkLabel !== title ? linkLabel : undefined}
        >
          {title}
        </a>
      ) : (
        title
      )}
    </Title>
  ) : null;

  return (
    <Tag
      className={[
        styles.card,
        variantClassMap[variant],
        paddingClassMap[padding],
        link ? styles.linked : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...(loading ? { role: "status", "aria-busy": true } : {})}
      {...rest}
    >
      {loading ? (
        <Skeleton variant="text" lines={3} />
      ) : (
        <>
          {hasHeader && (
            <div className={styles.header}>
              {titleNode}
              {extra && <div className={styles.extra}>{extra}</div>}
            </div>
          )}
          {description && (
            <Text
              as={descriptionProps.as ?? "p"}
              size={descriptionProps.size ?? "s"}
              className={[styles.description, descriptionProps.className]
                .filter(Boolean)
                .join(" ")}
            >
              {description}
            </Text>
          )}
          {children}
          {link && !title && (
            <a href={link} className={styles.cardLink} aria-label={linkLabel ?? link} />
          )}
        </>
      )}
    </Tag>
  );
};

export default Card;
