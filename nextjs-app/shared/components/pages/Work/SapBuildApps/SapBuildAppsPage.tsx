"use client";

import React from "react";
import Text from "@dt/Text";
import ProcessBlock from "../../../../patterns/ProcessBlock";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { SiFigma, SiReact, SiTypescript, SiStorybook } from "react-icons/si";

// Patterns from Phase 08-2
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { ProjectMetaSection } from "../../../../patterns/ProjectMetaSection";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";

export function SapBuildAppsPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("sap-build-apps");

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ProjectDetailLayout
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title={project.title}
          description="A comprehensive design system powering SAP Build Apps — SAP's flagship low-code platform (formerly AppGyver). Serving 300+ developers and designers who build consistent, accessible enterprise applications with a unified component library spanning Figma and ReactTS."
          image={{
            src: "/images/portfolio/sap-build-apps/hero-background.webp",
            alt: "SAP Build Apps design system component library overview",
            width: 1200,
            height: 600,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          variant="contained"
          showScrollIndicator={true}
        />
      }
      relatedProjects={
        <RelatedProjects currentSlug={project.slug} maxItems={3} />
      }
    >
      {/* Project metadata */}
      <ProjectMetaSection
        services={[
          "Design System Architecture",
          "Component Design",
          "Documentation",
          "Design-to-Code Translation",
        ]}
        duration="March 2022 – February 2026"
        tools={[
          {
            key: "figma",
            icon: <SiFigma size={24} />,
            name: "Figma",
          },
          {
            key: "react",
            icon: <SiReact size={24} />,
            name: "ReactTS",
          },
          {
            key: "typescript",
            icon: <SiTypescript size={24} />,
            name: "Design Tokens",
          },
          {
            key: "storybook",
            icon: <SiStorybook size={24} />,
            name: "Storybook",
          },
        ]}
        team={[
          {
            name: "Petri Lahdelma",
            role: "Lead UX Designer / Design System Architect",
            image: "/images/portfolio/sap-build-apps/team/petri.png",
          },
        ]}
        overview={
          <Text size="S">
            <span style={{ fontWeight: 600 }}>SAP Build Apps</span> is SAP&apos;s
            flagship low-code platform, evolved from AppGyver following its 2021
            acquisition. It enables business users and developers to create
            enterprise-grade applications with drag-and-drop UI, 400+ formula
            functions, and deep SAP BTP integration.
            <br /> <br />
            <span style={{ fontWeight: 600 }}>The challenge:</span> Create a
            unified design language that bridges the gap between design and
            development, enabling seamless handoff and consistent implementation
            across a distributed team serving 300+ developers and designers building applications
            for the platform used by enterprises worldwide.
          </Text>
        }
        background="muted"
      />

      {/* Process phases */}
      <ProcessBlock
        phases={[
          {
            title: "Discovery & Audit",
            activities: [
              "Component inventory",
              "Pattern documentation",
              "Stakeholder interviews",
              "Accessibility audit",
            ],
          },
          {
            title: "System Architecture",
            activities: [
              "Token structure design",
              "Component hierarchy",
              "Naming conventions",
              "Workflow definition",
            ],
          },
          {
            title: "Component Design",
            activities: [
              "Core components",
              "Variant systems",
              "State documentation",
              "Responsive patterns",
            ],
          },
          {
            title: "Implementation",
            activities: [
              "ReactTS components",
              "Storybook documentation",
              "Contribution guidelines",
              "Quality assurance",
            ],
          },
        ]}
        sectionTitle="Process"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        columns={4}
      />

      {/* Story Block 1: The Challenge */}
      <StoryBlock
        subtitle="The Challenge"
        title="Scaling Design Consistency"
        content={[
          <Text key="1" size="S">
            <span style={{ fontWeight: 600 }}>Serving 300+ developers and designers</span>{" "}
            working across multiple teams and time zones, maintaining visual
            consistency was becoming increasingly difficult. Components were
            being recreated with slight variations, leading to fragmented user
            experiences across a platform serving enterprise customers globally.
          </Text>,
          <Text key="2" size="S">
            The existing design files were scattered and lacked clear
            documentation, making onboarding new team members a time-consuming
            process. With Gartner predicting 70% of enterprise applications will
            use low-code by 2025, the platform needed a robust design foundation
            to scale.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Story Block 2: Approach */}
      <StoryBlock
        subtitle="Approach"
        title="Centralized Component Lifecycle"
        content={[
          <Text key="1" size="S">
            <span style={{ fontWeight: 600 }}>
              I established a Design System Guild
            </span>{" "}
            — a cross-functional team responsible for maintaining and evolving
            the design system. This included designers, developers, and product
            managers who met bi-weekly to review proposals and prioritize work.
          </Text>,
          <Text key="2" size="S">
            Every component followed a defined lifecycle: from initial proposal
            through design exploration, development implementation,
            documentation, and finally release with proper versioning.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/sap-build-apps/lifecycle-and-workflow.webp",
          alt: "Design system component lifecycle workflow from proposal to release",
          width: 738,
          height: 506,
          caption: "Component lifecycle: proposal - design - development - documentation - release",
        }}
        imageLayout="single"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Story Block 3: Foundation */}
      <StoryBlock
        subtitle="Foundation"
        title="Design Tokens & Visual Language"
        content={[
          <Text key="1" size="S">
            <span style={{ fontWeight: 600 }}>
              The foundation of the system was built on design tokens
            </span>{" "}
            — a shared language between design and code. Colors, spacing,
            typography, and other visual properties were defined once and
            consumed by both Figma and ReactTS, ensuring seamless integration
            with SAP BTP and compatibility with SAP's enterprise ecosystem.
          </Text>,
          <Text key="2" size="S">
            The SAP Horizon theme provided the base color system, with semantic
            tokens for consistent theming across light and dark modes. Typography
            followed a modular scale optimized for enterprise applications.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/sap-build-apps/colors.webp",
            alt: "SAP Horizon semantic color tokens for light and dark themes",
            width: 738,
            height: 506,
            caption: "Semantic color tokens based on SAP Horizon theme",
          },
          {
            src: "/images/portfolio/sap-build-apps/iconography.webp",
            alt: "Icon library with consistent visual language",
            width: 738,
            height: 506,
            caption: "Unified iconography across the platform",
          },
          {
            src: "/images/portfolio/sap-build-apps/typography.webp",
            alt: "Typography scale showing font families, sizes, and weights for enterprise readability",
            width: 738,
            height: 506,
            caption: "Modular typography scale optimized for enterprise applications",
          },
        ]}
        imageLayout="grid"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Story Block 4: Components */}
      <StoryBlock
        subtitle="Components"
        title="Building the Library"
        content={[
          <Text key="1" size="S">
            <span style={{ fontWeight: 600 }}>
              Core components were designed with accessibility-first principles.
            </span>{" "}
            Each component included comprehensive states, variants, and detailed
            documentation of behavior patterns — all WCAG 2.1 AA compliant with
            keyboard navigation and screen reader support.
          </Text>,
          <Text key="2" size="S">
            The button system alone covered primary, secondary, ghost, and
            destructive variants — each with hover, active, focus, and disabled
            states across multiple sizes. The library grew to 100+ components
            covering form controls, data display, navigation, and feedback patterns.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/sap-build-apps/buttons.webp",
            alt: "Button component variants showing primary, secondary, ghost, and destructive states",
            width: 738,
            height: 506,
            caption: "Button system with all variants and interaction states",
          },
          {
            src: "/images/portfolio/sap-build-apps/button-construction.webp",
            alt: "Button component anatomy showing padding, icon placement, and text alignment",
            width: 738,
            height: 506,
            caption: "Button construction guidelines for consistent implementation",
          },
        ]}
        imageLayout="grid"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Story Block 5: Enterprise Integration */}
      <StoryBlock
        subtitle="Enterprise Ready"
        title="SAP Ecosystem Integration"
        content={[
          <Text key="1" size="S">
            <span style={{ fontWeight: 600 }}>
              Enterprise applications are data-heavy.
            </span>{" "}
            The design system supported robust table components with sorting,
            filtering, pagination, and row selection. Data visualization
            components were optimized for integration with SAP S/4HANA,
            SuccessFactors, and third-party data sources via REST and OData.
          </Text>,
          <Text key="2" size="S">
            Each component was built for large datasets while maintaining
            performance and accessibility, supporting the real-time data flows
            common in enterprise low-code applications deployed on SAP BTP.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/sap-build-apps/table-component.webp",
            alt: "Table component with sorting, filtering, pagination, and row selection features",
            width: 738,
            height: 506,
            caption: "Data table component for enterprise data display",
          },
          {
            src: "/images/portfolio/sap-build-apps/data-visualization.webp",
            alt: "Data visualization charts and graphs for analytics dashboards",
            width: 738,
            height: 506,
            caption: "Data visualization components for analytics integration",
          },
        ]}
        imageLayout="grid"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Impact metrics grid */}
      <GridBlock
        columns={4}
        gap="none"
        maxWidth="lg"
        spacing="comfortable"
        backgroundColor="light"
        cells={[
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="L">100+ Components</Text>
                <Text size="S">
                  Comprehensive library covering form controls, data display,
                  navigation, feedback, and layout patterns.
                </Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="L">300+ Served</Text>
                <Text size="S">
                  Design system serving 300+ developers and designers building
                  enterprise applications worldwide.
                </Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="L">Design-to-Code Parity</Text>
                <Text size="S">
                  1:1 mapping between Figma components and ReactTS
                  implementations with shared tokens.
                </Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="L">Accessibility First</Text>
                <Text size="S">
                  WCAG 2.1 AA compliant components with keyboard navigation and
                  screen reader support.
                </Text>
              </>
            ),
          },
        ]}
      />

      {/* Conclusion */}
      <StoryBlock
        subtitle="Results"
        title="Impact & Outcomes"
        content={[
          <Text key="1" size="S">
            <span style={{ fontWeight: 600 }}>
              Over nearly four years, the design system transformed how the team
              builds UI
            </span>{" "}
            — from fragmented component recreation to a unified library with 100+
            production-ready components. Design-to-development handoff improved
            through 1:1 Figma-to-code parity and comprehensive Storybook
            documentation.
          </Text>,
          <Text key="2" size="S">
            The unified system continues to evolve with SAP Build Apps. The
            design system serves as the foundation for the platform&apos;s UI,
            maintained through a structured component lifecycle and regular
            releases.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />
    </ProjectDetailLayout>
  );
}
