"use client";

import { useRef, useState, useEffect } from "react";
import { Link } from "../../lib/linkComponent";
import { Image } from "../../lib/imageComponent";
import { cn } from "../../lib/cn";
import styles from "./EnhancedProjectCard.module.css";

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
  square: styles.square,
  video: styles.video,
  portrait: styles.portrait,
  landscape: styles.landscape,
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
    Boolean(videoThumbnail) ||
    thumbnail.endsWith(".mov") ||
    thumbnail.endsWith(".mp4") ||
    thumbnail.endsWith(".webm");
  const videoSrc = videoThumbnail || (isVideoThumbnail ? thumbnail : undefined);

  // Generate unique ID for aria relationships
  const descriptionId = `${slug}-desc`;

  return (
    <Link
      href={`/work/${slug}`}
      className={cn(styles.card, className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-describedby={description ? descriptionId : undefined}
      data-enhanced-project-card=""
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
          styles.media,
          aspectRatioClasses[aspectRatio],
        )}
        data-project-card-media=""
      >
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
            className={styles.asset}
            data-project-card-asset=""
          />
        ) : (
          /* Static image thumbnail */
          <Image
            src={thumbnail}
            alt="" // Decorative - full description in sr-only span
            fill
            className={styles.asset}
            data-project-card-asset=""
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
      </div>

      {/* Caption Area - External, below image */}
      <div className={styles.caption}>
        {/* Category label */}
        {showCategory && category && (
          <span className={styles.category}>
            {category}
          </span>
        )}

        {/* Title */}
        <h3 className={styles.title}>
          {title}
        </h3>

        {/* Description - visible on hover for desktop, always for mobile */}
        {showDescription && description && (
          <p className={styles.description}>
            {description}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className={styles.tags} data-project-card-tags="">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
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
