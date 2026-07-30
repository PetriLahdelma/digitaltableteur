"use client";

import React from "react";
import { ProcessBlock, Text } from "@digitaltableteur/react";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { SiFigma, SiReact, SiTypescript, SiStorybook } from "react-icons/si";

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
          description="A comprehensive design system powering SAP Build Apps, SAP's flagship low-code platform (formerly AppGyver). Serving 300+ developers and designers who build consistent, accessible enterprise applications with a unified component library spanning Figma and ReactTS."
          image={{
            src: "/images/portfolio/sap-build-apps/storybook_front.png",
            alt: "SAP Build Apps design system component library overview",
            width: 1200,
            height: 600,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          liveUrl={project.liveUrl}
          variant="contained"
          showScrollIndicator={true}
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} />}
    >
      <ProjectMetaSection
        services={[
          "Design System Architecture",
          "Component Design",
          "Documentation",
          "Design-to-Code Translation",
        ]}
        duration="March 2022 – February 2026"
        tools={[
          { key: "figma", icon: <SiFigma size={24} />, name: "Figma" },
          { key: "react", icon: <SiReact size={24} />, name: "ReactTS" },
          { key: "typescript", icon: <SiTypescript size={24} />, name: "TypeScript" },
          { key: "storybook", icon: <SiStorybook size={24} />, name: "Storybook" },
        ]}
        team={[
          {
            name: "Petri Lahdelma",
            role: "Design System Lead",
            image: "/images/portfolio/helsinki-design-system/team/petri.png",
          },
          {
            name: "Hristo Meshinski",
            role: "Lead Developer",
            image: "/images/portfolio/sap-build-apps/team/hristo.png?v=2",
          },
          {
            name: "Pekka Turtola",
            role: "Senior Developer",
            image: "/images/portfolio/sap-build-apps/team/pekka.png?v=2",
          },
          {
            name: "Vili Karilas",
            role: "Developer",
            image: "/images/portfolio/sap-build-apps/team/vili.png?v=2",
          },
        ]}
        overview={
          <>
            <Text size="s">
              <span style={{ fontWeight: 600 }}>SAP Build Apps</span> is SAP&apos;s
              flagship low-code platform, evolved from AppGyver following its 2021
              acquisition. It enables business users and developers to create
              enterprise-grade applications with drag-and-drop UI, 400+ formula
              functions, and deep SAP BTP integration.
            </Text>
            <Text size="s">
              <span style={{ fontWeight: 600 }}>The challenge:</span> Create a
              unified design language that bridges the gap between design and
              development, enabling seamless handoff and consistent implementation
              across a distributed team serving 300+ developers and designers
              building applications for the platform used by enterprises worldwide.
            </Text>
          </>
        }
        background="muted"
      />

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

      <StoryBlock
        subtitle="The Challenge"
        title="Scaling Design Consistency"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>Serving 300+ developers and designers</span>{" "}
            working across multiple teams and time zones, maintaining visual
            consistency was becoming increasingly difficult. Components were
            being recreated with slight variations, leading to fragmented user
            experiences across a platform serving enterprise customers globally.
          </Text>,
          <Text key="2" size="s">
            The existing design files were scattered and lacked clear
            documentation, making onboarding new team members a time-consuming
            process. As enterprise adoption of low-code platforms accelerated,
            the platform needed a robust design foundation to scale.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      <StoryBlock
        subtitle="Approach"
        title="Centralized Component Lifecycle"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              We established the Design System Guild
            </span>
            , a cross-functional team responsible for maintaining and evolving
            the design system. This included designers, developers, and product
            managers who met bi-weekly to review proposals and prioritize work.
          </Text>,
          <Text key="2" size="s">
            Every component followed a defined lifecycle: from initial proposal
            through design exploration, development implementation,
            documentation, and finally release with proper versioning.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/sap-build-apps/workflow.png",
          alt: "Design system component lifecycle workflow from proposal to release",
          width: 738,
          height: 506,
          caption:
            "Component lifecycle: proposal - design - development - documentation - release",
        }}
        imageLayout="single"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      <StoryBlock
        subtitle="Foundation"
        title="Design Tokens & Visual Language"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              The foundation of the system was built on design tokens
            </span>{" "}
            as a shared language between design and code. Colors, spacing,
            typography, and other visual properties were defined once and
            consumed by both Figma and ReactTS, ensuring seamless integration
            with SAP BTP and compatibility with SAP&apos;s enterprise ecosystem.
          </Text>,
          <Text key="2" size="s">
            The SAP Horizon theme provided the base color system, with semantic
            tokens for consistent theming across light and dark modes. Typography
            followed a modular scale optimized for enterprise applications.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/sap-build-apps/colors.png",
            alt: "SAP Horizon semantic color tokens for light and dark themes",
            width: 738,
            height: 506,
            caption: "Semantic color tokens based on SAP Horizon theme",
          },
          {
            src: "/images/portfolio/sap-build-apps/icons.png",
            alt: "Icon library with consistent visual language",
            width: 738,
            height: 506,
            caption: "Unified iconography across the platform",
          },
          {
            src: "/images/portfolio/sap-build-apps/icon-search-function.webp",
            alt: "Icon component implementation with search and customization",
            width: 738,
            height: 506,
            caption: "Icon component with search functionality",
          },
          {
            src: "/images/portfolio/sap-build-apps/font.png?v=2",
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

      <StoryBlock
        subtitle="Components"
        title="Building the Library"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              Core components were designed with accessibility-first principles.
            </span>{" "}
            Each component included comprehensive states, variants, and detailed
            documentation of behavior patterns, all WCAG 2.1 AA compliant with
            keyboard navigation and screen reader support.
          </Text>,
          <Text key="2" size="s">
            The button system alone covered primary, secondary, ghost, and
            destructive variants, each with hover, active, focus, and disabled
            states across multiple sizes. The library grew to 100+ components
            covering form controls, data display, navigation, and feedback patterns.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/sap-build-apps/buttons_hires.png",
            alt: "Button component variants showing primary, secondary, ghost, and destructive states with all interaction states",
            width: 1476,
            height: 506,
            caption: "Button system with all variants and interaction states",
          },
          {
            src: "/images/portfolio/sap-build-apps/message_popover.png?v=2",
            alt: "Message popover component with semantic variants for error, warning, success, and info states",
            width: 738,
            height: 506,
            caption: "Semantic message variants with form integration",
          },
          {
            src: "/images/portfolio/sap-build-apps/table.png",
            alt: "Table component with sorting, filtering, and data management features",
            width: 738,
            height: 506,
            caption: "Table component with hundreds of features and addons",
          },
          {
            src: "/images/portfolio/sap-build-apps/chat_bubble.png",
            alt: "Chat bubble component for conversational AI interfaces",
            width: 738,
            height: 506,
            caption: "Chat bubble component for AI-powered interactions",
          },
        ]}
        imageLayout="grid"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      <StoryBlock
        subtitle="Data Components"
        title="Tables & Data Visualization"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              I led the design and specification of a comprehensive table component
            </span>{" "}
            supporting sorting, filtering, pagination, row selection, and column
            configuration. Optimized for large enterprise datasets with thousands
            of rows, the table includes full keyboard navigation and screen reader
            support, built for seamless integration with SAP data sources including
            S/4HANA and OData services.
          </Text>,
          <Text key="2" size="s">
            <span style={{ fontWeight: 600 }}>
              Data visualization components for analytics dashboards
            </span>{" "}
            included bar, line, pie, donut, and area chart variants. All charts
            were designed to be responsive and accessible with proper color contrast
            and pattern alternatives for colorblind users, consistent with SAP
            Horizon theme tokens.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/sap-build-apps/table.png",
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
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      <StoryBlock
        subtitle="Enterprise Ready"
        title="SAP BTP Integration"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              Deployment on SAP Business Technology Platform (BTP)
            </span>{" "}
            required components optimized for enterprise-grade performance. The
            design system integrated with SAP backend services including S/4HANA,
            SuccessFactors, and third-party systems via REST and OData, supporting
            real-time data flows common in low-code applications.
          </Text>,
          <Text key="2" size="s">
            Each component was built to handle large datasets while maintaining
            performance and accessibility, ensuring consistent user experiences
            across the diverse applications built with SAP Build Apps.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      <GridBlock
        columns={2}
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
                <Text size="l">100+ Components</Text>
                <Text size="s">
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
                <Text size="l">300+ Served</Text>
                <Text size="s">
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
                <Text size="l">Design-to-Code Parity</Text>
                <Text size="s">
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
                <Text size="l">Accessibility First</Text>
                <Text size="s">
                  WCAG 2.1 AA compliant components with keyboard navigation and
                  screen reader support.
                </Text>
              </>
            ),
          },
        ]}
      />

      <StoryBlock
        subtitle="Results"
        title="Impact & Outcomes"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>
              Over nearly four years, the design system transformed how the team
              builds UI
            </span>{" "}
            from fragmented component recreation to a unified library with 100+
            production-ready components. Design-to-development handoff improved
            through 1:1 Figma-to-code parity and comprehensive Storybook
            documentation.
          </Text>,
          <Text key="2" size="s">
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
