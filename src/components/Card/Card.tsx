import React from "react";
import { useTranslation } from "react-i18next";
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
}

export interface CardProps {
  title?: string; // Optional to allow custom header composition
  subTitle?: string; // Secondary heading text
  extra?: React.ReactNode; // Right-aligned header extra (e.g., button, badge)
  cover?: React.ReactNode; // Media at top (image, figure)
  actions?: CardAction[]; // Footer actions
  loading?: boolean; // Skeleton state
  hoverable?: boolean; // Elevation on hover
  bordered?: boolean; // Toggle border
  size?: "sm" | "md" | "lg"; // Spacing scale
  tabs?: CardTab[]; // Optional tab list
  activeTabKey?: string; // Controlled active tab
  defaultActiveTabKey?: string; // Uncontrolled initial tab
  onTabChange?: (key: string) => void; // Tab selection callback
  body?: string; // Legacy support
  link?: string; // Legacy clickable wrapper
  icon?: React.ReactNode; // Leading icon
  linkLabel?: string; // aria-label for link variant (TODO: integrate i18n)
  className?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subTitle,
  extra,
  cover,
  actions,
  loading = false,
  hoverable = false,
  bordered = true,
  size = "md",
  tabs,
  activeTabKey,
  defaultActiveTabKey,
  onTabChange,
  body,
  link,
  icon,
  linkLabel,
  className = "",
  children,
}) => {
  const { t } = useTranslation();
  // Tab state (uncontrolled fallback)
  const [internalTab, setInternalTab] = React.useState(defaultActiveTabKey);
  const effectiveActiveTab = activeTabKey ?? internalTab ?? tabs?.[0]?.key;

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;
    if (!activeTabKey) setInternalTab(key);
    onTabChange?.(key);
  };

  const tabList = tabs && tabs.length > 0 && (
    <div className={styles.tabList} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.key === effectiveActiveTab;
        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            disabled={tab.disabled}
            className={[
              styles.tab,
              isActive ? styles.tabActive : "",
              tab.disabled ? styles.tabDisabled : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => handleTabClick(tab.key, tab.disabled)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  const footerActions = actions && actions.length > 0 && (
    <div className={styles.actions}>
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          disabled={action.disabled}
          className={styles.actionBtn}
          onClick={() => action.onClick?.(action.key)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );

  const stateClasses = [
    hoverable ? styles.hoverable : "",
    bordered ? styles.bordered : styles.unbordered,
    styles[size],
    loading ? styles.loading : "",
  ].filter(Boolean);

  const content = (
    <div
      className={[styles.card, ...stateClasses, className].join(" ")}
      tabIndex={link ? -1 : 0}
    >
      {cover && <div className={styles.cover}>{cover}</div>}
      {(title || subTitle || extra || icon) && (
        <div className={styles.header}>
          <div className={styles.headerMain}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {title && (
              <h3 className={styles.title} data-card-title>
                {title}
              </h3>
            )}
            {subTitle && <span className={styles.subTitle}>{subTitle}</span>}
          </div>
          {extra && <div className={styles.extra}>{extra}</div>}
        </div>
      )}
      {tabList}
      {loading ? (
        <div
          className={styles.skeleton}
          aria-busy="true"
          aria-label={t("card.loading")}
          role="status"
        />
      ) : (
        <>
          {body && <div className={styles.body}>{body}</div>}
          {children && <div className={styles.body}>{children}</div>}
        </>
      )}
      {footerActions}
    </div>
  );

  return link ? (
    <a
      href={link}
      className={[styles.card, ...stateClasses, className].join(" ")}
      tabIndex={0}
      aria-label={linkLabel || title}
    >
      {cover && <div className={styles.cover}>{cover}</div>}
      {(title || subTitle || extra || icon) && (
        <div className={styles.header}>
          <div className={styles.headerMain}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {title && (
              <h3 className={styles.title} data-card-title>
                {title}
              </h3>
            )}
            {subTitle && <span className={styles.subTitle}>{subTitle}</span>}
          </div>
          {extra && <div className={styles.extra}>{extra}</div>}
        </div>
      )}
      {tabList}
      {loading ? (
        <div
          className={styles.skeleton}
          aria-busy="true"
          aria-label={t("card.loading")}
          role="status"
        />
      ) : (
        <>
          {body && <div className={styles.body}>{body}</div>}
          {children && <div className={styles.body}>{children}</div>}
        </>
      )}
      {footerActions}
    </a>
  ) : (
    content
  );
};

export default Card;
