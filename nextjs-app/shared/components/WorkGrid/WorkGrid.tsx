"use client";

import { useTranslation } from "react-i18next";
import { FadeIn } from "../animations/FadeIn";
import { EnhancedProjectCard } from "../EnhancedProjectCard";
import { cn } from "../../../../lib/utils";
import type { Project } from "../../data/projects";

export interface WorkGridProps {
  /** Array of projects to display */
  projects: Project[];
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Enable staggered animations */
  animateItems?: boolean;
  /** Aspect ratio for cards */
  aspectRatio?: "square" | "video" | "portrait" | "landscape";
  /** Show category badge on cards */
  showCategory?: boolean;
  /** Custom className */
  className?: string;
}

// Responsive column classes with improved spacing
const columnClasses = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function WorkGrid({
  projects,
  columns = 3,
  animateItems = true,
  aspectRatio = "video",
  showCategory = true,
  className,
}: WorkGridProps) {
  const { t } = useTranslation();

  // Delightful empty state
  if (projects.length === 0) {
    return (
      <FadeIn className="py-20 text-center" direction="up" distance={20}>
        <div className="max-w-md mx-auto">
          {/* Decorative element */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="font-display font-semibold text-lg text-foreground mb-2">
            {t("workNoResultsTitle", "No projects found")}
          </h3>
          <p className="font-body text-muted-foreground text-sm leading-relaxed">
            {t(
              "workNoResultsDescription",
              "Try selecting a different category or browse all projects to explore our work."
            )}
          </p>
        </div>
      </FadeIn>
    );
  }

  // Format category display name
  const formatCategory = (category: string): string => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Calculate organic stagger delay - faster, more elegant timing
  const getStaggerDelay = (index: number, isFeatured: boolean): number => {
    // Featured projects animate slightly faster
    const baseDelay = isFeatured ? 0.04 : 0.06;
    // Exponential falloff for organic feel (items further in animate quicker relative to each other)
    return index * baseDelay + Math.min(index * 0.01, 0.1);
  };

  return (
    <div
      className={cn(
        // Improved grid gaps: more breathing room
        "grid gap-5 sm:gap-6 tablet:gap-8 desktop:gap-10",
        columnClasses[columns],
        className
      )}
      role="list"
      aria-label={t("workGalleryLabel", "Project gallery")}
    >
      {projects.map((project, index) => {
        const isFeatured = project.featured ?? false;

        const card = (
          <EnhancedProjectCard
            key={project.id}
            title={project.title}
            slug={project.slug}
            thumbnail={project.thumbnail}
            videoThumbnail={project.thumbnailVideo}
            autoPlayVideo={project.autoPlayVideo}
            description={project.description}
            category={showCategory ? formatCategory(project.category) : undefined}
            tags={project.tags}
            aspectRatio={aspectRatio}
            showCategory={showCategory}
          />
        );

        if (animateItems) {
          return (
            <div key={project.id} role="listitem" className="h-full">
              <FadeIn
                direction="up"
                // Organic stagger timing
                delay={getStaggerDelay(index, isFeatured)}
                // Featured projects have more dramatic entrance
                distance={isFeatured ? 40 : 30}
                className="h-full"
              >
                {card}
              </FadeIn>
            </div>
          );
        }

        return (
          <div key={project.id} role="listitem" className="h-full">
            {card}
          </div>
        );
      })}
    </div>
  );
}

WorkGrid.displayName = "WorkGrid";
