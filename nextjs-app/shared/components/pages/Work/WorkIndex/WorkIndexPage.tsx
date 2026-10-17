"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CategoryFilter,
  Container,
  EmptyState,
  Grid,
  ProjectList,
  type ProjectListItem,
  Section,
  SegmentedControl,
} from "@digitaltableteur/react";
import Icon from "../../../Icon/Icon";
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
import styles from "./workIndex.module.css";
import { cn } from "../../../../lib/cn";

/**
 * "auto" until the visitor picks: both views render and CSS shows the list on
 * phones and the cards from tablet up, so nothing swaps after hydration. A
 * pick is kept in localStorage and in the URL (?view=) for back and sharing.
 */
type WorkView = "auto" | "cards" | "list";
const VIEW_PARAM = "view";
const VIEW_STORAGE_KEY = "dt-work-view";
const isPickedView = (value: unknown): value is "cards" | "list" =>
  value === "cards" || value === "list";

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
  const [view, setView] = useState<WorkView>("auto");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get(VIEW_PARAM);
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    } catch {
      // Storage blocked: stay on the per-breakpoint default.
    }
    const picked = isPickedView(fromUrl) ? fromUrl : stored;
    if (isPickedView(picked)) setView(picked);
  }, []);

  const handleViewChange = (next: string) => {
    if (!isPickedView(next)) return;
    setView(next);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, next);
    } catch {
      // Storage blocked: the URL still carries the choice.
    }
    const url = new URL(window.location.href);
    url.searchParams.set(VIEW_PARAM, next);
    window.history.replaceState(window.history.state, "", url);
  };

  // Filter projects based on active category
  const filteredProjects = useMemo(() => {
    return filterProjects(
      projects.filter((project) => !project.unlisted),
      activeCategory,
    );
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
        "[data-grid-item][data-featured]",
      );
      const standardItems = gridRef.current.querySelectorAll(
        "[data-grid-item]:not([data-featured])",
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
    { scope: gridRef, dependencies: [motionPreference, filteredProjects] },
  );

  // Map categories to include translated labels
  const translatedCategories = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.value,
      label: t(cat.labelKey, cat.labelKey),
    }));
  }, [t]);

  // Handle category change
  const listItems = useMemo<ProjectListItem[]>(() => {
    const labelFor = (value: string) =>
      translatedCategories.find((cat) => cat.value === value)?.label ??
      formatCategory(value);
    return filteredProjects.map((project) => ({
      id: project.id,
      title: project.title,
      href: project.comingSoon ? undefined : `/work/${project.slug}`,
      thumbnail: project.thumbnail,
      client: project.client,
      discipline: labelFor(project.category),
      year: project.duration,
      comingSoon: project.comingSoon,
    }));
  }, [filteredProjects, translatedCategories]);

  const viewToggleProps = {
    ariaLabel: t("workViewLabel", "Project view"),
    size: "sm" as const,
    onValueChange: handleViewChange,
    items: [
      {
        value: "cards",
        label: (
          <span className={styles.segmentLabel}>
            <Icon name="squares-four" size={16} />
            {t("workViewCards", "Cards")}
          </span>
        ),
      },
      {
        value: "list",
        label: (
          <span className={styles.segmentLabel}>
            <Icon name="list" size={16} />
            {t("workViewList", "List")}
          </span>
        ),
      },
    ],
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category as ProjectCategory);
  };

  return (
    <div className="min-h-screen" data-donny-target="work.index">
      {/* Navigation (if provided) */}
      {nav}

      {/* Hero Section */}
      <WorkHero />

      {/* Projects Section */}
      <Section spacing="follow" background="default">
        <Container size="lg">
          {/* Filter Bar with entrance animation */}
          <FadeIn
            delay={0.3}
            direction="up"
            distance={20}
            className={cn(styles.controls, "mb-6 tablet:mb-12")}
          >
            <CategoryFilter
              categories={translatedCategories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              variant="pills"
              size="md"
            />
            {/* Count and view toggle: their own row on phones, right above the
                first project; beside the filters on desktop. */}
            <div className={styles.toolbar}>
              <span className={styles.count} aria-live="polite">
                {t("workProjectCount", {
                  count: filteredProjects.length,
                  defaultValue: "{{count}} projects",
                })}
              </span>
              {/* One control per breakpoint, both always mounted so focus
                  stays on the pressed option when the view changes. Before
                  a pick each shows its breakpoint's default. */}
              <SegmentedControl
                {...viewToggleProps}
                value={view === "auto" ? "list" : view}
                className={styles.phoneOnly}
              />
              <SegmentedControl
                {...viewToggleProps}
                value={view === "auto" ? "cards" : view}
                className={styles.wideOnly}
              />
            </div>
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
                  "Try selecting a different category or browse all projects to explore the work.",
                )}
                headingLevel="h3"
                size="lg"
              />
            </FadeIn>
          ) : (
            <>
            <div
              ref={gridRef}
              className={cn(
                view === "list" && styles.hidden,
                view === "auto" && styles.wideOnly,
              )}
            >
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
                        comingSoon={project.comingSoon}
                        comingSoonLabel={t("workComingSoon", "Coming soon")}
                        contentLanguage="en"
                      />
                    </div>
                  );
                })}
              </Grid>
            </div>
            <ProjectList
              items={listItems}
              ariaLabel={t("workGalleryLabel", "Project gallery")}
              comingSoonLabel={t("workComingSoon", "Coming soon")}
              contentLanguage="en"
              className={cn(
                view === "cards" && styles.hidden,
                view === "auto" && styles.phoneOnly,
              )}
            />
            </>
          )}
        </Container>
      </Section>
    </div>
  );
}
