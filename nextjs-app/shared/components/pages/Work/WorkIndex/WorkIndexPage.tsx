"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
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
// Glyphs imported directly: an Icon name would add them to the shared icon
// registry and the web-components icon data (size-budgeted).
import { List as ListIcon, SquaresFour } from "@phosphor-icons/react";
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
import { formatPeriod } from "../../../../lib/formatPeriod";
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
  const { t, i18n } = useTranslation();
  const locale = (i18n.resolvedLanguage ?? i18n.language ?? "en").split("-")[0] ?? "en";
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
    // Cross-fade the swap between cards and list where the browser supports
    // view transitions; reduced motion and older browsers swap at once.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && typeof document.startViewTransition === "function") {
      document.startViewTransition(() => flushSync(() => setView(next)));
    } else {
      setView(next);
    }
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
  // Card categories are marked as English content (contentLanguage "en"), so
  // they use the English filter label ("UX Design", "Tools & OSS") rather
  // than a title-cased slug ("Ux Design").
  const englishCategory = (value: string) => {
    const labelKey = categories.find((cat) => cat.value === value)?.labelKey;
    return labelKey
      ? t(labelKey, { lng: "en", defaultValue: formatCategory(value) })
      : formatCategory(value);
  };

  const listItems = useMemo<ProjectListItem[]>(() => {
    const labelFor = (value: string) =>
      translatedCategories.find((cat) => cat.value === value)?.label ??
      formatCategory(value);
    return filteredProjects.map((project) => ({
      id: project.id,
      title: project.title,
      href: project.comingSoon ? undefined : `/work/${project.slug}`,
      thumbnail: project.thumbnail,
      client:
        project.client ??
        (project.clientNote === "self-initiated"
          ? t("workClientSelfInitiated", "Self-initiated")
          : project.clientNote === "various"
            ? t("workClientVarious", "Various")
            : undefined),
      clientIsLabel: !project.client && Boolean(project.clientNote),
      discipline: labelFor(project.category),
      year: project.period
        ? formatPeriod(project.period, locale, (start) =>
            t("workPeriodOngoing", { start, defaultValue: "{{start}} – Present" }),
          )
        : undefined,
      comingSoon: project.comingSoon,
    }));
  }, [filteredProjects, translatedCategories, t, locale]);

  const viewToggleProps = {
    ariaLabel: t("workViewLabel", "Project view"),
    size: "md" as const,
    onValueChange: handleViewChange,
    items: [
      {
        value: "cards",
        label: (
          <span className={styles.segmentLabel}>
            <SquaresFour size={16} aria-hidden="true" />
            {t("workViewCards", "Cards")}
          </span>
        ),
      },
      {
        value: "list",
        label: (
          <span className={styles.segmentLabel}>
            <ListIcon size={16} aria-hidden="true" />
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
                        category={englishCategory(project.category)}
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
