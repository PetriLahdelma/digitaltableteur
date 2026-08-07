import * as React from "react";
/**
 * Menu is the shared dropdown-menu primitive built on
 * `@radix-ui/react-dropdown-menu`. Radix owns the a11y model — roving focus,
 * arrow keys, typeahead, Escape, focus return, and collision-aware
 * positioning — so this layer contributes only the visual treatment. Compose
 * it from parts: `Menu` (root) > `MenuTrigger` (asChild around your control) >
 * `MenuContent` holding `MenuItem` / `MenuSeparator` / `MenuSub`.
 *
 * @example
 * ```tsx
 * <Menu>
 *   <MenuTrigger asChild>
 *     <Button>Actions</Button>
 *   </MenuTrigger>
 *   <MenuContent>
 *     <MenuItem icon={<Icon name="pencil" ariaLabel="" />} onSelect={edit}>
 *       Edit
 *     </MenuItem>
 *     <MenuSeparator />
 *     <MenuItem href="/settings">Settings</MenuItem>
 *   </MenuContent>
 * </Menu>
 * ```
 */
export interface MenuRootProps {
    children: React.ReactNode;
    /** Controlled open state. */
    open?: boolean;
    /** Initial open state when uncontrolled. */
    defaultOpen?: boolean;
    /** Fires when the open state changes. */
    onOpenChange?: (open: boolean) => void;
    /**
     * When true, traps focus and blocks interaction with the rest of the page
     * while open. Menus are non-modal by default so the page keeps scrolling and
     * Tab moves focus out (closing the menu) per the ARIA menu-button pattern.
     */
    modal?: boolean;
}
export declare function Menu({ children, open, defaultOpen, onOpenChange, modal, }: MenuRootProps): React.JSX.Element;
export declare namespace Menu {
    var displayName: string;
}
export interface MenuTriggerProps {
    children: React.ReactNode;
    /** Merge the trigger props onto your own control instead of a nested button. */
    asChild?: boolean;
    className?: string;
}
export declare function MenuTrigger({ children, asChild, className }: MenuTriggerProps): React.JSX.Element;
export declare namespace MenuTrigger {
    var displayName: string;
}
/**
 * Props for `MenuContent`, the portaled surface holding the menu items and the
 * primary documented control surface of the Menu set.
 */
export interface MenuProps {
    children: React.ReactNode;
    /** Extra class on the content surface. */
    className?: string;
    /** Preferred side relative to the trigger; flips when out of room. */
    side?: "top" | "right" | "bottom" | "left";
    /** Alignment along the trigger edge. */
    align?: "start" | "center" | "end";
    /** Gap in px between the trigger and the content. */
    sideOffset?: number;
}
export declare function MenuContent({ children, className, side, align, sideOffset, }: MenuProps): React.JSX.Element;
export declare namespace MenuContent {
    var displayName: string;
}
export interface MenuItemProps {
    children: React.ReactNode;
    /** Leading icon node; rendered in a fixed gutter so labels align in a column. */
    icon?: React.ReactNode;
    /** @deprecated Use `meta` (exposed to AT) or `trailingIcon`. Maps onto `meta`. */
    trailing?: React.ReactNode;
    /** End-aligned secondary content: muted text, Badge, Kbd, StatusDot, value. */
    meta?: React.ReactNode;
    /** Trailing icon after meta (chevron, external-link). */
    trailingIcon?: React.ReactNode;
    /** Renders the check indicator; pair with your own aria semantics if needed. */
    selected?: boolean;
    /** Destructive actions (deletions) get the error treatment. */
    tone?: "neutral" | "destructive";
    disabled?: boolean;
    /** Selection handler, sync or async. The menu closes after select. */
    onSelect?: () => void | Promise<void>;
    /** Render the item as a link (`<a href>`); use for navigation items. */
    href?: string;
    className?: string;
}
export declare function MenuItem({ children, icon, trailing, meta, trailingIcon, selected, tone, disabled, onSelect, href, className, }: MenuItemProps): React.JSX.Element;
export declare namespace MenuItem {
    var displayName: string;
}
export declare function MenuSeparator({ className }: {
    className?: string;
}): React.JSX.Element;
export declare namespace MenuSeparator {
    var displayName: string;
}
export interface MenuSubProps {
    children: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}
export declare function MenuSub({ children, open, defaultOpen, onOpenChange, }: MenuSubProps): React.JSX.Element;
export declare namespace MenuSub {
    var displayName: string;
}
export interface MenuSubTriggerProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
    className?: string;
}
export declare function MenuSubTrigger({ children, icon, disabled, className, }: MenuSubTriggerProps): React.JSX.Element;
export declare namespace MenuSubTrigger {
    var displayName: string;
}
export declare function MenuSubContent({ children, className, }: {
    children: React.ReactNode;
    className?: string;
}): React.JSX.Element;
export declare namespace MenuSubContent {
    var displayName: string;
}
//# sourceMappingURL=Menu.d.ts.map