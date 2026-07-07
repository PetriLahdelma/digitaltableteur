"use client";

import React from "react";
import styles from "./Accordion.module.css";
import Icon from "@dt/Icon";

export type AccordionItem = {
  id: string;
  title: string;
  content: React.ReactNode;
  /** Render the section trigger as non-interactive. */
  disabled?: boolean;
};

export type AccordionProps = {
  /** Accordion sections (id, title, content, optional disabled). */
  items: AccordionItem[];
  /**
   * "single" (default) keeps at most one section open — opening another closes
   * the previous. "multiple" lets any number stay open for side-by-side reading.
   * @default "single"
   */
  type?: "single" | "multiple";
  /**
   * "contained" (default) is a bordered card group with dividers between rows;
   * "enclosed" is the same outer border but seamless inside (no dividers);
   * "divided" is flush with hairline separators only, for inline disclosure.
   * @default "contained"
   */
  variant?: "contained" | "enclosed" | "divided";
  /** Initially open id (uncontrolled, single). */
  defaultOpenId?: string;
  /** Initially open ids (uncontrolled); wins over defaultOpenId when set. */
  defaultOpenIds?: string[];
  /** Controlled open ids. When set, the parent owns open state. */
  openIds?: string[];
  /** Called with the full set of open ids whenever it changes. */
  onOpenChange?: (openIds: string[]) => void;
  /** Optional utility classes on the container. */
  className?: string;
};

/** Expandable accordion sections with keyboard-operable triggers and a sliding reveal. */
const Accordion: React.FC<AccordionProps> = ({
  items,
  type = "single",
  variant = "contained",
  defaultOpenId,
  defaultOpenIds,
  openIds: controlledOpenIds,
  onOpenChange,
  className = "",
}) => {
  const isControlled = controlledOpenIds !== undefined;

  const [internalOpen, setInternalOpen] = React.useState<Set<string>>(() => {
    if (defaultOpenIds && defaultOpenIds.length > 0) {
      return new Set(
        type === "single" ? defaultOpenIds.slice(0, 1) : defaultOpenIds,
      );
    }
    if (defaultOpenId) return new Set([defaultOpenId]);
    return new Set<string>();
  });

  const openSet = isControlled ? new Set(controlledOpenIds) : internalOpen;

  const toggle = (id: string, disabled?: boolean) => {
    if (disabled) return;
    const next = new Set(openSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      // Single mode is exclusive: opening one closes the rest.
      if (type === "single") next.clear();
      next.add(id);
    }
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(Array.from(next));
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={[styles.accordion, styles[variant], className]
        .filter(Boolean)
        .join(" ")}
    >
      {items.map((item) => {
        const open = openSet.has(item.id);
        return (
          <div
            key={item.id}
            className={`${styles.item} ${open ? styles.open : ""}`.trim()}
          >
            <button
              type="button"
              id={`trigger-${item.id}`}
              className={styles.trigger}
              aria-expanded={open}
              aria-controls={`panel-${item.id}`}
              disabled={item.disabled}
              onClick={() => toggle(item.id, item.disabled)}
            >
              <span className={styles.title}>{item.title}</span>
              <span className={styles.icon} aria-hidden="true">
                <Icon name="caret-right" size={16} weight="bold" />
              </span>
            </button>
            {/* Panel stays mounted (so aria-controls always resolves) and its
                height animates via grid-template-rows. Closed panels are inert
                and hidden from assistive tech. */}
            <div className={styles.panel} data-open={open}>
              <div className={styles.panelInner}>
                <div
                  id={`panel-${item.id}`}
                  role="region"
                  aria-labelledby={`trigger-${item.id}`}
                  className={styles.content}
                  aria-hidden={!open || undefined}
                  inert={!open || undefined}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
