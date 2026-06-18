"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Title from "@dt/Title";
import Text from "@dt/Text";
import Link from "@dt/Link";
import Button from "@dt/Button";
import Badge from "@dt/Badge";
import Tabs from "@dt/Tabs";
import type { TabItem } from "@dt/Tabs";
import styles from "./Card.module.css";

export interface CardTab {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface CardAction {
  key: string;
  label: React.ReactNode;
  onClick?: (key: string) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "tertiary";
}

export interface CardProps {
  /** Card title displayed in header */
  title?: string;
  /** Title configuration options */
  titleProps?: {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    size?: "s" | "m" | "l" | "xl";
    terminals?: "sans" | "serif";
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    className?: string;
  };
  /** Supporting subtitle text below title */
  subTitle?: string;
  /** Subtitle configuration options */
  subTitleProps?: {
    size?: "s" | "m" | "l";
    as?: "p" | "span" | "div" | "strong" | "em" | "cite" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    className?: string;
  };
  /** Descriptive text in header area */
  description?: string;
  /** Description configuration options */
  descriptionProps?: {
    size?: "s" | "m" | "l";
    as?: "p" | "span" | "div" | "strong" | "em" | "cite" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    className?: string;
  };
  /** Body text configuration options */
  bodyProps?: {
    size?: "s" | "m" | "l";
    as?: "p" | "span" | "div" | "strong" | "em" | "cite" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    className?: string;
  };
  /** Right-aligned header content (buttons, badges, etc.) */
  extra?: React.ReactNode;
  /** Media content at top of card (images, videos) */
  cover?: React.ReactNode;
  /** Footer action buttons */
  actions?: CardAction[];
  /** Loading skeleton state */
  loading?: boolean;
  /** Elevation on hover interaction */
  hoverable?: boolean;
  /** Toggle card border */
  bordered?: boolean;
  /** Card padding size */
  size?: "S" | "M" | "L" | "full";
  /** Card presentation variant */
  variant?: "elevated" | "filled" | "outlined";
  /** Tab navigation within card */
  tabs?: CardTab[];
  /** Controlled active tab key */
  activeTabKey?: string;
  /** Default tab when uncontrolled */
  defaultActiveTabKey?: string;
  /** Tab change callback */
  onTabChange?: (key: string) => void;
  /** Legacy body text support */
  body?: string;
  /** Make entire card clickable */
  link?: string;
  /** Leading icon in header - React element or icon component */
  icon?: React.ReactNode;
  /** Icon positioning and styling options */
  iconProps?: {
    position?: "start" | "end" | "top";
    size?: "sm" | "md" | "lg";
    className?: string;
  };
  /** Badge in header area */
  badge?: React.ReactNode;
  /** Badge configuration options */
  badgeProps?: {
    variant?: "primary" | "secondary";
    tone?: "neutral" | "error" | "warning" | "success" | "info";
    size?: "sm" | "md" | "lg";
    position?: "start" | "end";
  };
  /** Status/error message displayed below header */
  statusMessage?: string;
  /** Status message configuration */
  statusMessageProps?: {
    state?: "success" | "info" | "error" | "warning";
    size?: "s" | "m" | "l";
    className?: string;
  };
  /** Accessible label for link cards */
  linkLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /** Enable interactive behavior without link */
  interactive?: boolean;
  /** Click handler for interactive cards */
  onClick?: () => void;
  /** Custom body styles */
  bodyStyle?: React.CSSProperties;
  /** Custom header styles */
  headStyle?: React.CSSProperties;
  /** Custom footer content */
  footer?: React.ReactNode;
  /** Main card content */
  children?: React.ReactNode;
}

/** Composable surface for grouped content with header, body, media, and actions. */
const Card: React.FC<CardProps> = ({
  title,
  titleProps = {},
  subTitle,
  subTitleProps = {},
  description,
  descriptionProps = {},
  bodyProps = {},
  extra,
  cover,
  actions,
  loading = false,
  hoverable = false,
  bordered = true,
  size = "M",
  variant = "outlined",
  tabs,
  activeTabKey,
  defaultActiveTabKey,
  onTabChange,
  body,
  link,
  icon,
  iconProps = {},
  badge,
  badgeProps = {},
  statusMessage,
  statusMessageProps = {},
  linkLabel,
  className = "",
  interactive = false,
  onClick,
  bodyStyle,
  headStyle,
  footer,
  children,
}) => {
  const { t } = useTranslation();

  // Tab state (uncontrolled fallback)
  const [internalTab, setInternalTab] = React.useState(defaultActiveTabKey);
  const effectiveActiveTab = activeTabKey ?? internalTab ?? tabs?.[0]?.key;

  const handleTabClick = (key: string) => {
    if (!activeTabKey) setInternalTab(key);
    onTabChange?.(key);
  };

  // Convert CardTab[] to TabItem[] for Tabs component
  const tabItems: TabItem[] | undefined = tabs?.map((tab) => ({
    key: tab.key,
    label: tab.label,
    disabled: tab.disabled,
  }));

  const tabSection = tabItems && tabItems.length > 0 && (
    <Tabs
      tabs={tabItems}
      activeTab={effectiveActiveTab}
      onTabChange={handleTabClick}
      variant="underline"
      size={size === "full" ? "M" : size}
      className={styles.cardTabs}
    />
  );

  const footerActions = actions && actions.length > 0 && (
    <div className={styles.cardActions}>
      {actions.map((action) => (
        <Button
          key={action.key}
          variant={action.variant || "secondary"}
          disabled={action.disabled}
          onClick={() => action.onClick?.(action.key)}
          size={size === "L" ? "lg" : size === "S" ? "sm" : "md"}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );

  // Map size API to CSS class names
  const sizeClass =
    size === "S" ? "s" : size === "M" ? "m" : size === "L" ? "l" : size;

  const stateClasses = [
    hoverable ? styles.hoverable : "",
    bordered ? styles.bordered : styles.unbordered,
    styles[sizeClass],
    loading ? styles.loading : "",
    styles[variant],
  ].filter(Boolean);

  const isInteractive = interactive || Boolean(onClick);

  const hasHeader = Boolean(title || subTitle || description || extra || icon || badge);
  const hasBodyContent = Boolean(body || children);
  const hasFooter = Boolean(footer || (actions && actions.length > 0));

  // Create badge element if badge prop exists
  const badgeElement = badge && (
    <div className={styles.badgeContainer}>
      {typeof badge === "string" || typeof badge === "number" ? (
        <Badge
          variant={badgeProps.variant}
          tone={badgeProps.tone}
          size={badgeProps.size}
        >
          {badge}
        </Badge>
      ) : (
        badge
      )}
    </div>
  );

  const headerBlock = hasHeader && (
    <div className={styles.cardHeader} style={headStyle}>
      <div className={styles.headerMain}>
        {icon && iconProps.position !== "top" && (
          <span
            className={[
              styles.icon,
              styles[
                `icon${iconProps.size ? iconProps.size.charAt(0).toUpperCase() + iconProps.size.slice(1) : "Md"}`
              ],
              iconProps.position === "end" ? styles.iconEnd : styles.iconStart,
              iconProps.className,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {icon}
          </span>
        )}
        <div className={styles.headerText}>
          {iconProps.position === "top" && icon && (
            <span
              className={[
                styles.icon,
                styles[
                  `icon${iconProps.size ? iconProps.size.charAt(0).toUpperCase() + iconProps.size.slice(1) : "Md"}`
                ],
                styles.iconTop,
                iconProps.className,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {icon}
            </span>
          )}
          {title && (
            <Title
              level={titleProps.level || 3}
              size={titleProps.size || "m"}
              terminals={titleProps.terminals || "serif"}
              as={titleProps.as || "h3"}
              className={[styles.title, titleProps.className]
                .filter(Boolean)
                .join(" ")}
            >
              {title}
            </Title>
          )}
          {subTitle && (
            <Text
              as={subTitleProps.as || "span"}
              size={subTitleProps.size || "s"}
              className={[styles.subTitle, subTitleProps.className]
                .filter(Boolean)
                .join(" ")}
            >
              {subTitle}
            </Text>
          )}
          {description && (
            <Text
              size={descriptionProps.size || "s"}
              as={descriptionProps.as || "p"}
              className={[styles.description, descriptionProps.className]
                .filter(Boolean)
                .join(" ")}
            >
              {description}
            </Text>
          )}
        </div>
        {badgeProps.position === "start" && badgeElement}
      </div>
      {(extra || (badge && badgeProps.position !== "start")) && (
        <div className={styles.extra}>
          {badge && badgeProps.position !== "start" && badgeElement}
          {extra}
        </div>
      )}
    </div>
  );

  // Status message block (between header and content)
  const statusMessageBlock = statusMessage && (
    <div className={styles.statusMessage}>
      <div
        className={[
          styles.statusText,
          statusMessageProps.state &&
            styles[
              `status${statusMessageProps.state.charAt(0).toUpperCase() + statusMessageProps.state.slice(1)}`
            ],
          statusMessageProps.className,
        ]
          .filter(Boolean)
          .join(" ")}
        role={statusMessageProps.state === "error" ? "alert" : "status"}
      >
        <Text size={statusMessageProps.size || "s"} as="span">
          {statusMessage}
        </Text>
      </div>
    </div>
  );

  const hasTabs = Boolean(tabItems && tabItems.length > 0 && effectiveActiveTab);
  const tabPanelProps = hasTabs
    ? {
        id: `tabpanel-${effectiveActiveTab}`,
        role: "tabpanel" as const,
        "aria-labelledby": `tab-${effectiveActiveTab}`,
        tabIndex: 0,
      }
    : {};

  const bodyBlock = !loading && hasBodyContent && (
    <div
      className={styles.cardContent}
      style={bodyStyle}
      {...tabPanelProps}
    >
      {body && (
        <Text
          size={bodyProps.size || "m"}
          as={bodyProps.as || "p"}
          className={[styles.bodyText, bodyProps.className]
            .filter(Boolean)
            .join(" ")}
        >
          {body}
        </Text>
      )}
      {children}
    </div>
  );

  const footerBlock = hasFooter && (
    <div className={styles.cardFooter}>
      {footer}
      {footerActions}
    </div>
  );

  const skeleton = (
    <div
      className={styles.skeleton}
      aria-busy="true"
      aria-label={t("card.loading")}
      role="status"
    />
  );

  const innerContent = (
    <>
      {cover && <div className={styles.cardMedia}>{cover}</div>}
      {headerBlock}
      {statusMessageBlock}
      {tabSection}
      {loading ? skeleton : bodyBlock}
      {footerBlock}
    </>
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive || !onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const baseClasses = [
    styles.card,
    ...stateClasses,
    isInteractive ? styles.interactive : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const hasVisibleLinkText = Boolean(description || body || subTitle || children);
  const linkAccessibleName = hasVisibleLinkText ? undefined : linkLabel || title;

  return link ? (
    <Link
      href={link}
      className={baseClasses}
      aria-label={linkAccessibleName}
      title={linkLabel || title}
    >
      {innerContent}
    </Link>
  ) : (
    <div
      className={baseClasses}
      tabIndex={isInteractive ? 0 : undefined}
      role={isInteractive ? "button" : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {innerContent}
    </div>
  );
};

export default Card;
