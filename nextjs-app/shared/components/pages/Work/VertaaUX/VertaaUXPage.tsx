"use client";

import React from "react";
import Text from "@dt/Text";
import ProcessBlock from "../../../../patterns/ProcessBlock";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { ProjectMetaSection } from "../../../../patterns/ProjectMetaSection";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiFigma, SiAdobeillustrator } from "react-icons/si";

import styles from "./vertaaux.module.css";

export function VertaaUXPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("vertaaux");

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
            src: "/images/portfolio/vertaaux/hero.png",
            alt: "VertaaUX brand mark",
            width: 1020,
            height: 1018,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          date="2025-Present"
          variant="contained"
          showScrollIndicator={true}
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} maxItems={3} />}
      className={styles.page}
    >
      <ProjectMetaSection
        services={[
          "Product Strategy",
          "UX Intelligence",
          "Accessibility",
          "Brand Identity",
        ]}
        duration="2025-Present"
        tools={[
          { key: "figma", icon: <SiFigma size={24} />, name: "Figma" },
          {
            key: "illustrator",
            icon: <SiAdobeillustrator size={24} />,
            name: "Illustrator",
          },
        ]}
        client={{
          name: "VertaaUX",
          logo: "/images/portfolio/vertaaux/logo.png",
        }}
        overview={
          <Text size="S">
            VertaaUX.ai is a real-time, predictive UX intelligence engine. The
            product delivers a one-click UX audit with instant insights on
            usability, clarity, accessibility, and conversion performance.
            <br />
            <br />
            The audit runs in under 1.5 seconds and produces a prioritized UX
            report that teams can act on without deep UX or accessibility
            expertise.
          </Text>
        }
        background="muted"
        maxWidth="md"
      />

      {/* Process methodology phases */}
      <ProcessBlock
        phases={[
          {
            title: "Research & Strategy",
            activities: [
              "UX audit methodology",
              "Competitive analysis",
              "User research",
              "Market positioning",
            ],
          },
          {
            title: "AI Model Development",
            activities: [
              "Predictive models",
              "Scoring algorithms",
              "Validation testing",
              "Performance optimization",
            ],
          },
          {
            title: "Brand Identity",
            activities: [
              "Logo design",
              "Visual language",
              "Brand positioning",
              "Identity system",
            ],
          },
          {
            title: "Product Design",
            activities: [
              "UI/UX design",
              "Interaction patterns",
              "Dashboard design",
              "User flows",
            ],
          },
        ]}
        sectionTitle="Process"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        columns={4}
      />

      <StoryBlock
        subtitle="Why This Matters"
        title="UX Audits Are Slow and Subjective"
        content={[
          <Text key="p1" size="S">
            Most digital products fail because the experience is confusing,
            unclear, inaccessible, or unoptimized. Traditional UX audits are
            slow, expensive, manual, and often inconsistent.
          </Text>,
          <Text key="p2" size="S">
            VertaaUX compresses that timeline into seconds, delivering
            actionable UX direction without heavy consulting overhead.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/vertaaux/hero.png",
          alt: "VertaaUX brand mark",
          width: 1020,
          height: 1018,
          caption: "Brand mark for the VertaaUX.ai product.",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      <StoryBlock
        subtitle="How It Works"
        title="Predictive UX Models"
        content={[
          <Text key="p1" size="S">
            The engine simulates user behavior with predictive models covering
            structure, cognitive load, visual attention, semantic structure,
            keyboard accessibility, and conversion opportunities.
          </Text>,
          <Text key="p2" size="S">
            The result is a precise, prioritized UX score that helps teams fix
            issues before they hit production.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
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
              <Text size="S">
                The mission is to make world-class UX accessible to every team
                and establish a UX Score the industry can adopt, similar to
                PageSpeed for performance or Lighthouse for accessibility.
              </Text>
            ),
          },
          {
            type: "image",
            src: "/images/portfolio/vertaaux/logo.png",
            alt: "VertaaUX primary logo",
            width: 512,
            height: 512,
            caption: "Primary logo lockup and proportions.",
          },
        ]}
      />
    </ProjectDetailLayout>
  );
}
