"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useScrollLock } from "../../hooks/useScrollLock";
import styles from "./CommandPalette.module.css";

export interface CommandPaletteItem {
  /** Stable id (also used for the option's DOM id). */
  id: string;
  /** Visible command label; also matched against the query. */
  label: string;
  /** Run when the command is chosen. */
  onSelect: () => void;
  /** Extra terms matched against the query. */
  keywords?: string[];
  /** Optional leading icon. */
  icon?: React.ReactNode;
}

export interface CommandPaletteProps {
  /** Whether the palette is open (controlled). */
  open: boolean;
  /** Called to request close (Escape, overlay click, or after a selection). */
  onClose: () => void;
  /** Commands to show, in order. */
  items: CommandPaletteItem[];
  /** Accessible name for the dialog + listbox. @default "Command palette" */
  label?: string;
  /** Search input placeholder. @default "Search commands…" */
  placeholder?: string;
  /** Shown when nothing matches. @default "No results" */
  emptyText?: string;
  /** Additional CSS class names for the dialog. */
  className?: string;
}

/**
 * Command palette: a modal, keyboard-driven launcher. A search input filters a
 * listbox of commands (matched on label + keywords); Arrow keys move the active
 * option, Enter runs it, Escape closes. Focus is trapped and background scroll
 * locked while open. User-facing strings are props (English defaults) so the
 * component carries no i18n dependency.
 */
export function CommandPalette({
  open,
  onClose,
  items,
  label = "Command palette",
  placeholder = "Search commands…",
  emptyText = "No results",
  className,
}: CommandPaletteProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useFocusTrap(dialogRef, open);
  useScrollLock(open);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.keywords ?? []).some((k) => k.toLowerCase().includes(q)),
    );
  }, [items, query]);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  if (!open || typeof document === "undefined") return null;

  const run = (item: CommandPaletteItem) => {
    item.onSelect();
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((a) => (filtered.length ? (a + 1) % filtered.length : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((a) =>
          filtered.length ? (a - 1 + filtered.length) % filtered.length : 0,
        );
        break;
      case "Enter": {
        event.preventDefault();
        const item = filtered[active];
        if (item) run(item);
        break;
      }
      case "Escape":
        event.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  };

  const listId = "command-palette-list";
  const optionId = (id: string) => `command-palette-option-${id}`;
  const activeItem = filtered[active];

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(styles.dialog, className)}
      >
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeItem ? optionId(activeItem.id) : undefined}
        />
        <ul id={listId} role="listbox" aria-label={label} className={styles.list}>
          {filtered.length ? (
            filtered.map((item, i) => (
              <li
                key={item.id}
                id={optionId(item.id)}
                role="option"
                aria-selected={i === active}
                className={cn(styles.option, i === active && styles.active)}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => run(item)}
              >
                {item.icon ? (
                  <span className={styles.icon} aria-hidden="true">
                    {item.icon}
                  </span>
                ) : null}
                <span className={styles.optionLabel}>{item.label}</span>
              </li>
            ))
          ) : (
            <li role="presentation" className={styles.empty}>
              {emptyText}
            </li>
          )}
        </ul>
      </div>
    </div>,
    document.body,
  );
}

export default CommandPalette;
