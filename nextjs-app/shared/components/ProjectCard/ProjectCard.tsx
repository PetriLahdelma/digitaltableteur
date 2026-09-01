"use client";

import { Link } from "../../lib/linkComponent";
import { Image } from "../../lib/imageComponent";
import { cn } from "../../lib/cn";
import styles from "./ProjectCard.module.css";

export interface ProjectCardProps {
  /** Project title */
  title: string;
  /** URL slug for project detail page */
  slug: string;
  /** Thumbnail image URL */
  thumbnail: string;
  /** Project category */
  category?: string;
  /** Project tags */
  tags?: string[];
  /** Image aspect ratio */
  aspectRatio?: "square" | "video" | "portrait" | "landscape";
  /** Title overlay position */
  titlePosition?: "overlay" | "below";
  /** Render as a non-interactive teaser with a "coming soon" badge over the media */
  comingSoon?: boolean;
  /** Visible badge label for the coming-soon overlay (pass a translated string) */
  comingSoonLabel?: string;
  /** Custom className */
  className?: string;
}

const aspectRatioClasses: Record<NonNullable<ProjectCardProps["aspectRatio"]>, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};

/**
 * Basic portfolio project card for the work grid: a clickable thumbnail with
 * the project title, optional category eyebrow and up to three tags. The title
 * can sit over the image (`overlay`) or beneath it (`below`), and the thumbnail
 * frame follows the chosen `aspectRatio`. With `comingSoon` the card renders as
 * a non-interactive teaser with a badge over the media instead of a link.
 * EnhancedProjectCard is the richer variant — pick one per surface.
 */
export function ProjectCard({
  title,
  slug,
  thumbnail,
  category,
  tags,
  aspectRatio = "video",
  titlePosition = "overlay",
  comingSoon = false,
  comingSoonLabel = "Coming soon",
  className,
}: ProjectCardProps) {
  const content = (
    <>
      {/* Image Container */}
      <div
        className={cn(
          "relative overflow-hidden",
          aspectRatioClasses[aspectRatio]
        )}
      >
        <Image
          src={thumbnail}
          alt="" // Decorative — the card always renders the title as text
          fill
          className={cn(
            "object-cover",
            "transition-transform duration-500 ease-out",
            "group-hover:scale-105",
            "motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Coming-soon overlay badge */}
        {comingSoon && (
          <span
            className={styles.comingSoonBadge}
            data-project-card-coming-soon=""
          >
            {comingSoonLabel}
          </span>
        )}

        {/* Overlay (for overlay title position) */}
        {titlePosition === "overlay" && (
          <div className={styles.overlayScrim} />
        )}

        {/* Title Overlay */}
        {titlePosition === "overlay" && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 p-6",
              "translate-y-2 group-hover:translate-y-0",
              "opacity-90 group-hover:opacity-100",
              "transition-all duration-300",
              "motion-reduce:transition-none motion-reduce:translate-y-0"
            )}
          >
            {category && (
              <span className="text-xs font-body uppercase tracking-wider text-white/70 mb-1 block">
                {category}
              </span>
            )}
            <h3 className="font-display font-semibold text-xl text-white">
              {title}
            </h3>
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-body text-white/60 bg-white/10 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title Below (for below title position) */}
      {titlePosition === "below" && (
        <div className="p-4">
          {category && (
            <span className="text-xs font-body uppercase tracking-wider text-muted-foreground mb-1 block">
              {category}
            </span>
          )}
          <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors motion-reduce:transition-none">
            {title}
          </h3>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-body text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );

  // Non-interactive teaser: no link, no hover affordances (the `group` class
  // is omitted so group-hover: utilities stay at rest).
  if (comingSoon) {
    return (
      <div
        className={cn(
          "relative block overflow-hidden rounded-lg",
          "bg-muted",
          className
        )}
        data-project-card-coming-soon-root=""
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/work/${slug}`}
      // styles.card scopes the scrim's hover rule. It goes only on the linked
      // wrapper, never the coming-soon teaser, so hover affordances stay at
      // rest there exactly as the `group` omission below already ensured.
      className={cn(
        styles.card,
        "group relative block overflow-hidden rounded-lg",
        "bg-muted",
        className
      )}
      data-donny-interest="portfolio-project"
    >
      {content}
    </Link>
  );
}

ProjectCard.displayName = "ProjectCard";
