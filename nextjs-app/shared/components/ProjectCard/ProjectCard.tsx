"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "../../lib/cn";

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
 * frame follows the chosen `aspectRatio`. EnhancedProjectCard is the richer
 * variant — pick one per surface.
 */
export function ProjectCard({
  title,
  slug,
  thumbnail,
  category,
  tags,
  aspectRatio = "video",
  titlePosition = "overlay",
  className,
}: ProjectCardProps) {
  return (
    <Link
      href={`/work/${slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-lg",
        "bg-muted",
        className
      )}
      data-donny-interest="portfolio-project"
    >
      {/* Image Container */}
      <div
        className={cn(
          "relative overflow-hidden",
          aspectRatioClasses[aspectRatio]
        )}
      >
        <Image
          src={thumbnail}
          alt={title}
          fill
          className={cn(
            "object-cover",
            "transition-transform duration-500 ease-out",
            "group-hover:scale-105",
            "motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Overlay (for overlay title position) */}
        {titlePosition === "overlay" && (
          <div
            className={cn(
              "absolute inset-0",
              "bg-gradient-to-t from-black/80 via-black/20 to-transparent",
              "opacity-60 group-hover:opacity-90",
              "transition-opacity duration-300",
              "motion-reduce:transition-none"
            )}
          />
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
    </Link>
  );
}

ProjectCard.displayName = "ProjectCard";
