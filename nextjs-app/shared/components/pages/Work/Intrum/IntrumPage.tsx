"use client";

import React from "react";
import Text from "@dt/Text";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { ProjectMetaSection } from "../../../../patterns/ProjectMetaSection";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiFigma, SiSketch, SiSlack } from "react-icons/si";

import styles from "./intrum.module.css";

export function IntrumPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("intrum");

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
            src: "/images/portfolio/intrum/hero.png",
            alt: "Intrum operations UI concept",
            width: 1440,
            height: 1024,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          date="2017"
          variant="contained"
          showScrollIndicator={true}
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} />}
      className={styles.page}
    >
      <ProjectMetaSection
        services={["UX Research", "Service Design", "Interaction Design", "Product Strategy"]}
        duration="2017"
        tools={[
          { key: "figma", icon: <SiFigma size={24} />, name: "Figma" },
          { key: "sketch", icon: <SiSketch size={24} />, name: "Sketch" },
          { key: "slack", icon: <SiSlack size={24} />, name: "Slack" },
        ]}
        client={{ name: "Intrum Justitia" }}
        overview={
          <Text size="s">
            The Compass program mapped Intrum Justitia's receivable life cycle
            and aligned teams across debt collection, debt surveillance, and
            legal affairs. The work combined business process mapping with deep
            user research across call centers and back-office teams.
            <br />
            <br />
            Personas and interviews highlighted major pain points: switching
            between multiple systems, client instructions stored in different
            locations, and payment plans that were difficult to complete while
            on calls. The goal was a unified workspace that guides actions and
            reduces manual work.
          </Text>
        }
        background="muted"
        maxWidth="md"
      />

      <StoryBlock
        subtitle="Research"
        title="Personas from the Call Center Floor"
        content={[
          <Text key="p1" size="s">
            Service advisors described daily work split between outbound calls,
            email shifts, and manual list management. Many tasks required
            jumping between Rekondis, Bevis, and SLS/LARE, which made it hard to
            keep context while speaking with debtors.
          </Text>,
          <Text key="p2" size="s">
            Pain points consistently pointed to fragmented instructions and the
            need for automation: payment plans were too complex to complete
            during a call, and critical information was buried behind too many
            clicks.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/intrum/payment-booking.png",
          alt: "Payment booking interface",
          width: 886,
          height: 687,
          caption: "Interface exploration for payment booking workflows.",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      <StoryBlock
        subtitle="Process Mapping"
        title="Aligning the Receivable Life Cycle"
        content={[
          <Text key="p1" size="s">
            Compass documented the full receivable journey from sales and
            invoicing through payment, collection, and legal affairs. The maps
            surfaced the differences between B2B and B2C collections, debt
            surveillance, and the handoffs into legal processes.
          </Text>,
          <Text key="p2" size="s">
            This clarity was essential for designing a shared system that could
            guide teams through the right actions at the right time.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/intrum/data-model.png",
          alt: "Receivable life cycle mapping",
          width: 1256,
          height: 806,
          caption: "Mapping the receivable lifecycle and system touchpoints.",
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
                The product direction focused on reducing paper-based tasks,
                automating daily call lists, and guiding users with the options
                each client actually allows. A unified system would keep
                critical data visible without constant context switching.
              </Text>
            ),
          },
          {
            type: "image",
            src: "/images/portfolio/intrum/process-template.png",
            alt: "Intrum process template",
            width: 1476,
            height: 260,
            caption: "Process templates to align teams on shared workflows.",
          },
        ]}
      />
    </ProjectDetailLayout>
  );
}
