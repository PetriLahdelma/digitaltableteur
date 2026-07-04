"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as React from "react";
import Icon from "@dt/Icon";
import styles from "./Menu.module.css";

const cx = (...classes: Array<string | false | undefined>): string =>
  classes.filter(Boolean).join(" ");

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

export function Menu({
  children,
  open,
  defaultOpen,
  onOpenChange,
  modal = false,
}: MenuRootProps) {
  return (
    <DropdownMenu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {children}
    </DropdownMenu.Root>
  );
}
Menu.displayName = "Menu";

export interface MenuTriggerProps {
  children: React.ReactNode;
  /** Merge the trigger props onto your own control instead of a nested button. */
  asChild?: boolean;
  className?: string;
}

export function MenuTrigger({ children, asChild, className }: MenuTriggerProps) {
  return (
    <DropdownMenu.Trigger asChild={asChild} className={className}>
      {children}
    </DropdownMenu.Trigger>
  );
}
MenuTrigger.displayName = "MenuTrigger";

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

export function MenuContent({
  children,
  className,
  side = "bottom",
  align = "start",
  sideOffset = 6,
}: MenuProps) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        className={cx(styles.content, className)}
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={12}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}
MenuContent.displayName = "MenuContent";

interface ItemBodyProps {
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

/** Shared item layout: fixed leading-icon gutter, flexible label, muted trailing. */
function ItemBody({ icon, trailing, children }: ItemBodyProps) {
  return (
    <>
      {icon != null ? (
        <span className={styles.itemIcon} aria-hidden="true" data-slot="icon">
          {icon}
        </span>
      ) : null}
      <span className={styles.itemLabel}>{children}</span>
      {trailing != null ? (
        <span className={styles.itemTrailing} aria-hidden="true">
          {trailing}
        </span>
      ) : null}
    </>
  );
}

export interface MenuItemProps {
  children: React.ReactNode;
  /** Leading icon node; rendered in a fixed gutter so labels align in a column. */
  icon?: React.ReactNode;
  /** Trailing content such as a shortcut hint; muted and right-aligned. */
  trailing?: React.ReactNode;
  disabled?: boolean;
  /** Selection handler, sync or async. The menu closes after select. */
  onSelect?: () => void | Promise<void>;
  /** Render the item as a link (`<a href>`); use for navigation items. */
  href?: string;
  className?: string;
}

export function MenuItem({
  children,
  icon,
  trailing,
  disabled,
  onSelect,
  href,
  className,
}: MenuItemProps) {
  const body = (
    <ItemBody icon={icon} trailing={trailing}>
      {children}
    </ItemBody>
  );

  if (href) {
    return (
      <DropdownMenu.Item
        asChild
        disabled={disabled}
        className={cx(styles.item, className)}
      >
        <a href={href}>{body}</a>
      </DropdownMenu.Item>
    );
  }

  const handleSelect = () => {
    try {
      const result = onSelect?.();
      if (result && typeof result.catch === "function") {
        result.catch((error: unknown) =>
          console.error("Menu item onSelect error:", error),
        );
      }
    } catch (error) {
      console.error("Menu item onSelect error:", error);
    }
  };

  return (
    <DropdownMenu.Item
      className={cx(styles.item, className)}
      disabled={disabled}
      onSelect={handleSelect}
    >
      {body}
    </DropdownMenu.Item>
  );
}
MenuItem.displayName = "MenuItem";

export function MenuSeparator({ className }: { className?: string }) {
  return (
    <DropdownMenu.Separator className={cx(styles.separator, className)} />
  );
}
MenuSeparator.displayName = "MenuSeparator";

export interface MenuSubProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MenuSub({
  children,
  open,
  defaultOpen,
  onOpenChange,
}: MenuSubProps) {
  return (
    <DropdownMenu.Sub
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </DropdownMenu.Sub>
  );
}
MenuSub.displayName = "MenuSub";

export interface MenuSubTriggerProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function MenuSubTrigger({
  children,
  icon,
  disabled,
  className,
}: MenuSubTriggerProps) {
  return (
    <DropdownMenu.SubTrigger
      className={cx(styles.item, styles.subTrigger, className)}
      disabled={disabled}
    >
      <ItemBody
        icon={icon}
        trailing={<Icon name="caret-right" ariaLabel="" size="sm" />}
      >
        {children}
      </ItemBody>
    </DropdownMenu.SubTrigger>
  );
}
MenuSubTrigger.displayName = "MenuSubTrigger";

export function MenuSubContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.SubContent
        className={cx(styles.content, styles.subContent, className)}
      >
        {children}
      </DropdownMenu.SubContent>
    </DropdownMenu.Portal>
  );
}
MenuSubContent.displayName = "MenuSubContent";
