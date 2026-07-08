"use client";

import React from "react";
import { Text } from "@digitaltableteur/react";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import ProcessBlock from "../../../../patterns/ProcessBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { ProjectMetaSection } from "../../../../patterns/ProjectMetaSection";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { AdobeToolIcon } from "../AdobeToolIcon";

import styles from "./rawView.module.css";

export function RawViewPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("raw-view");

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
            src: "/images/portfolio/raw-view/hero.jpg",
            alt: "Raw View editorial spread preview",
            width: 2362,
            height: 1577,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          variant="contained"
          showScrollIndicator={true}
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} />}
      className={styles.page}
    >
      <ProjectMetaSection
        services={["Editorial Design", "Art Direction", "Publication Design", "Print Production"]}
        tools={[
          {
            key: "indesign",
            icon: <AdobeToolIcon tool="indesign" />,
            name: "InDesign",
          },
          {
            key: "illustrator",
            icon: <AdobeToolIcon tool="illustrator" />,
            name: "Illustrator",
          },
          {
            key: "photoshop",
            icon: <AdobeToolIcon tool="photoshop" />,
            name: "Photoshop",
          },
        ]}
        client={{ name: "Raw View" }}
        overview={
          <Text size="s">
            Raw View marks a new beginning for the former Photo Raw magazine. The
            relaunch shifted the publication into a bookazine format, expanded the
            page count to 160 pages, and introduced both English and Finnish
            editions alongside a new e-magazine and website.
            <br />
            <br />
            The editorial direction focuses on documentary photography that
            tackles complex social subjects. The visual system needed to be clear
            and dynamic so long-form photo essays remain immersive, while still
            supporting a non-commercial publication that keeps print culture
            alive.
          </Text>
        }
        background="muted"
        maxWidth="md"
      />

      <ProcessBlock
        sectionTitle="Design Process"
        phases={[
          {
            title: "Concept & Direction",
            activities: [
              "Editorial vision development",
              "Bookazine format definition",
              "Audience positioning",
              "Bilingual strategy (EN/FI)",
            ],
          },
          {
            title: "Visual System",
            activities: [
              "Typography hierarchy",
              "Layout grid design",
              "Photo essay pacing",
              "Color and tone system",
            ],
          },
          {
            title: "Production Design",
            activities: [
              "Print specifications",
              "Paper and binding selection",
              "160-page structure",
              "Cover design",
            ],
          },
          {
            title: "Launch & Distribution",
            activities: [
              "Print run coordination",
              "E-magazine setup",
              "Website integration",
              "Distribution channels",
            ],
          },
        ]}
        columns={4}
        backgroundColor="light"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.processSection}
      />

      <StoryBlock
        subtitle="Relaunch"
        title="A Bookazine for a New Era"
        content={[
          <Text key="p1" size="s">
            The relaunch from Photo Raw to Raw View was designed to signal a
            fresh start. Moving to a bookazine format allowed the team to deepen
            the storytelling with 160-page issues and a more book-like presence
            in print.
          </Text>,
          <Text key="p2" size="s">
            Each issue is published in both English and Finnish, with the print
            edition complemented by an e-magazine and website for wider reach.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/raw-view/book-cover.jpg",
          alt: "Raw View bookazine cover study",
          width: 2953,
          height: 2902,
          caption: "Cover study for the expanded bookazine format.",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      <StoryBlock
        subtitle="Editorial Vision"
        title="Documentary Photography First"
        content={[
          <Text key="p1" size="s">
            Raw View champions carefully crafted documentary projects that take
            an artistic approach to societal subjects. The goal is to inspire,
            stimulate, and entertain while staying grounded in journalistic
            integrity.
          </Text>,
          <Text key="p2" size="s">
            The magazine is intentionally non-commercial, supporting the
            photography community and preserving the tactile experience of
            print through thoughtful material and layout choices.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/raw-view/spread.jpg",
          alt: "Raw View interior spread",
          width: 3543,
          height: 971,
          caption: "Interior spread pacing long-form visual narratives.",
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
                The relaunch brought new contributors and an expanded editorial
                team, including international advisors and two photo editors.
                The visual appearance was shaped to feel clear, dynamic, and
                exciting while respecting the documentary voice of the
                publication.
              </Text>
            ),
          },
          {
            type: "image",
            src: "/images/portfolio/raw-view/hero.jpg",
            alt: "Raw View editorial spread",
            width: 2362,
            height: 1577,
            caption: "Visual system balancing clarity and editorial depth.",
          },
        ]}
      />

      <StoryBlock
        subtitle="Outcomes"
        title="A Platform for Documentary Photography"
        content={[
          <Text key="p1" size="s">
            The relaunch successfully transformed a photography magazine into a premium
            bookazine format, expanding from its original scope to 160 thoughtfully
            designed pages. Publishing in both English and Finnish editions opened the
            publication to international audiences while maintaining its Finnish roots.
          </Text>,
          <Text key="p2" size="s">
            Complementing print with an e-magazine and website ensures the documentary
            photography stories reach readers beyond traditional distribution. The visual
            system—designed to support immersive long-form photo essays—gives photographers
            a non-commercial platform that keeps print culture alive while adapting to
            how audiences consume visual journalism today.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.outcomesSection}
      />
    </ProjectDetailLayout>
  );
}
