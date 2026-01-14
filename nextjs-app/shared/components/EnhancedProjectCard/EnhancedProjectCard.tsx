"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
  /** Show category badge */
  showCategory?: boolean;
  /** Show description on hover */
  showDescription?: boolean;
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
  className,
}: EnhancedProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked, ignore error
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const isVideoThumbnail = videoThumbnail || thumbnail.endsWith(".mov") || thumbnail.endsWith(".mp4") || thumbnail.endsWith(".webm");
  const videoSrc = videoThumbnail || (isVideoThumbnail ? thumbnail : undefined);

  return (
    <Link
      href={`/work/${slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-lg",
        "bg-muted",
        "transition-transform duration-300 ease-out",
        "hover:scale-[1.02]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media Container */}
      <div
        className={cn(
          "relative overflow-hidden",
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
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              "transition-transform duration-500 ease-out",
              "group-hover:scale-105"
            )}
            aria-label={`${title} preview video`}
          />
        ) : (
          /* Static image thumbnail */
          <Image
            src={thumbnail}
            alt={title}
            fill
            className={cn(
              "object-cover",
              "transition-transform duration-500 ease-out",
              "group-hover:scale-105",
              !imageLoaded && "opacity-0"
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={() => setImageLoaded(true)}
          />
        )}

        {/* Gradient overlay */}
        <div
          className={cn(
            "absolute inset-0",
            "bg-gradient-to-t from-black/80 via-black/30 to-transparent",
            "opacity-60 group-hover:opacity-90",
            "transition-opacity duration-300"
          )}
        />

        {/* Category badge */}
        {showCategory && category && (
          <div className="absolute top-4 left-4">
            <span
              className={cn(
                "inline-block px-3 py-1",
                "text-xs font-body uppercase tracking-wider",
                "bg-white/10 backdrop-blur-sm rounded-full",
                "text-white/90"
              )}
            >
              {category}
            </span>
          </div>
        )}

        {/* Content overlay */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 p-6",
            "translate-y-2 group-hover:translate-y-0",
            "opacity-90 group-hover:opacity-100",
            "transition-all duration-300"
          )}
        >
          {/* Title */}
          <h3 className="font-display font-semibold text-xl tablet:text-2xl text-white mb-2">
            {title}
          </h3>

          {/* Description (revealed on hover) */}
          {showDescription && description && (
            <p
              className={cn(
                "font-body text-sm text-white/80",
                "line-clamp-2",
                "opacity-0 group-hover:opacity-100",
                "translate-y-2 group-hover:translate-y-0",
                "transition-all duration-300 delay-75"
              )}
            >
              {description}
            </p>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-2 mt-3",
                "opacity-0 group-hover:opacity-100",
                "translate-y-2 group-hover:translate-y-0",
                "transition-all duration-300 delay-100"
              )}
            >
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
      </div>
    </Link>
  );
}

EnhancedProjectCard.displayName = "EnhancedProjectCard";
