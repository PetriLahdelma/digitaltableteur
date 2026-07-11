"use client";

import React from "react";
import { Text } from "@digitaltableteur/react";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { ProjectMetaSection } from "../../../../patterns/ProjectMetaSection";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiFigma } from "react-icons/si";
import { AdobeToolIcon } from "../AdobeToolIcon";

import styles from "./tulli.module.css";

export function TulliPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("tulli");

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ProjectDetailLayout
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title={project.title}
          description={project.description}
          image={{
            src: "/images/portfolio/tulli/hero.png",
            alt: "Tulli Intrastat service overview",
            width: 1600,
            height: 840,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          date="2016"
          variant="contained"
          showScrollIndicator={true}
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} />}
      className={styles.page}
    >
      <ProjectMetaSection
        services={["UX Design", "Service Design", "Interaction Design", "Design System"]}
        duration="2016"
        tools={[
          { key: "figma", icon: <SiFigma size={24} />, name: "Figma" },
          {
            key: "illustrator",
            icon: <AdobeToolIcon tool="illustrator" />,
            name: "Illustrator",
          },
          {
            key: "indesign",
            icon: <AdobeToolIcon tool="indesign" />,
            name: "InDesign",
          },
        ]}
        client={{ name: "Finnish Customs (Tulli)" }}
        overview={
          <Text size="s">
            NettiAsiointiKanava defined the online service for Finnish Customs
            enterprise customers. The first phase focused on the general service
            framework and Intrastat statistical reporting for import and export
            declarations.
            <br />
            <br />
            The specification outlines user roles (user, reporter, agent),
            language selection, login and role selection flows, and the core
            views for case tracking, notification lists, and declaration
            handling across the Intrastat workflow.
          </Text>
        }
        background="muted"
        maxWidth="md"
      />

      <StoryBlock
        subtitle="Service Definition"
        title="Enterprise Roles and Secure Access"
        content={[
          <Text key="p1" size="s">
            The service defines clear roles for enterprise users: individual
            users, reporters responsible for Intrastat reporting, and agents
            acting on behalf of companies. Login and role selection are critical
            entry points into the service, paired with language selection and
            an anonymous front page for first-time visitors.
          </Text>,
          <Text key="p2" size="s">
            Case tracking is anchored by the Ilmoitukset view, where recent
            declarations and actions are listed with filters, sorting, and
            status visibility.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/tulli/login.png",
          alt: "Tulli login and role selection",
          width: 1916,
          height: 1141,
          caption: "Login and role selection flows for enterprise users.",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      <StoryBlock
        subtitle="Intrastat Workflow"
        title="From Declaration to Submission"
        content={[
          <Text key="p1" size="s">
            The Intrastat flow supports new declarations created manually, by
            copying previous entries, or by importing CSV and ASCII files. Users
            move through header data, line items, and summary steps before
            submitting reports to Customs.
          </Text>,
          <Text key="p2" size="s">
            The workflow also includes correction requests, printing tools, and
            summary views that confirm successful submissions.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/tulli/intrastat-form.png",
          alt: "Intrastat declaration form",
          width: 1178,
          height: 578,
          caption: "Declaration forms with line-item and summary details.",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      <GridBlock
        columns={2}
        gap="medium"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.imageGrid}
        cells={[
          {
            type: "text",
            innerPadding: true,
            content: (
              <Text size="s">
                The Tulli styleguide defines the visual system: a blue and
                yellow core palette, Gill Sans typography, and a 12-column grid
                for large screens and tablets. The image line follows Customs
                staff in action, captured from an observer's viewpoint to keep
                the focus on the work rather than the camera.
              </Text>
            ),
          },
          {
            type: "image",
            src: "/images/portfolio/tulli/pattern-library.jpg",
            alt: "Tulli UI pattern library",
            width: 1440,
            height: 4359,
            caption: "Pattern library and layout guidance for the service UI.",
          },
        ]}
      />
    </ProjectDetailLayout>
  );
}
