"use client";

import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
// One Phosphor glyph imported directly, like ProjectList: Icon would pull its
// whole registry in.
import { CaretDown } from "@phosphor-icons/react";
import { useTranslate } from "../../lib/translation";
import { cn } from "../../lib/cn";
import { FilterChip } from "../FilterChip";
import styles from "./BlogCategoryFilter.module.css";

export interface BlogCategoryFilterProps {
  /** Array of unique tags */
  tags: string[];
  /** Currently selected tag (null means "All") */
  selectedTag: string | null;
  /** Callback when tag selection changes */
  onTagChange: (tag: string | null) => void;
  /** Show post counts per tag */
  showCounts?: boolean;
  /** Tag counts object */
  tagCounts?: Record<string, number>;
  /** Style variant */
  variant?: "pills" | "underline" | "minimal";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /**
   * Collapse to the selected chip and a disclosure button; expanding shows
   * every chip (accordion-style height change), and picking one collapses
   * back to it.
   */
  collapsible?: boolean;
  /** Custom className */
  className?: string;
}

/** BlogCategoryFilter variant names predate FilterChip's; map plural → singular. */
const chipVariantMap = {
  pills: "pill",
  underline: "underline",
  minimal: "minimal",
} as const;

const groupClassMap = {
  pills: cn(
    "flex flex-wrap gap-2",
    "overflow-x-auto scrollbar-hide",
    "-mx-4 px-4 tablet:mx-0 tablet:px-0",
  ),
  underline: cn(
    "flex gap-6 border-b border-border",
    "overflow-x-auto scrollbar-hide",
    "-mx-4 px-4 tablet:mx-0 tablet:px-0",
  ),
  minimal: cn(
    "flex flex-wrap gap-4",
    "overflow-x-auto scrollbar-hide",
    "-mx-4 px-4 tablet:mx-0 tablet:px-0",
  ),
} as const;

/**
 * Single-select tag filter for the blog archive, rendered as a labelled
 * `role="group"` of FilterChip toggle buttons (with an implicit "All").
 * A filter is a UI control, not a set of tab panels, so it is a group of
 * toggle buttons rather than a tablist. Controlled via `selectedTag` /
 * `onTagChange`; ships pills, underline and minimal treatments and optional
 * per-tag counts.
 */
export function BlogCategoryFilter({
  tags,
  selectedTag,
  onTagChange,
  showCounts = false,
  tagCounts = {},
  variant = "pills",
  size = "md",
  collapsible = false,
  className,
}: BlogCategoryFilterProps) {
  const t = useTranslate();
  const groupId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const collapsed = collapsible && !expanded;

  /** Apply a state change and animate the group's height from old to new. */
  const withHeightTransition = (update: () => void) => {
    const el = groupRef.current;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduced || typeof el.animate !== "function") {
      update();
      return;
    }
    const from = el.offsetHeight;
    flushSync(update);
    const to = el.offsetHeight;
    if (from === to) return;
    // Clip only while the height moves, so focus rings are never cut off.
    el.style.overflow = "hidden";
    const animation = el.animate(
      [{ blockSize: `${from}px` }, { blockSize: `${to}px` }],
      { duration: 240, easing: "cubic-bezier(0.2, 0, 0, 1)" },
    );
    const release = () => {
      el.style.overflow = "";
    };
    animation.onfinish = release;
    animation.oncancel = release;
  };

  const select = (value: string | null) => {
    if (collapsible && expanded) {
      withHeightTransition(() => {
        onTagChange(value);
        setExpanded(false);
      });
      return;
    }
    onTagChange(value);
  };

  // Add "All" option at the beginning
  const allOption = {
    value: null as string | null,
    label: t("blogAllPosts", "All Posts"),
    count: showCounts
      ? Object.values(tagCounts).reduce((sum, c) => sum + c, 0)
      : undefined,
  };

  const tagOptions = tags.map((tag) => ({
    value: tag,
    label: tag,
    count: showCounts ? tagCounts[tag] : undefined,
  }));

  const options = [allOption, ...tagOptions];

  const isPressed = (value: string | null) =>
    value === selectedTag || (value === null && selectedTag === null);
  const visible = collapsed
    ? options.filter((option) => isPressed(option.value))
    : options;

  return (
    <div
      ref={groupRef}
      id={groupId}
      role="group"
      aria-label={t("blogFilterByTag", "Filter by topic")}
      className={cn(
        groupClassMap[variant],
        collapsible && styles.collapsible,
        className,
      )}
    >
      {collapsible && (
        // Always the first child: it stays in the same place open or
        // closed, comes before the options it controls in the focus order,
        // and expanding inserts chips after it without moving focus.
        <button
          type="button"
          className={cn(styles.toggle, styles[size])}
          aria-expanded={expanded}
          aria-controls={groupId}
          aria-label={t("blogFilterAllTopics", "All topics")}
          onClick={() => withHeightTransition(() => setExpanded((v) => !v))}
        >
          <CaretDown className={styles.caret} aria-hidden="true" />
        </button>
      )}
      {visible.map((option) => (
        <FilterChip
          key={option.value ?? "all"}
          pressed={isPressed(option.value)}
          onClick={() => select(option.value)}
          variant={chipVariantMap[variant]}
          size={size}
          count={option.count}
        >
          {option.label}
        </FilterChip>
      ))}
    </div>
  );
}

BlogCategoryFilter.displayName = "BlogCategoryFilter";
