"use client";

import React from "react";
import Text from "@dt/Text";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import ProcessBlock from "../../../../patterns/ProcessBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { ProjectMetaSection } from "../../../../patterns/ProjectMetaSection";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiAdobeillustrator, SiAdobeindesign } from "react-icons/si";

import styles from "./finnishTransportAgency.module.css";

export function FinnishTransportAgencyPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("finnish-transport-agency");

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
            src: "/images/portfolio/finnish-transport-agency/hero.png",
            alt: "Finnish Transport Agency identity presentation",
            width: 1343,
            height: 729,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          variant="contained"
          showScrollIndicator={true}
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} maxItems={3} />}
      className={styles.page}
    >
      <ProjectMetaSection
        services={[
          "Brand Identity",
          "Logo System",
          "Visual Guidelines",
          "Multilingual Applications",
        ]}
        tools={[
          {
            key: "illustrator",
            icon: <SiAdobeillustrator size={24} />,
            name: "Illustrator",
          },
          {
            key: "indesign",
            icon: <SiAdobeindesign size={24} />,
            name: "InDesign",
          },
        ]}
        client={{
          name: "Finnish Transport Agency",
          logo: "/images/portfolio/finnish-transport-agency/logo.jpg",
        }}
        overview={
          <Text size="S">
            The Finnish Transport Agency (Liikennevirasto) combined the Maritime
            Administration, the Finnish Rail Administration, and the Road
            Administration into a single authority responsible for national
            travel and logistics.
            <br />
            <br />
            The identity system needed to unify this new organization with a
            visual language that works across print, signage, and digital
            services, while supporting Finnish, Swedish, and English
            communications.
          </Text>
        }
        background="muted"
        maxWidth="md"
      />

      <ProcessBlock
        sectionTitle="Design Methodology"
        phases={[
          {
            title: "Discovery & Audit",
            activities: [
              "Identity analysis of three merging agencies",
              "Visual asset inventory",
              "Stakeholder expectations",
              "Usage pattern review",
            ],
          },
          {
            title: "Concept Development",
            activities: [
              "Musical score/partiture metaphor",
              "Conductor positioning concept",
              "Moving word parts exploration",
              "New era signaling",
            ],
          },
          {
            title: "Identity System",
            activities: [
              "Trilingual logo variants",
              "Language descriptor lockups",
              "Four-color primary palette",
              "Felbridge Pro typography",
            ],
          },
          {
            title: "Guidelines & Rollout",
            activities: [
              "Five usage rules documented",
              "Protection zones defined",
              "Business card applications",
              "National signage preparation",
            ],
          },
        ]}
        columns={4}
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.processSection}
      />

      <StoryBlock
        subtitle="Identity System"
        title="A Consistent Visual Language"
        content={[
          <Text key="p1" size="S">
            The logotype interprets a musical score, positioning the agency as
            the conductor of Finland's transport system. The moving word parts
            form a unique, recognizable wordmark that signals a new era for the
            merged organization.
          </Text>,
          <Text key="p2" size="S">
            Bilingual and English logo variants are locked to their language
            descriptors, with strict protection zones around the mark to keep
            applications clear and consistent across services and documents.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/finnish-transport-agency/cards.jpg",
            alt: "Finnish Transport Agency business card applications",
            width: 1200,
            height: 801,
            caption: "Business card and identity applications.",
          },
          {
            src: "/images/portfolio/finnish-transport-agency/folders.jpg",
            alt: "Finnish Transport Agency folder and stationery applications",
            width: 1200,
            height: 801,
            caption: "Stationery applications across formats.",
          },
        ]}
        imageLayout="grid"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      <StoryBlock
        subtitle="Guidelines"
        title="Color and Typography Rules"
        content={[
          <Text key="p1" size="S">
            The palette is built from four primary colors supported by neutral
            grays and accent tones. Typography guidance clarifies text setting
            rules so long-form documents, signage, and digital interfaces remain
            readable across languages.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/finnish-transport-agency/website.png",
          alt: "Finnish Transport Agency website layout",
          width: 1024,
          height: 2025,
          caption: "Web layout explorations for public-facing services.",
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
              <Text size="S">
                The guidelines emphasize using official logo files, preserving
                proportions, keeping colors unchanged, and avoiding extra
                effects. The result is a system that scales across national
                infrastructure touchpoints without diluting the brand.
              </Text>
            ),
          },
          {
            type: "image",
            src: "/images/portfolio/finnish-transport-agency/typography.jpg",
            alt: "Finnish Transport Agency typography sample",
            width: 650,
            height: 433,
            caption: "Typography and system detail studies.",
          },
        ]}
      />
    </ProjectDetailLayout>
  );
}
