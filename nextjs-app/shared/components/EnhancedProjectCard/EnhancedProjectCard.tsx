"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "../../../../lib/utils";

export interface EnhancedProjectCardProps {
  /** Project title */
  title: string;
  /** URL slug for project detail page */
  slug: string;
  /** Thumbnail image URL */
  thumbnail: string;
  /** Video thumbnail URL (for hover autoplay) */
  videoThumbnail?: string;
  /** Short description */
  description?: string;
  /** Project category */
  category?: string;
  /** Project tags */
  tags?: string[];
  /** Image aspect ratio */
  aspectRatio?: "square" | "video" | "portrait" | "landscape";
  /** Show category in caption */
  showCategory?: boolean;
  /** Show description on hover */
  showDescription?: boolean;
  /** Autoplay video thumbnail continuously (not just on hover) */
  autoPlayVideo?: boolean;
  /** Custom className */
  className?: string;
}

const aspectRatioClasses: Record<
  NonNullable<EnhancedProjectCardProps["aspectRatio"]>,
  string
> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};

/**
 * EnhancedProjectCard component.
 */
export function EnhancedProjectCard({
  title,
  slug,
  thumbnail,
  videoThumbnail,
  description,
  category,
  tags,
  aspectRatio = "video",
  showCategory = true,
  showDescription = true,
  autoPlayVideo = false,
  className,
}: EnhancedProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleMouseEnter = () => {
    // Skip if autoplay is enabled (already playing)
    if (autoPlayVideo) return;
    // Respect reduced motion preference for video autoplay
    if (videoRef.current && !prefersReducedMotion) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked, ignore error
      });
    }
  };

  const handleMouseLeave = () => {
    // Skip if autoplay is enabled (should keep playing)
    if (autoPlayVideo) return;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const isVideoThumbnail =
    videoThumbnail ||
    thumbnail.endsWith(".mov") ||
    thumbnail.endsWith(".mp4") ||
    thumbnail.endsWith(".webm");
  const videoSrc = videoThumbnail || (isVideoThumbnail ? thumbnail : undefined);

  // Generate unique ID for aria relationships
  const descriptionId = `${slug}-desc`;

  return (
    <Link
      href={`/work/${slug}`}
      className={cn("group block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-describedby={description ? descriptionId : undefined}
      data-donny-interest="portfolio-project"
    >
      {/* Screen reader accessible description */}
      {description && (
        <span id={descriptionId} className="sr-only">
          {category && `Category: ${category}. `}
          {description}
          {tags?.length && `. Tags: ${tags.join(", ")}`}
        </span>
      )}

      {/* Media Container - Clean, no overlays */}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg",
          "transition-all duration-300 ease-out",
          // Subtle hover: lift with shadow
          "group-hover:shadow-lg group-hover:shadow-black/8",
          // Focus states for keyboard navigation
          "group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
          aspectRatioClasses[aspectRatio]
        )}
      >
        {/* Skeleton loading state */}
        {!imageLoaded && !isVideoThumbnail && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Video thumbnail */}
        {isVideoThumbnail && videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            autoPlay={autoPlayVideo && !prefersReducedMotion}
            aria-hidden="true"
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              "transition-transform duration-500 ease-out",
              "group-hover:scale-105"
            )}
          />
        ) : (
          /* Static image thumbnail */
          <Image
            src={thumbnail}
            alt="" // Decorative - full description in sr-only span
            fill
            className={cn(
              "object-cover",
              "transition-all duration-500 ease-out",
              "group-hover:scale-105",
              !imageLoaded && "opacity-0"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </div>

      {/* Caption Area - External, below image */}
      <div className="mt-4 space-y-1">
        {/* Category label */}
        {showCategory && category && (
          <span
            className={cn(
              "block text-[11px] font-body uppercase tracking-wider",
              "text-muted-foreground"
            )}
          >
            {category}
          </span>
        )}

        {/* Title */}
        <h3
          className={cn(
            "font-display font-semibold text-foreground",
            "text-base tablet:text-lg",
            "leading-tight"
          )}
        >
          {title}
        </h3>

        {/* Description - visible on hover for desktop, always for mobile */}
        {showDescription && description && (
          <p
            className={cn(
              "font-body text-sm text-muted-foreground",
              "line-clamp-2",
              "leading-relaxed",
              // Subtle reveal on hover
              "opacity-70 group-hover:opacity-100",
              "transition-opacity duration-300"
            )}
          >
            {description}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-1.5 pt-2",
              // Fade in on hover
              "opacity-0 group-hover:opacity-100",
              "group-focus-visible:opacity-100",
              "transition-opacity duration-300"
            )}
          >
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={cn(
                  "text-xs font-body",
                  "text-foreground/80",
                  "bg-foreground/8 px-2.5 py-1 rounded-full"
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

EnhancedProjectCard.displayName = "EnhancedProjectCard";
