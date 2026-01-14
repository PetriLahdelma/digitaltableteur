"use client";

import { useTranslation } from "react-i18next";
import { FadeIn } from "../animations/FadeIn";
import { EnhancedProjectCard } from "../EnhancedProjectCard";
import { cn } from "@/lib/utils";
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

const columnClasses = {
  2: "grid-cols-1 tablet:grid-cols-2",
  3: "grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3",
  4: "grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4",
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

  // Empty state
  if (projects.length === 0) {
    return (
      <FadeIn className="py-16 text-center">
        <p className="font-body text-muted-foreground">
          {t("workNoResults", "No projects found for this category.")}
        </p>
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

  return (
    <div
      className={cn(
        "grid gap-6 tablet:gap-8",
        columnClasses[columns],
        className
      )}
      role="list"
      aria-label="Project gallery"
    >
      {projects.map((project, index) => {
        const card = (
          <EnhancedProjectCard
            key={project.id}
            title={project.title}
            slug={project.slug}
            thumbnail={project.thumbnail}
            videoThumbnail={project.thumbnailVideo}
            description={project.description}
            category={showCategory ? formatCategory(project.category) : undefined}
            tags={project.tags}
            aspectRatio={aspectRatio}
            showCategory={showCategory}
          />
        );

        if (animateItems) {
          return (
            <FadeIn
              key={project.id}
              direction="up"
              delay={index * 0.1}
              distance={30}
              as="div"
              className="h-full"
            >
              {card}
            </FadeIn>
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
