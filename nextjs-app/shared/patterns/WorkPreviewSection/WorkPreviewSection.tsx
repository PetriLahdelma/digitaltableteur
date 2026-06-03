"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { FadeIn } from "../../components/animations/FadeIn";
import { ProjectCard } from "../../components/ProjectCard";
import { EnhancedProjectCard } from "../../components/EnhancedProjectCard";
import { cn } from "@/lib/utils";

export interface ProjectItem {
  /** Project title */
  title: string;
  /** URL slug */
  slug: string;
  /** Thumbnail image URL */
  thumbnail: string;
  /** Project category */
  category?: string;
  /** Project tags */
  tags?: string[];
}

export interface WorkPreviewSectionProps {
  /** Section title */
  title?: string;
  /** Array of projects to display */
  projects: ProjectItem[];
  /** Grid layout style */
  layout?: "grid" | "asymmetric" | "featured";
  /** Show "View all work" link */
  showViewAll?: boolean;
  /** Custom className */
  className?: string;
  /** Section ID for navigation */
  id?: string;
}

/**
 * WorkPreviewSection component.
 */
export function WorkPreviewSection({
  title,
  projects,
  layout = "grid",
  showViewAll = true,
  className,
  id = "work",
}: WorkPreviewSectionProps) {
  const { t } = useTranslation();

  const renderGrid = () => (
    <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <FadeIn key={project.slug} delay={index * 0.1} direction="up">
          <ProjectCard
            title={project.title}
            slug={project.slug}
            thumbnail={project.thumbnail}
            category={project.category}
            tags={project.tags}
            aspectRatio="video"
          />
        </FadeIn>
      ))}
    </div>
  );

  const renderAsymmetric = () => {
    const [first, ...rest] = projects;
    return (
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-6">
        {/* Large featured project */}
        {first && (
          <FadeIn direction="up" className="desktop:row-span-2">
            <ProjectCard
              title={first.title}
              slug={first.slug}
              thumbnail={first.thumbnail}
              category={first.category}
              tags={first.tags}
              aspectRatio="square"
              className="h-full"
            />
          </FadeIn>
        )}
        {/* Smaller projects */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-1 gap-6">
          {rest.slice(0, 2).map((project, index) => (
            <FadeIn key={project.slug} delay={(index + 1) * 0.15} direction="up">
              <ProjectCard
                title={project.title}
                slug={project.slug}
                thumbnail={project.thumbnail}
                category={project.category}
                tags={project.tags}
                aspectRatio="video"
              />
            </FadeIn>
          ))}
        </div>
      </div>
    );
  };

  const renderFeatured = () => {
    return (
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6">
        {projects.slice(0, 3).map((project, index) => (
          <FadeIn key={project.slug} delay={index * 0.1} direction="up">
            <EnhancedProjectCard
              title={project.title}
              slug={project.slug}
              thumbnail={project.thumbnail}
              category={project.category}
              tags={project.tags}
              aspectRatio="landscape"
              showCategory={true}
              showDescription={false}
            />
          </FadeIn>
        ))}
      </div>
    );
  };

  return (
    <Section
      id={id}
      className={cn("py-20 desktop:py-28 bg-muted/30", className)}
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      <Container size="lg">
        {/* Section Header */}
        <FadeIn className="flex items-end justify-between mb-12">
          {title && (
            <h2
              id={`${id}-title`}
              className="font-display font-bold text-3xl tablet:text-4xl desktop:text-5xl text-foreground"
            >
              {title}
            </h2>
          )}
          {showViewAll && (
            <Link
              href="/work"
              className={cn(
                "hidden tablet:flex items-center gap-2",
                "font-body text-sm text-muted-foreground",
                "hover:text-foreground transition-colors",
                "group"
              )}
            >
              {t("homeWorkViewAll", "View all work")}
              <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </FadeIn>

        {/* Projects Grid */}
        {layout === "grid" && renderGrid()}
        {layout === "asymmetric" && renderAsymmetric()}
        {layout === "featured" && renderFeatured()}

        {/* Mobile View All Link */}
        {showViewAll && (
          <FadeIn delay={0.5} className="mt-8 tablet:hidden">
            <Link
              href="/work"
              className={cn(
                "flex items-center justify-center gap-2",
                "font-body text-sm text-muted-foreground",
                "hover:text-foreground transition-colors"
              )}
            >
              {t("homeWorkViewAll", "View all work")}
              <ChevronRight className="size-4" />
            </Link>
          </FadeIn>
        )}
      </Container>
    </Section>
  );
}

WorkPreviewSection.displayName = "WorkPreviewSection";
