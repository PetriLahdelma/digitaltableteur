"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export interface EnhancedArticleCardProps {
  /** Article slug for URL */
  slug: string;
  /** Article title */
  title: string;
  /** Article excerpt/lead text */
  excerpt?: string;
  /** Featured image */
  image?: {
    src: string;
    alt: string;
  };
  /** Author information */
  author?: {
    name: string;
    slug?: string;
    imageUrl?: string;
  };
  /** Publication date (ISO string) */
  publishedAt?: string;
  /** Read time (e.g., "5 min read") */
  readTime?: string;
  /** Article tags */
  tags?: string[];
  /** Card variant */
  variant?: "default" | "featured" | "compact";
  /** Hide featured image */
  hideImage?: boolean;
  /** Custom className */
  className?: string;
}

const formatDate = (iso: string, locale?: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const resolvedLocale =
    locale || (typeof navigator !== "undefined" ? navigator.language : "en");
  return new Intl.DateTimeFormat(resolvedLocale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export function EnhancedArticleCard({
  slug,
  title,
  excerpt,
  image,
  author,
  publishedAt,
  readTime,
  tags,
  variant = "default",
  hideImage = false,
  className,
}: EnhancedArticleCardProps) {
  const { i18n, t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);

  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const showImage = image && !hideImage;

  const formattedDate = publishedAt
    ? formatDate(publishedAt, i18n.language)
    : "";

  // Default avatar fallback
  const authorAvatar = author?.imageUrl || "/images/default-avatar.png";

  if (isCompact) {
    return (
      <Link
        href={`/blog/${slug}`}
        className={cn(
          "group flex gap-4 p-4 rounded-lg",
          "bg-card hover:bg-accent/50",
          "border border-border hover:border-foreground/20",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
      >
        {/* Compact image */}
        {showImage && (
          <div className="relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}

        {/* Compact content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-display font-semibold text-sm text-foreground",
              "line-clamp-2 mb-1",
              "group-hover:text-primary transition-colors"
            )}
          >
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {formattedDate}
            {readTime && ` · ${readTime}`}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${slug}`}
      className={cn(
        "group flex flex-col rounded-lg overflow-hidden",
        "bg-card hover:bg-accent/30",
        "border border-border hover:border-foreground/20",
        "transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isFeatured && "tablet:flex-row tablet:col-span-2",
        className
      )}
    >
      {/* Image container */}
      {showImage && (
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            isFeatured
              ? "aspect-video tablet:aspect-auto tablet:w-1/2"
              : "aspect-video"
          )}
        >
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          <Image
            src={image.src}
            alt={image.alt}
            fill
            className={cn(
              "object-cover",
              "transition-transform duration-500",
              "group-hover:scale-105",
              !imageLoaded && "opacity-0"
            )}
            sizes={
              isFeatured
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            onLoad={() => setImageLoaded(true)}
          />

          {/* Category/Tag badge on image */}
          {tags && tags.length > 0 && (
            <div className="absolute top-3 left-3">
              <span
                className={cn(
                  "inline-block px-2.5 py-1",
                  "text-xs font-body uppercase tracking-wider",
                  "bg-background/90 backdrop-blur-sm rounded-full",
                  "text-foreground"
                )}
              >
                {tags[0]}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "flex flex-col flex-1 p-5",
          isFeatured && "tablet:p-8 tablet:justify-center"
        )}
      >
        {/* Tags (if no image) */}
        {!showImage && tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs font-body text-muted-foreground bg-muted px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3
          className={cn(
            "font-display font-semibold text-foreground",
            "line-clamp-2 mb-2",
            "group-hover:text-primary transition-colors",
            isFeatured
              ? "text-xl tablet:text-2xl"
              : "text-lg"
          )}
        >
          {title}
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p
            className={cn(
              "font-body text-muted-foreground",
              "line-clamp-2 mb-4",
              isFeatured ? "text-base" : "text-sm"
            )}
          >
            {excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          {/* Author */}
          {author && (
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-muted">
                <Image
                  src={authorAvatar}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              </div>
              <span className="text-sm font-body text-foreground">
                {author.name}
              </span>
            </div>
          )}

          {/* Date and read time */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && readTime && <span>·</span>}
            {readTime && <span>{readTime}</span>}
          </div>
        </div>

        {/* Read more indicator */}
        <div className="mt-4">
          <span
            className={cn(
              "text-sm font-body font-medium",
              "text-primary",
              "inline-flex items-center gap-1",
              "opacity-0 group-hover:opacity-100",
              "translate-y-2 group-hover:translate-y-0",
              "transition-all duration-200"
            )}
          >
            {t("blogReadMore", "Read article")}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

EnhancedArticleCard.displayName = "EnhancedArticleCard";
