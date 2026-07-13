"use client";

import React, { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  CategoryFilter,
  Container,
  EmptyState,
  Section,
} from "@digitaltableteur/react";
// Grid stays a local import until its responsive props ship in the next
// package release; flip to the barrel with that consume.
import Grid from "@dt/Grid";
import { WorkHero } from "../../../../patterns/WorkHero";
import { EnhancedProjectCard } from "../../../EnhancedProjectCard";
import { FadeIn } from "../../../../components/animations/FadeIn";
import { gsap, useGSAP } from "../../../../lib/gsap";
import { useAnimationContext } from "../../../../lib/animation";
import {
  projects,
  categories,
  filterProjects,
  type ProjectCategory,
} from "../../../../data/projects";

export interface WorkIndexPageProps {
  /** Optional navigation component (e.g., NextWorkNav) */
  nav?: React.ReactNode;
}

// Format category display name ("design-systems" -> "Design Systems")
const formatCategory = (category: string): string =>
  category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export function WorkIndexPage({ nav }: WorkIndexPageProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");
  const gridRef = useRef<HTMLDivElement>(null);
  const { motionPreference } = useAnimationContext();

  // Filter projects based on active category
  const filteredProjects = useMemo(() => {
    return filterProjects(projects, activeCategory);
  }, [activeCategory]);

  // GSAP ScrollTrigger-based orchestrated stagger (transplanted from the
  // dissolved WorkGrid organism), gated by the AnimationProvider preference.
  useGSAP(
    () => {
      if (motionPreference === "reduced") return;
      if (!gridRef.current) return;

      const items = gridRef.current.querySelectorAll("[data-grid-item]");
      if (!items.length) return;

      const featuredItems = gridRef.current.querySelectorAll(
        "[data-grid-item][data-featured]"
      );
      const standardItems = gridRef.current.querySelectorAll(
        "[data-grid-item]:not([data-featured])"
      );

      gsap.set(featuredItems, { opacity: 0, y: 50, scale: 0.92 });
      gsap.set(standardItems, { opacity: 0, y: 40, scale: 0.95 });

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
    { scope: gridRef, dependencies: [motionPreference, filteredProjects] }
  );

  // Map categories to include translated labels
  const translatedCategories = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.value,
      label: t(cat.labelKey, cat.labelKey),
    }));
  }, [t]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category as ProjectCategory);
  };

  return (
    <main className="min-h-screen" data-donny-target="work.index">
      {/* Navigation (if provided) */}
      {nav}

      {/* Hero Section */}
      <WorkHero />

      {/* Projects Section */}
      <Section spacing="follow" background="default">
        <Container size="lg">
          {/* Filter Bar with entrance animation */}
          <FadeIn delay={0.3} direction="up" distance={20} className="mb-12 tablet:mb-16">
            <CategoryFilter
              categories={translatedCategories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              variant="pills"
              size="md"
            />
          </FadeIn>

          {/* Project Grid — DS Grid composition (WorkGrid dissolved per the
              component tribunal: layout = Grid, empty state = EmptyState,
              stagger = page-level GSAP). Columns snap to the token
              breakpoints (tablet 768 / desktop 1024) per owner ruling. */}
          {filteredProjects.length === 0 ? (
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
          ) : (
            <div ref={gridRef}>
              <Grid
                columns={1}
                tabletColumns={2}
                desktopColumns={4}
                gap="1.25rem"
                tabletGap="2rem"
                desktopGap="2.5rem"
                role="list"
                aria-label={t("workGalleryLabel", "Project gallery")}
              >
                {filteredProjects.map((project) => {
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
                        category={formatCategory(project.category)}
                        tags={project.tags}
                        aspectRatio="square"
                        showCategory={true}
                      />
                    </div>
                  );
                })}
              </Grid>
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}
