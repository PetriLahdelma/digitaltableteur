"use client";

import { useId } from "react";
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
  /** Video thumbnail URL. The preview stays paused until the project is opened. */
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
  /** @deprecated Card previews no longer autoplay. Retained for API compatibility. */
  autoPlayVideo?: boolean;
  /** Render as a non-interactive teaser with a "coming soon" badge over the media */
  comingSoon?: boolean;
  /** Visible badge label for the coming-soon overlay (pass a translated string) */
  comingSoonLabel?: string;
  /** BCP 47 language tag for project-authored title and metadata */
  contentLanguage?: string;
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
  comingSoon = false,
  comingSoonLabel = "Coming soon",
  contentLanguage,
  className,
}: EnhancedProjectCardProps) {
  const rawId = useId();

  const isVideoThumbnail =
    Boolean(videoThumbnail) ||
    thumbnail.endsWith(".mov") ||
    thumbnail.endsWith(".mp4") ||
    thumbnail.endsWith(".webm");
  const videoSrc = videoThumbnail || (isVideoThumbnail ? thumbnail : undefined);

  const idBase = `${slug}-${rawId.replace(/:/g, "")}`;
  const titleId = `${idBase}-title`;
  const descriptionId = `${idBase}-description`;

  const content = (
    <>
      {/* Media Container - Clean, no overlays (coming-soon badge excepted) */}
      <div
        className={cn(styles.media, aspectRatioClasses[aspectRatio])}
        data-project-card-media=""
      >
        {/* Video thumbnail */}
        {isVideoThumbnail && videoSrc ? (
          <video
            src={videoSrc}
            muted
            playsInline
            preload="metadata"
            poster={videoThumbnail ? thumbnail : undefined}
            aria-hidden="true"
            className={styles.asset}
            data-project-card-asset=""
          />
        ) : (
          /* Static image thumbnail */
          <Image
            src={thumbnail}
            alt="" // Decorative; the adjacent title and description provide the equivalent.
            fill
            className={styles.asset}
            data-project-card-asset=""
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}

        {/* Coming-soon overlay badge */}
        {comingSoon && (
          <span
            className={styles.comingSoonBadge}
            data-project-card-coming-soon=""
          >
            {comingSoonLabel}
          </span>
        )}
      </div>

      {/* Caption Area - External, below image */}
      <div className={styles.caption}>
        {/* Category label */}
        {showCategory && category && (
          <span className={styles.category} lang={contentLanguage}>
            {category}
          </span>
        )}

        {/* Title */}
        <h3 id={titleId} className={styles.title} lang={contentLanguage}>
          {title}
        </h3>

        {/* Description - visible on hover for desktop, always for mobile */}
        {description && (
          <p
            id={descriptionId}
            className={showDescription ? styles.description : "sr-only"}
            lang={contentLanguage}
          >
            {description}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div
            className={styles.tags}
            data-project-card-tags=""
            lang={contentLanguage}
          >
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (comingSoon) {
    return (
      <div
        className={cn(styles.card, styles.comingSoon, className)}
        data-enhanced-project-card=""
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/work/${slug}`}
      className={cn(styles.card, className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      data-enhanced-project-card=""
      data-donny-interest="portfolio-project"
    >
      {content}
    </Link>
  );
}

EnhancedProjectCard.displayName = "EnhancedProjectCard";
