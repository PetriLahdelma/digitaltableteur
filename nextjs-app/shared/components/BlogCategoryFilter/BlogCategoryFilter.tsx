"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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
  /** Custom className */
  className?: string;
}

const sizeClasses = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
} as const;

/**
 * Single-select tag filter for the blog archive, rendered as a labelled
 * `role="group"` of `aria-pressed` toggle buttons (with an implicit "All").
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
  className,
}: BlogCategoryFilterProps) {
  const { t } = useTranslation();

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

  const renderPills = () => (
    <div
      role="group"
      aria-label={t("blogFilterByTag", "Filter by topic")}
      className={cn(
        "flex flex-wrap gap-2",
        "overflow-x-auto scrollbar-hide",
        "-mx-4 px-4 tablet:mx-0 tablet:px-0",
        className
      )}
    >
      {options.map((option) => {
        const isActive =
          option.value === selectedTag ||
          (option.value === null && selectedTag === null);

        return (
          <button
            key={option.value ?? "all"}
            aria-pressed={isActive}
            onClick={() => onTagChange(option.value)}
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
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  "ml-1.5",
                  isActive ? "text-background" : "text-muted-foreground"
                )}
              >
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderUnderline = () => (
    <div
      role="group"
      aria-label={t("blogFilterByTag", "Filter by topic")}
      className={cn(
        "flex gap-6 border-b border-border",
        "overflow-x-auto scrollbar-hide",
        "-mx-4 px-4 tablet:mx-0 tablet:px-0",
        className
      )}
    >
      {options.map((option) => {
        const isActive =
          option.value === selectedTag ||
          (option.value === null && selectedTag === null);

        return (
          <button
            key={option.value ?? "all"}
            aria-pressed={isActive}
            onClick={() => onTagChange(option.value)}
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
            {option.label}
            {option.count !== undefined && (
              <span className="ml-1.5 text-muted-foreground">
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderMinimal = () => (
    <div
      role="group"
      aria-label={t("blogFilterByTag", "Filter by topic")}
      className={cn(
        "flex flex-wrap gap-4",
        "overflow-x-auto scrollbar-hide",
        "-mx-4 px-4 tablet:mx-0 tablet:px-0",
        className
      )}
    >
      {options.map((option) => {
        const isActive =
          option.value === selectedTag ||
          (option.value === null && selectedTag === null);

        return (
          <button
            key={option.value ?? "all"}
            aria-pressed={isActive}
            onClick={() => onTagChange(option.value)}
            className={cn(
              "font-body whitespace-nowrap transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded",
              sizeClasses[size],
              isActive
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span className="ml-1.5 text-muted-foreground">
                ({option.count})
              </span>
            )}
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

BlogCategoryFilter.displayName = "BlogCategoryFilter";
