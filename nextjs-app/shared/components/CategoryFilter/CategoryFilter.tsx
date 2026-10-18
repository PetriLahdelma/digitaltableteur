"use client";

// One Phosphor glyph imported directly: Icon would pull its whole registry in.
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "../../lib/cn";
import { useTranslate } from "../../lib/translation";
import { useFilterDisclosure } from "../../hooks/useFilterDisclosure";
import { FilterChip } from "../FilterChip";
import styles from "../../styles/filter-disclosure.module.css";

export interface CategoryOption {
  /** Category value */
  value: string;
  /** Display label */
  label: string;
}

export interface CategoryFilterProps {
  /** Array of category options */
  categories: CategoryOption[];
  /** Currently active category value */
  activeCategory: string;
  /** Callback when category changes */
  onCategoryChange: (category: string) => void;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Style variant */
  variant?: "pills" | "underline" | "minimal";
  /**
   * Collapse to the active chip and a disclosure button; expanding shows
   * every chip (accordion-style height change), and picking one collapses
   * back to it.
   */
  collapsible?: boolean;
  /** Accessible name of the disclosure button; defaults to the translated "All categories". */
  disclosureLabel?: string;
}

/** CategoryFilter variant names predate FilterChip's; map plural → singular. */
const chipVariantMap = {
  pills: "pill",
  underline: "underline",
  minimal: "minimal",
} as const;

const groupClassMap = {
  pills: cn(
    "flex flex-wrap gap-2",
    "overflow-x-auto overflow-y-visible scrollbar-hide",
    "-mx-4 px-4 py-1 tablet:mx-0 tablet:px-0", // py-1 prevents focus ring clipping
  ),
  underline: cn(
    "flex gap-6 border-b border-border",
    "overflow-x-auto scrollbar-hide",
    "-mx-4 px-4 tablet:mx-0 tablet:px-0",
  ),
  minimal: cn(
    "flex flex-wrap gap-4",
    "overflow-x-auto overflow-y-visible scrollbar-hide",
    "-mx-4 px-4 py-1 tablet:mx-0 tablet:px-0",
  ),
} as const;

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  className,
  size = "md",
  variant = "pills",
  collapsible = false,
  disclosureLabel,
}: CategoryFilterProps) {
  const t = useTranslate();
  const disclosure = useFilterDisclosure(collapsible);
  const visible = disclosure.collapsed
    ? categories.filter((category) => category.value === activeCategory)
    : categories;

  return (
    <div
      ref={disclosure.groupRef}
      id={disclosure.groupId}
      role="group"
      aria-label="Filter projects by category"
      className={cn(
        groupClassMap[variant],
        collapsible && styles.collapsible,
        className,
      )}
    >
      {collapsible && (
        // Always the first child: it keeps its place open or closed and
        // chips insert after it without moving focus.
        <button
          {...disclosure.toggleProps}
          className={cn(styles.toggle, styles[size])}
          aria-label={
            disclosureLabel ?? t("categoryFilterAll", "All categories")
          }
        >
          <CaretDown className={styles.caret} aria-hidden="true" />
        </button>
      )}
      {visible.map((category) => (
        <FilterChip
          key={category.value}
          pressed={category.value === activeCategory}
          onClick={() =>
            disclosure.select(() => onCategoryChange(category.value))
          }
          variant={chipVariantMap[variant]}
          size={size}
        >
          {category.label}
        </FilterChip>
      ))}
    </div>
  );
}

CategoryFilter.displayName = "CategoryFilter";
