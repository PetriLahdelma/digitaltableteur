"use client";

import { cn } from "@/lib/utils";

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

const sizeClasses = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
} as const;

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  className,
  size = "md",
  variant = "pills",
}: CategoryFilterProps) {
  const renderPills = () => (
    <div
      role="group"
      aria-label="Filter projects by category"
      className={cn(
        "flex flex-wrap gap-2",
        "overflow-x-auto overflow-y-visible scrollbar-hide",
        "-mx-4 px-4 py-1 tablet:mx-0 tablet:px-0", // py-1 prevents focus ring clipping
        className
      )}
    >
      {categories.map((category) => {
        const isActive = category.value === activeCategory;

        return (
          <button
            key={category.value}
            aria-pressed={isActive}
            onClick={() => onCategoryChange(category.value)}
            className={cn(
              "font-body whitespace-nowrap rounded-full",
              "border transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              sizeClasses[size],
              isActive
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
            )}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );

  const renderUnderline = () => (
    <div
      role="group"
      aria-label="Filter projects by category"
      className={cn(
        "flex gap-6 border-b border-border",
        "overflow-x-auto scrollbar-hide",
        "-mx-4 px-4 tablet:mx-0 tablet:px-0",
        className
      )}
    >
      {categories.map((category) => {
        const isActive = category.value === activeCategory;

        return (
          <button
            key={category.value}
            aria-pressed={isActive}
            onClick={() => onCategoryChange(category.value)}
            className={cn(
              "font-body whitespace-nowrap pb-3",
              "border-b-2 -mb-px transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              sizeClasses[size],
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );

  const renderMinimal = () => (
    <div
      role="group"
      aria-label="Filter projects by category"
      className={cn(
        "flex flex-wrap gap-4",
        "overflow-x-auto overflow-y-visible scrollbar-hide",
        "-mx-4 px-4 py-1 tablet:mx-0 tablet:px-0",
        className
      )}
    >
      {categories.map((category) => {
        const isActive = category.value === activeCategory;

        return (
          <button
            key={category.value}
            aria-pressed={isActive}
            onClick={() => onCategoryChange(category.value)}
            className={cn(
              "font-body whitespace-nowrap transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
              sizeClasses[size],
              isActive
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );

  switch (variant) {
    case "underline":
      return renderUnderline();
    case "minimal":
      return renderMinimal();
    default:
      return renderPills();
  }
}

CategoryFilter.displayName = "CategoryFilter";
