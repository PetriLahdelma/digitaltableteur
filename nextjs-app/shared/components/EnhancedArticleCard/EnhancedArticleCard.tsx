"use client";

import { useState } from "react";
import { Link } from "../../lib/linkComponent";
import { Image } from "../../lib/imageComponent";
import { useLocalization } from "../../lib/translation";
import { cn } from "../../lib/cn";
import { BlogMediaImage } from "@dt/BlogMediaImage";
import { isSvgSrc } from "../../lib/imageSrc";
import styles from "./EnhancedArticleCard.module.css";

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
  /** Show author avatar and name in the footer meta row */
  showAuthor?: boolean;
  /** Show “Read article” affordance in the footer */
  showReadMore?: boolean;
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
  showAuthor = true,
  showReadMore = true,
  className,
}: EnhancedArticleCardProps) {
  const { translate: t, language } = useLocalization();
  const [imageLoaded, setImageLoaded] = useState(false);

  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const showImage = image && !hideImage;

  const formattedDate = publishedAt
    ? formatDate(publishedAt, language)
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
        data-donny-interest="blog-article"
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
      aria-label={`${t("blogReadMore", "Read article")}: ${title}`}
      className={cn(
        styles.cardLink,
        "group flex h-full min-h-0 w-full flex-col rounded-lg overflow-hidden",
        hideImage && !isFeatured && "min-h-[12rem]",
        "border border-border bg-card",
        isFeatured && "tablet:flex-row tablet:col-span-2",
        className,
      )}
      data-donny-interest="blog-article"
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

          <BlogMediaImage
            src={image.src}
            alt={image.alt}
            fill
            fit={isSvgSrc(image.src) ? "contain" : "cover"}
            className={cn(
              "transition-transform duration-500",
              "group-hover:scale-105",
              !imageLoaded && "opacity-0",
              isSvgSrc(image.src) && "bg-[#0a0c10]",
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

        {/* Meta row (+ optional read link) */}
        {(showAuthor || formattedDate || readTime || showReadMore) && (
          <div
            className={cn(
              "mt-auto flex items-center gap-4 border-t border-border/50 pt-4",
              showReadMore ? "justify-between" : "justify-start",
            )}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {showAuthor && author && (
                <>
                  <div className="relative size-7 shrink-0 overflow-hidden rounded-full bg-muted">
                    <Image
                      src={authorAvatar}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="28px"
                    />
                  </div>
                  <span className="text-sm font-body text-foreground">
                    {author.name}
                  </span>
                </>
              )}
              {showAuthor && author && formattedDate && (
                <span aria-hidden="true">·</span>
              )}
              {formattedDate && <time dateTime={publishedAt}>{formattedDate}</time>}
              {formattedDate && readTime && <span aria-hidden="true">·</span>}
              {readTime && <span>{readTime}</span>}
            </div>

            {showReadMore && (
              <span
                className={cn(
                  styles.readMore,
                  "inline-flex shrink-0 items-center gap-1 text-sm font-body font-medium text-primary",
                )}
              >
                {t("blogReadMore", "Read article")}
                <svg
                  className="size-4"
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
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

EnhancedArticleCard.displayName = "EnhancedArticleCard";
