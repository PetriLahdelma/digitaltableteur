import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./Tabs.module.css";

export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTabKey?: string;
  defaultActiveTabKey?: string;
  onTabChange?: (key: string) => void;
  className?: string;
  variant?: "default" | "pills" | "underline";
  size?: "s" | "m" | "l";
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTabKey,
  defaultActiveTabKey,
  onTabChange,
  className = "",
  variant = "default",
  size = "m",
}) => {
  const { t } = useTranslation();

  // Tab state (uncontrolled fallback)
  const [internalTab, setInternalTab] = React.useState(
    defaultActiveTabKey || tabs[0]?.key || "",
  );

  const effectiveActiveTab = activeTabKey ?? internalTab;

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;
    if (!activeTabKey) setInternalTab(key);
    onTabChange?.(key);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    key: string,
    index: number,
    disabled?: boolean,
  ) => {
    if (disabled) return;

    let targetIndex = index;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        targetIndex = index === 0 ? tabs.length - 1 : index - 1;
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        targetIndex = index === tabs.length - 1 ? 0 : index + 1;
        break;
      case "Home":
        event.preventDefault();
        targetIndex = 0;
        break;
      case "End":
        event.preventDefault();
        targetIndex = tabs.length - 1;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleTabClick(key, disabled);
        return;
      default:
        return;
    }

    // Focus the target tab
    const targetTab = tabs[targetIndex];
    if (targetTab && !targetTab.disabled) {
      const tabElement = document.querySelector(
        `[data-tab-key="${targetTab.key}"]`,
      ) as HTMLButtonElement;
      tabElement?.focus();
    }
  };

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <div
      className={[styles.tabs, styles[variant], styles[size], className]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
      aria-label={t("tabs.navigation", "Navigate between tabs")}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.key === effectiveActiveTab;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.key}
            data-tab-key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            tabIndex={isActive ? 0 : -1}
            className={[
              styles.tab,
              isActive ? styles.tabActive : "",
              isDisabled ? styles.tabDisabled : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => handleTabClick(tab.key, isDisabled)}
            onKeyDown={(e) => handleKeyDown(e, tab.key, index, isDisabled)}
          >
            <span className={styles.tabLabel}>{tab.label}</span>
            {variant === "underline" && (
              <span className={styles.tabIndicator} aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
