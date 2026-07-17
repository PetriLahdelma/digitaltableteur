import React, { forwardRef } from "react";
import { useTranslate } from "../../lib/translation";
import Icon from "@dt/Icon";
import styles from "./Tabs.module.css";

export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
  /** Leading glyph: a Phosphor icon name (e.g. "house") or a rendered node. Decorative. */
  icon?: React.ReactNode | string;
  /** Trailing count pill (e.g. unread total). Part of the tab's accessible name. */
  count?: number;
}

export interface TabsProps {
  // v2.0.0 PROPS
  /** Active tab key (controlled mode); "" is treated as absent. */
  activeTab?: string;
  /** Initially active tab key (uncontrolled mode). */
  defaultActiveTab?: string;
  /** Size. @default "md" */
  size?: "sm" | "md" | "lg";

  // EXISTING PROPS
  /** Array of tab items with key, label, optional disabled/icon/count. */
  tabs: TabItem[];
  /** Called with the clicked tab's key. */
  onTabChange?: (key: string) => void;
  /** Optional utility classes on the tablist. */
  className?: string;
  /** Accessible label for the tablist. @default "Navigate between tabs" */
  ariaLabel?: string;
  /** Visual style variant. @default "default" */
  variant?: "default" | "pills" | "underline";
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const ICON_PX: Record<NonNullable<TabsProps["size"]>, number> = {
  sm: 16,
  md: 18,
  lg: 20,
};

/** Leading icon: Phosphor name → <Icon>, otherwise render the node as-is. */
function renderTabIcon(
  icon: React.ReactNode | string,
  size: NonNullable<TabsProps["size"]>,
): React.ReactNode {
  if (icon == null || icon === false) return null;
  if (typeof icon === "string") {
    const trimmed = icon.trim();
    if (!trimmed) return null;
    return (
      <Icon name={trimmed} size={ICON_PX[size]} decorative color="currentColor" />
    );
  }
  return icon;
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

/** Tablist navigation with keyboard support and a sliding selection indicator. */
const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    activeTab,
    defaultActiveTab,
    size = "md",
    tabs,
    onTabChange,
    className = "",
    ariaLabel,
    variant = "default",
  },
  ref,
) {
  const t = useTranslate();

  // Tab state (uncontrolled fallback)
  const [internalTab, setInternalTab] = React.useState(
    defaultActiveTab || tabs[0]?.key || "",
  );

  // "" is treated as absent (tab keys are never empty): a seeded/cleared
  // activeTab control must not freeze the tablist into controlled-nothing.
  const effectiveActiveTab = activeTab || internalTab;

  // Sliding indicator geometry, measured from the selected tab. Bridged into
  // CSS via custom properties so all visual styling stays in the module.
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = React.useState({ x: 0, w: 0, ready: false });

  const setListRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const measure = React.useCallback(() => {
    const active = tabRefs.current[effectiveActiveTab];
    if (!listRef.current || !active) return;
    // offsetLeft/offsetWidth are relative to the positioned tablist and are
    // unaffected by the indicator's own transform — stable across animations.
    setIndicator({ x: active.offsetLeft, w: active.offsetWidth, ready: true });
  }, [effectiveActiveTab]);

  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure, tabs, size, variant]);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(list);
    return () => observer.disconnect();
  }, [measure]);

  React.useEffect(() => {
    // Label widths shift once the web font swaps in — re-measure then.
    const fonts = (
      document as Document & { fonts?: { ready: Promise<unknown> } }
    ).fonts;
    if (!fonts?.ready) return;
    let cancelled = false;
    fonts.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [measure]);

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
      tabRefs.current[targetTab.key]?.focus();
    }
  };

  if (!tabs || tabs.length === 0) {
    return null;
  }

  return (
    <div
      ref={setListRef}
      className={[
        styles.tabs,
        styles[variant],
        styles[`tabs--${size}`],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
      aria-label={
        /* || not ??: Storybook's seeded text controls pass "", and an empty
           accessible name is never valid — fall back to the translated label. */
        ariaLabel || t("tabs.navigation", "Navigate between tabs")
      }
      data-indicator-ready={indicator.ready ? "true" : "false"}
      style={
        {
          "--tab-ind-x": `${indicator.x}px`,
          "--tab-ind-w": `${indicator.w}px`,
        } as React.CSSProperties
      }
    >
      {tabs.map((tab, index) => {
        const isActive = tab.key === effectiveActiveTab;
        const isDisabled = tab.disabled;
        const icon = renderTabIcon(tab.icon, size);

        return (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            ref={(el) => {
              tabRefs.current[tab.key] = el;
            }}
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
            {icon && (
              <span className={styles.tabIcon} aria-hidden="true">
                {icon}
              </span>
            )}
            <span className={styles.tabLabel}>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span className={styles.count}>{tab.count}</span>
            )}
          </button>
        );
      })}
      <span
        className={styles.indicator}
        data-tab-indicator
        aria-hidden="true"
      />
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
