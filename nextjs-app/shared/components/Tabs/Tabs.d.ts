import React from "react";
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
    /** Active tab key (controlled mode); "" is treated as absent. */
    activeTab?: string;
    /** Initially active tab key (uncontrolled mode). */
    defaultActiveTab?: string;
    /** Size. @default "md" */
    size?: "sm" | "md" | "lg";
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
declare const Tabs: React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>>;
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
export declare function getTabPanelProps(tabKey: string, isActive: boolean): {
    id: string;
    role: "tabpanel";
    "aria-labelledby": string;
    hidden: boolean;
    tabIndex: number;
};
export default Tabs;
//# sourceMappingURL=Tabs.d.ts.map