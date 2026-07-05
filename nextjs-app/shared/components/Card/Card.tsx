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
  /** Leading header region. Defaults to the `title` heading block when omitted. */
  headerStart?: React.ReactNode;
  /** Trailing header region (badge, metadata, menu). Canonical replacement for `extra`. */
  headerEnd?: React.ReactNode;
  /** @deprecated Use `headerEnd`. Legacy alias feeding the trailing header region. */
  extra?: React.ReactNode;
  /** Leading footer region — the special/destructive action, pinned left. */
  footerStart?: React.ReactNode;
  /** Trailing footer region — 1–2 action buttons, pinned right. */
  footerEnd?: React.ReactNode;
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
  headerStart,
  headerEnd,
  extra,
  footerStart,
  footerEnd,
  link,
  linkLabel,
  loading = false,
  className,
  children,
  ...rest
}) => {
  const titleLevel = titleProps.level ?? 3;

  // Compute effective link early: a stretched anchor cannot wrap interactive
  // footer controls, so link mode and the action footer are mutually exclusive.
  const hasFooter = Boolean(footerStart || footerEnd);
  const linkSuppressed = Boolean(link) && hasFooter;
  if (process.env.NODE_ENV !== "production" && linkSuppressed) {
    console.warn(
      "Card: `link` is ignored when `footerStart`/`footerEnd` are set — a stretched anchor cannot wrap interactive footer controls. Use a plain card with buttons instead.",
    );
  }
  const effectiveLink = linkSuppressed ? undefined : link;

  const titleNode = title ? (
    <Title
      level={titleLevel}
      as={titleProps.as ?? (`h${titleLevel}` as CardTitleProps["as"])}
      size={titleProps.size ?? "xxs"}
      lineHeight="snug"
      className={[styles.title, titleProps.className]
        .filter(Boolean)
        .join(" ")}
    >
      {effectiveLink ? (
        <a
          href={effectiveLink}
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

  const leadingHeader = headerStart ?? titleNode;
  const trailingHeader = headerEnd ?? extra;
  const hasHeader = Boolean(leadingHeader || trailingHeader);

  return (
    <Tag
      className={[
        styles.card,
        variantClassMap[variant],
        paddingClassMap[padding],
        effectiveLink ? styles.linked : "",
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
              {leadingHeader && (
                <div className={styles.headerStart}>{leadingHeader}</div>
              )}
              {trailingHeader && (
                <div className={styles.headerEnd}>{trailingHeader}</div>
              )}
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
          {hasFooter && (
            <div className={styles.footer}>
              {footerStart && (
                <div className={styles.footerStart}>{footerStart}</div>
              )}
              {footerEnd && (
                <div className={styles.footerEnd}>{footerEnd}</div>
              )}
            </div>
          )}
          {effectiveLink && !title && (
            <a href={effectiveLink} className={styles.cardLink} aria-label={linkLabel ?? effectiveLink} />
          )}
        </>
      )}
    </Tag>
  );
};

export default Card;
