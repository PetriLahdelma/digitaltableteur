"use client";

import { type ReactNode } from "react";
import { type Project } from "../../data/projects";
import { getDonnyProjectTargetId } from "../../data/donny-site-actions";
import { ProjectDetailLayout } from "../ProjectDetailLayout";
import { ProjectHero, type ProjectHeroImage } from "../ProjectHero";
import {
  ProjectMetaSection,
  type ToolItem,
  type TeamMember,
  type ClientInfo,
} from "../ProjectMetaSection";
import { ContentSection, type ContentSectionProps } from "../ContentSection";
import {
  ProjectGallery,
  type GalleryImage,
} from "../../components/ProjectGallery";
import { RelatedProjects } from "../RelatedProjects";
import { ProjectNav } from "../../components/ProjectNav";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";

export interface ProjectDetailTemplateProps {
  /** Project data from projects.ts */
  project: Project;
  /** Hero configuration */
  hero: {
    image: ProjectHeroImage;
    variant?: "full-width" | "contained" | "split";
  };
  /** Metadata configuration */
  meta: {
    services: string[];
    duration?: string;
    tools?: ToolItem[];
    team?: TeamMember[];
    client?: ClientInfo;
    overview?: ReactNode;
  };
  /** Content sections */
  sections: ContentSectionProps[];
  /** Gallery images */
  gallery?: GalleryImage[];
  /** Enable related projects section */
  relatedEnabled?: boolean;
  /** Custom navigation element (overrides default ProjectNav) */
  nav?: ReactNode;
  /** Custom className */
  className?: string;
}

export function ProjectDetailTemplate({
  project,
  hero,
  meta,
  sections,
  gallery,
  relatedEnabled = true,
  nav,
  className,
}: ProjectDetailTemplateProps) {
  // Format category for display
  const categoryDisplay = project.category.replace("-", " ");
  const projectRootTarget = getDonnyProjectTargetId(project.slug, "root");
  const projectOverviewTarget = getDonnyProjectTargetId(
    project.slug,
    "overview",
  );
  const projectProofTarget = getDonnyProjectTargetId(project.slug, "proof");

  return (
    <ProjectDetailLayout
      className={className}
      donnyTarget={projectRootTarget}
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title={project.title}
          description={project.description}
          image={hero.image}
          category={categoryDisplay}
          tags={project.tags}
          variant={hero.variant}
          showScrollIndicator={true}
        />
      }
      relatedProjects={
        relatedEnabled ? (
          <RelatedProjects currentSlug={project.slug} maxItems={3} />
        ) : undefined
      }
    >
      {/* Project metadata section */}
      <ProjectMetaSection
        services={meta.services}
        duration={meta.duration}
        tools={meta.tools}
        team={meta.team}
        client={meta.client}
        overview={meta.overview}
        background="muted"
        donnyTarget={projectOverviewTarget}
      />

      {/* Content sections */}
      {sections.map((section, index) => (
        <ContentSection
          key={`section-${index}`}
          subtitle={section.subtitle}
          title={section.title}
          content={section.content}
          images={section.images}
          imageLayout={section.imageLayout}
          background={section.background}
          donnyTarget={index === 0 ? projectProofTarget : undefined}
        />
      ))}

      {/* Gallery section (if provided) */}
      {gallery && gallery.length > 0 && (
        <Section spacing="lg" background="default">
          <Container size="lg">
            <ProjectGallery
              images={gallery}
              columns={3}
              gap="md"
              aspectRatio="mixed"
              enableLightbox={true}
            />
          </Container>
        </Section>
      )}
    </ProjectDetailLayout>
  );
}

ProjectDetailTemplate.displayName = "ProjectDetailTemplate";
