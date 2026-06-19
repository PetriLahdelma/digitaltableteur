import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Tabs.module.css";

export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  // v2.0.0 PROPS
  /** Active tab shorthand */
  activeTab?: string;
  /** Default active tab shorthand */
  defaultActiveTab?: string;
  /** Size. @default "md" */
  size?: "sm" | "md" | "lg";

  // EXISTING PROPS
  tabs: TabItem[];
  onTabChange?: (key: string) => void;
  className?: string;
  variant?: "default" | "pills" | "underline";
}

/**
 * Tabs component renders only the tablist. Parent must render tabpanels.
 * Expected tabpanel structure:
 *
 * ```tsx
 * <div
 *   id={`tabpanel-${tab.key}`}
 *   role="tabpanel"
 *   aria-labelledby={`tab-${tab.key}`}
 *   hidden={!isActive}
 * >
 *   {content}
 * </div>
 * ```
 *
 * Or use the exported `getTabPanelProps` helper:
 *
 * ```tsx
 * <Tabs tabs={tabs} activeTab={active} onTabChange={setActive} />
 * {tabs.map(tab => (
 *   <div {...getTabPanelProps(tab.key, tab.key === active)}>
 *     {tab.key === active && <Content />}
 *   </div>
 * ))}
 * ```
 */

/** Tablist navigation with keyboard support and visual variants. */
const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    activeTab,
    defaultActiveTab,
    size = "md",
    tabs,
    onTabChange,
    className = "",
    variant = "default",
  },
  ref,
) {
  const { t } = useTranslation();

  // Tab state (uncontrolled fallback)
  const [internalTab, setInternalTab] = React.useState(
    defaultActiveTab || tabs[0]?.key || "",
  );

  const effectiveActiveTab = activeTab ?? internalTab;

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (disabled) return;
    if (!activeTab) setInternalTab(key);
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
      ref={ref}
      className={[
        styles.tabs,
        styles[variant],
        styles[`tabs--${size}`],
        className,
      ]
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
            id={`tab-${tab.key}`}
            data-tab-key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.key}`}
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
});

Tabs.displayName = "Tabs";

/**
 * Helper to generate tabpanel props for accessibility compliance.
 * Use this when rendering content panels alongside Tabs.
 *
 * @example
 * ```tsx
 * <Tabs tabs={tabs} activeTab={active} onTabChange={setActive} />
 * {tabs.map(tab => (
 *   <div {...getTabPanelProps(tab.key, tab.key === active)}>
 *     {tab.key === active && <Content />}
 *   </div>
 * ))}
 * ```
 *
 * @param tabKey - The key of the tab this panel is associated with
 * @param isActive - Whether this panel is currently active
 * @returns Object with id, role, aria-labelledby, hidden, and tabIndex props
 */
export function getTabPanelProps(tabKey: string, isActive: boolean) {
  return {
    id: `tabpanel-${tabKey}`,
    role: "tabpanel" as const,
    "aria-labelledby": `tab-${tabKey}`,
    hidden: !isActive,
    tabIndex: isActive ? 0 : -1,
  };
}

export default Tabs;
