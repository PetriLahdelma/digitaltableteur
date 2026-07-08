"use client";

import { useTranslate } from "../../lib/translation";
import { cn } from "../../lib/cn";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { FadeIn } from "../../components/animations/FadeIn";
import { EnhancedProjectCard } from "../../components/EnhancedProjectCard";
import { getRelatedProjects } from "../../data/projects";

export interface RelatedProjectsProps {
  /** Current project slug (to exclude from results) */
  currentSlug: string;
  /** Maximum number of related projects to show */
  maxItems?: number;
  /** Section title - uses i18n key "projectRelatedTitle" if not provided */
  title?: string;
  /** Custom className */
  className?: string;
}

export function RelatedProjects({
  currentSlug,
  maxItems = 2,
  title,
  className,
}: RelatedProjectsProps) {
  const t = useTranslate();
  const relatedProjects = getRelatedProjects(currentSlug, maxItems);

  // If no related projects found, show a fallback CTA
  if (relatedProjects.length === 0) {
    return (
      <Section spacing="lg" background="default" className={className}>
        <Container size="lg" className="text-center">
          <h2 className="font-display font-bold text-2xl tablet:text-3xl text-foreground mb-4">
            {t("projectRelatedTitle", "Related Projects")}
          </h2>
          <a
            href="/work"
            className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors font-medium"
          >
            {t("projectBrowseAll", "Browse all projects")} &rarr;
          </a>
        </Container>
      </Section>
    );
  }

  const displayTitle = title || t("projectRelatedTitle", "Related Projects");

  return (
    <Section
      spacing="lg"
      background="default"
      className={className}
    >
      <Container size="lg">
        <FadeIn direction="up" delay={0} distance={20}>
          <h2 className="font-display font-bold text-2xl tablet:text-3xl text-foreground mb-8">
            {displayTitle}
          </h2>
        </FadeIn>

        <div
          className={cn(
            "grid gap-6",
            relatedProjects.length === 1 && "grid-cols-1 max-w-md",
            relatedProjects.length === 2 && "grid-cols-1 md:grid-cols-2",
            relatedProjects.length >= 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {relatedProjects.map((project, index) => (
            <FadeIn
              key={project.id}
              direction="up"
              delay={0.1 + index * 0.1}
              distance={30}
            >
              <EnhancedProjectCard
                title={project.title}
                slug={project.slug}
                thumbnail={project.thumbnail}
                videoThumbnail={project.thumbnailVideo}
                description={project.description}
                category={project.category.replace("-", " ")}
                tags={project.tags}
                aspectRatio="video"
                showCategory={true}
                showDescription={true}
              />
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}

RelatedProjects.displayName = "RelatedProjects";
