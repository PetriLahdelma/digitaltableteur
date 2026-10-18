"use client";

// One Phosphor glyph imported directly, like ProjectList: Icon would pull its
// whole registry in.
import { CaretDown } from "@phosphor-icons/react";
import { useTranslate } from "../../lib/translation";
import { cn } from "../../lib/cn";
import { FilterChip } from "../FilterChip";
import { useFilterDisclosure } from "../../hooks/useFilterDisclosure";
import styles from "../../styles/filter-disclosure.module.css";

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
  const disclosure = useFilterDisclosure(collapsible);
  const select = (value: string | null) =>
    disclosure.select(() => onTagChange(value));

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
  const visible = disclosure.collapsed
    ? options.filter((option) => isPressed(option.value))
    : options;

  return (
    <div
      ref={disclosure.groupRef}
      id={disclosure.groupId}
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
          {...disclosure.toggleProps}
          className={cn(styles.toggle, styles[size])}
          aria-label={t("blogFilterAllTopics", "All topics")}
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
