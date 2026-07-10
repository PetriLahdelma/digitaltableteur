"use client";

import { useRef } from "react";
import { useTranslate } from "../../lib/translation";
import { gsap, useGSAP } from "../../lib/gsap";
import { useAnimationContext } from "../../lib/animation";
import { FadeIn } from "../animations/FadeIn";
import EmptyState from "@dt/EmptyState";
import { EnhancedProjectCard } from "../EnhancedProjectCard";
import { cn } from "../../lib/cn";
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

/**
 * Responsive grid of portfolio projects, one EnhancedProjectCard per item, in
 * a labelled `role="list"`. Items stagger in on scroll via GSAP (gated by the
 * AnimationProvider's motion preference), and an empty project set renders a
 * friendly empty state instead of a blank grid.
 */
export function WorkGrid({
  projects,
  columns = 3,
  animateItems = true,
  aspectRatio = "video",
  showCategory = true,
  className,
}: WorkGridProps) {
  const t = useTranslate();
  const gridRef = useRef<HTMLDivElement>(null);
  const { motionPreference } = useAnimationContext();

  // GSAP ScrollTrigger-based orchestrated stagger animation
  useGSAP(
    () => {
      if (motionPreference === "reduced" || !animateItems) return;
      if (!gridRef.current) return;

      const items = gridRef.current.querySelectorAll("[data-grid-item]");
      if (!items.length) return;

      const featuredItems = gridRef.current.querySelectorAll(
        "[data-grid-item][data-featured]"
      );
      const standardItems = gridRef.current.querySelectorAll(
        "[data-grid-item]:not([data-featured])"
      );

      // Set initial state for all items
      gsap.set(featuredItems, { opacity: 0, y: 50, scale: 0.92 });
      gsap.set(standardItems, { opacity: 0, y: 40, scale: 0.95 });

      // Create a single timeline for orchestrated entrance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });

      // Animate all items together with wave-pattern stagger
      tl.to(items, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "power3.out",
        stagger: {
          each: 0.08,
          grid: "auto",
          from: "start",
        },
      });
    },
    { scope: gridRef, dependencies: [motionPreference, animateItems, projects] }
  );

  // Delightful empty state
  if (projects.length === 0) {
    return (
      <FadeIn className="py-20" direction="up" distance={20}>
        <EmptyState
          icon="image"
          title={t("workNoResultsTitle", "No projects found")}
          description={t(
            "workNoResultsDescription",
            "Try selecting a different category or browse all projects to explore our work."
          )}
          headingLevel="h3"
          size="lg"
        />
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
      ref={gridRef}
      className={cn(
        // Improved grid gaps: more breathing room
        "grid gap-5 sm:gap-6 tablet:gap-8 desktop:gap-10",
        columnClasses[columns],
        className
      )}
      role="list"
      aria-label={t("workGalleryLabel", "Project gallery")}
    >
      {projects.map((project) => {
        const isFeatured = project.featured ?? false;

        return (
          <div
            key={project.id}
            role="listitem"
            className="h-full"
            data-grid-item
            {...(isFeatured ? { "data-featured": "" } : {})}
          >
            <EnhancedProjectCard
              title={project.title}
              slug={project.slug}
              thumbnail={project.thumbnail}
              videoThumbnail={project.thumbnailVideo}
              autoPlayVideo={project.autoPlayVideo}
              description={project.description}
              category={
                showCategory ? formatCategory(project.category) : undefined
              }
              tags={project.tags}
              aspectRatio={aspectRatio}
              showCategory={showCategory}
            />
          </div>
        );
      })}
    </div>
  );
}

WorkGrid.displayName = "WorkGrid";
