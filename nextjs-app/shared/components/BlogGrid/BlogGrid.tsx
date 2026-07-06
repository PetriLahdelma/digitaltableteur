"use client";

import { useTranslation } from "react-i18next";
import {
  EnhancedArticleCard,
  type EnhancedArticleCardProps,
} from "../EnhancedArticleCard";
import { FadeIn } from "../animations/FadeIn";
import { cn } from "@/lib/utils";

export interface BlogGridProps {
  /** Array of articles to display */
  articles: EnhancedArticleCardProps[];
  /** Slug of article to feature (displayed larger, first position) */
  featuredSlug?: string;
  /** Grid layout variant */
  layout?: "standard" | "featured-first" | "masonry";
  /** Custom column configuration */
  columns?: {
    sm?: 1 | 2;
    md?: 1 | 2 | 3;
    lg?: 1 | 2 | 3 | 4;
  };
  /** Hide images in article cards */
  hideImages?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Responsive grid of blog articles, one EnhancedArticleCard per item. Supports
 * a standard grid, a featured-first layout that promotes one article to a
 * full-width card, and a friendly empty state. Cards fade in on mount via
 * FadeIn.
 */
export function BlogGrid({
  articles,
  featuredSlug,
  layout = "standard",
  columns = { sm: 1, md: 2, lg: 3 },
  hideImages = false,
  className,
}: BlogGridProps) {
  const { t } = useTranslation();

  // Empty state
  if (!articles || articles.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center",
          "py-16 px-4 text-center",
          "border border-dashed border-border rounded-lg",
          className
        )}
      >
        <svg
          className="w-12 h-12 text-muted-foreground/50 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        <p className="font-body text-muted-foreground">
          {t("blogNoPostsFound", "No articles found")}
        </p>
      </div>
    );
  }

  // Determine if we should show a featured article
  const showFeatured = layout === "featured-first" && articles.length > 0;
  const featuredArticle = showFeatured
    ? articles.find((a) => a.slug === featuredSlug) || articles[0]
    : null;
  const remainingArticles = showFeatured
    ? articles.filter((a) => a.slug !== featuredArticle?.slug)
    : articles;

  // Column class mapping
  const columnClasses = {
    sm: {
      1: "grid-cols-1",
      2: "grid-cols-2",
    },
    md: {
      1: "tablet:grid-cols-1",
      2: "tablet:grid-cols-2",
      3: "tablet:grid-cols-3",
    },
    lg: {
      1: "desktop:grid-cols-1",
      2: "desktop:grid-cols-2",
      3: "desktop:grid-cols-3",
      4: "desktop:grid-cols-4",
    },
  };

  const gridClasses = cn(
    "grid gap-6",
    columnClasses.sm[columns.sm || 1],
    columnClasses.md[columns.md || 2],
    columnClasses.lg[columns.lg || 3]
  );

  return (
    <div className={cn("space-y-8", className)}>
      {/* Featured article */}
      {showFeatured && featuredArticle && (
        <FadeIn direction="up" delay={0} distance={30}>
          <EnhancedArticleCard {...featuredArticle} variant="featured" hideImage={hideImages} />
        </FadeIn>
      )}

      {/* Article grid */}
      <div className={gridClasses}>
        {remainingArticles.map((article, index) => (
          <FadeIn
            key={article.slug}
            direction="up"
            delay={showFeatured ? 0.1 + index * 0.05 : index * 0.05}
            distance={30}
          >
            <EnhancedArticleCard {...article} variant="default" hideImage={hideImages} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

BlogGrid.displayName = "BlogGrid";
