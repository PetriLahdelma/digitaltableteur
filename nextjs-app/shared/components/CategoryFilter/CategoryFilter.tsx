"use client";

import { cn } from "../../lib/cn";
import { FilterChip } from "../FilterChip";

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
}: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter projects by category"
      className={cn(groupClassMap[variant], className)}
    >
      {categories.map((category) => (
        <FilterChip
          key={category.value}
          pressed={category.value === activeCategory}
          onClick={() => onCategoryChange(category.value)}
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
