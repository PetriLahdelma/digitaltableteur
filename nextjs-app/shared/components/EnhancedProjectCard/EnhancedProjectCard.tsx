"use client";

import { Fragment, useEffect, useId, useRef, type CSSProperties } from "react";
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
  /**
   * Video thumbnail: one URL, or several in preference order (for example
   * WebM then MP4). `thumbnail` is its poster. Paused unless `autoPlayVideo`.
   */
  videoThumbnail?: string | string[];
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
  /**
   * Loop the video like a GIF: muted, inline, playing only while on screen,
   * and never for visitors who prefer reduced motion (they see the poster).
   * Keep such clips short. @default false
   */
  autoPlayVideo?: boolean;
  /** Render as a non-interactive teaser with a "coming soon" badge over the media */
  comingSoon?: boolean;
  /** Visible badge label for the coming-soon overlay (pass a translated string) */
  comingSoonLabel?: string;
  /** BCP 47 language tag for project-authored title and metadata */
  contentLanguage?: string;
  /**
   * Glow the cover in its own colours on hover. Off by default; the work
   * index opts in, other surfaces (home, related work) stay quiet.
   * @default false
   */
  coverGlow?: boolean;
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

function videoMimeType(src: string): string | undefined {
  const path = src.split("?")[0] ?? src;
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".mp4")) return "video/mp4";
  return undefined;
}

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
  comingSoon = false,
  comingSoonLabel = "Coming soon",
  contentLanguage,
  coverGlow = false,
  className,
}: EnhancedProjectCardProps) {
  const rawId = useId();

  const isVideoThumbnail =
    Boolean(videoThumbnail) ||
    thumbnail.endsWith(".mov") ||
    thumbnail.endsWith(".mp4") ||
    thumbnail.endsWith(".webm");
  const videoSources = videoThumbnail
    ? Array.isArray(videoThumbnail)
      ? videoThumbnail
      : [videoThumbnail]
    : isVideoThumbnail
      ? [thumbnail]
      : [];
  const shouldLoop = autoPlayVideo && !comingSoon && videoSources.length > 0;
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play only while visible and motion is welcome; pause otherwise. No
  // `autoplay` attribute, so reduced-motion visitors never get a first frame
  // of motion before JS runs.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoop) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (visible && !reduce.matches) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        sync();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    reduce.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", sync);
    };
  }, [shouldLoop]);

  // The hover glow is the cover itself: the frame carries it as its
  // background (only while hovered, so the file is fetched on demand) and
  // a pseudo-element inherits that background, blurred and saturated. A
  // thumbnail that is itself a video has no image to glow with.
  const glowSource =
    !coverGlow || /\.(mov|mp4|webm)(\?|$)/i.test(thumbnail) ? null : thumbnail;
  const frameStyle = glowSource
    ? ({
        "--project-card-cover": `url(${JSON.stringify(glowSource)})`,
      } as CSSProperties)
    : undefined;

  const idBase = `${slug}-${rawId.replace(/:/g, "")}`;
  const titleId = `${idBase}-title`;
  const descriptionId = `${idBase}-description`;
  const categoryId = `${idBase}-category`;
  const tagsId = `${idBase}-tags`;
  const hasCategory = Boolean(showCategory && category);
  const hasTags = Boolean(tags && tags.length > 0);
  // The link's name covers its visible text in visual order (WCAG 2.5.3
  // Label in Name; axe-core 4.14 enforces it): category, title, tags. The
  // description stays the accessible description.
  // A visible description (always on touch screens, on hover otherwise)
  // is part of the link's text too, so it joins the name; a screen-reader-
  // only one stays the accessible description instead.
  const descriptionInName = Boolean(description && showDescription);
  const labelledBy = [
    hasCategory && categoryId,
    titleId,
    descriptionInName && descriptionId,
    hasTags && tagsId,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {/* Frame: holds the cover glow, which spills past the clipped media */}
      <div
        className={styles.mediaFrame}
        style={frameStyle}
        data-project-card-glow={glowSource ? "" : undefined}
      >
        {/* Media Container - Clean, no overlays (coming-soon badge excepted) */}
        <div
          className={cn(styles.media, aspectRatioClasses[aspectRatio])}
          data-project-card-media=""
        >
          {/* Video thumbnail */}
          {isVideoThumbnail && videoSources.length > 0 ? (
            <video
              ref={videoRef}
              muted
              loop={shouldLoop}
              playsInline
              preload={shouldLoop ? "auto" : "metadata"}
              poster={videoThumbnail ? thumbnail : undefined}
              aria-hidden="true"
              className={styles.asset}
              data-project-card-asset=""
            >
              {videoSources.map((src) => (
                <source key={src} src={src} type={videoMimeType(src)} />
              ))}
            </video>
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
      </div>

      {/* Caption Area - External, below image */}
      <div className={styles.caption}>
        {/* Category label */}
        {showCategory && category && (
          <span
            id={categoryId}
            className={styles.category}
            lang={contentLanguage}
          >
            {category}
          </span>
        )}
        {/* Whitespace between category and title: text extraction (axe's
            visible text, copy and paste) otherwise fuses them into
            "Design SystemsSAP Build Apps". The grid does not render it. */}
        {hasCategory ? " " : null}
        {/* Title */}
        <h3 id={titleId} className={styles.title} lang={contentLanguage}>
          {title}
        </h3>
        {/* Whitespace keeps title, description and tags apart in extracted
            text; the caption grid does not render it. */}{" "}
        {/* Description - visible on hover for desktop, always for mobile */}
        {description && (
          <p
            id={descriptionId}
            className={showDescription ? styles.description : "sr-only"}
            lang={contentLanguage}
          >
            {description}
          </p>
        )}{" "}
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div
            id={tagsId}
            className={styles.tags}
            data-project-card-tags=""
            lang={contentLanguage}
          >
            {/* The space keeps tags apart in the accessible name
                ("Enterprise Low-Code", not "EnterpriseLow-Code"); a flex
                row does not render whitespace. */}
            {tags.slice(0, 3).map((tag, index) => (
              <Fragment key={tag}>
                {index > 0 ? " " : null}
                <span className={styles.tag}>{tag}</span>
              </Fragment>
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
      aria-labelledby={labelledBy}
      aria-describedby={
        description && !descriptionInName ? descriptionId : undefined
      }
      data-enhanced-project-card=""
      data-donny-interest="portfolio-project"
    >
      {content}
    </Link>
  );
}

EnhancedProjectCard.displayName = "EnhancedProjectCard";
