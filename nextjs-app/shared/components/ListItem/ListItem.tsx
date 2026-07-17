"use client";

import React from "react";
import Icon from "@dt/Icon";
import styles from "./ListItem.module.css";

const cx = (...classes: Array<string | false | undefined>): string =>
  classes.filter(Boolean).join(" ");

export interface ListItemProps {
  /** Primary label. Truncates with an ellipsis; never wraps. */
  children: React.ReactNode;
  /** Leading icon node; rendered in a fixed gutter so labels column-align. */
  icon?: React.ReactNode;
  /** End-aligned secondary content: muted small text, Badge, Kbd, StatusDot, or a value. Exposed to AT. */
  meta?: React.ReactNode;
  /** Trailing icon after meta (chevron, external-link). Decorative. */
  trailingIcon?: React.ReactNode;
  /** Renders the check indicator in the trailing position. Visual only; semantic selection belongs to the consumer. */
  selected?: boolean;
  /** Destructive rows (deletions) use the error color treatment. */
  tone?: "neutral" | "destructive";
  /** Visual disabled treatment via the canonical disabled tokens. The consumer carries aria-disabled. */
  disabled?: boolean;
  /** Parent-driven active row (combobox/palette). Radix menus work without it via [data-highlighted]. */
  highlighted?: boolean;
  className?: string;
}

/**
 * Presentational row for menus, selects, palettes, and lists. Renders visuals
 * only; the interactive wrapper (Radix Item, button, li, option) owns role,
 * focus, and events.
 */
export const ListItem: React.FC<ListItemProps> = ({
  children,
  icon,
  meta,
  trailingIcon,
  selected = false,
  tone = "neutral",
  disabled = false,
  highlighted = false,
  className,
}) => (
  <span
    className={cx(
      styles.root,
      tone === "destructive" && styles.destructive,
      highlighted && styles.highlighted,
      disabled && styles.disabled,
      className,
    )}
    data-tone={tone}
  >
    {icon != null ? (
      <span className={styles.icon} aria-hidden="true" data-slot="icon">
        {icon}
      </span>
    ) : null}
    <span className={styles.label}>{children}</span>
    {meta != null ? (
      <span className={styles.meta} data-slot="meta">
        {meta}
      </span>
    ) : null}
    {trailingIcon != null ? (
      <span className={styles.trailingIcon} aria-hidden="true" data-slot="trailing-icon">
        {trailingIcon}
      </span>
    ) : null}
    {selected ? (
      <span className={styles.trailingIcon} aria-hidden="true" data-slot="check">
        <Icon name="check" ariaLabel="" />
      </span>
    ) : null}
  </span>
);

export default ListItem;
