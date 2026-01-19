"use client";

import React from "react";
import Text from "@dt/Text";
import ProcessBlock from "../../../../patterns/ProcessBlock";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
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
            src: "/images/portfolio/vertaaux/computer-mockup-on-colorful-background.jpeg",
            alt: "VertaaUX product interface on colorful gradient background",
            width: 6126,
            height: 4595,
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
      {/* Project Meta - Custom 2-column layout */}
      <section className={styles.metaSection}>
        <div className={styles.metaGrid}>
          <div className={styles.metaLeft}>
            <div className={styles.metaBlock}>
              <h3 className={styles.metaLabel}>Services</h3>
              <p className={styles.metaText}>
                Product Strategy, UX Intelligence, Accessibility and Brand Identity
              </p>
            </div>
            <div className={styles.metaBlock}>
              <h3 className={styles.metaLabel}>Duration</h3>
              <p className={styles.metaText}>2025–Present</p>
            </div>
            <div className={styles.metaBlock}>
              <h3 className={styles.metaLabel}>Tools used</h3>
              <div className={styles.metaTools}>
                <SiFigma size={24} title="Figma" />
                <SiAdobeillustrator size={24} title="Illustrator" />
              </div>
            </div>
          </div>
          <div className={styles.metaRight}>
            <h3 className={styles.metaLabel}>Overview</h3>
            <p className={styles.metaOverview}>
              <strong>VertaaUX.ai</strong> is a real-time, predictive UX intelligence
              engine. The product delivers a one-click UX audit with instant insights
              on usability, clarity, accessibility, and conversion performance. The
              audit runs in under 1.5 seconds and produces a prioritized UX report
              that teams can act on without deep UX or accessibility expertise.
            </p>
            <p className={styles.metaOverview}>
              <strong>The goal:</strong> Establish a UX Score the industry can
              adopt, similar to PageSpeed for performance or Lighthouse for
              accessibility, making professional-grade UX insights accessible
              to every team.
            </p>
          </div>
        </div>
      </section>

      {/* Process methodology phases - styled for AI startup feel */}
      <div className={styles.processSection}>
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
      </div>

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
        className={styles.storySectionAlt}
      />

      {/* The Approach - technical foundation */}
      <StoryBlock
        subtitle="The Approach"
        title="AI-Driven UX Analysis"
        content={[
          <Text key="p1" size="S">
            <span style={{ fontWeight: 600 }}>
              The technical foundation combines predictive modeling with
              real-time analysis.
            </span>{" "}
            Each audit runs in under 1.5 seconds, delivering instant insights
            that would typically require hours of manual review.
          </Text>,
          <Text key="p2" size="S">
            By simulating user behavior across key dimensions (usability,
            clarity, accessibility, and conversion), the engine produces a
            precise, prioritized UX score that teams can act on immediately.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/vertaaux/computer-mockup-on-colorful-background.jpeg",
          alt: "VertaaUX one-click UX audit interface showing usability score, clarity analysis, and AI assessment features",
          width: 6126,
          height: 4595,
          caption: "The VertaaUX product delivers one-click UX audits with instant insights.",
        }}
        imageLayout="single"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Brand Identity - expanded with logo variations */}
      <StoryBlock
        subtitle="Brand Identity"
        title="Visual Language for UX Intelligence"
        content={[
          <Text key="p1" size="S">
            <span style={{ fontWeight: 600 }}>
              The mission is to make world-class UX accessible to every team.
            </span>{" "}
            The brand identity needed to communicate trust, precision, and
            intelligence while remaining approachable for teams without deep UX
            expertise.
          </Text>,
          <Text key="p2" size="S">
            The goal is to establish a UX Score the industry can adopt, similar
            to PageSpeed for performance or Lighthouse for accessibility. The
            visual language reflects this ambition with a clean, data-driven
            aesthetic.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/vertaaux/gradient-logo@2x.png",
            alt: "VertaaUX gradient logo on dark background",
            width: 512,
            height: 512,
            caption: "Primary gradient logo mark",
          },
          {
            src: "/images/portfolio/vertaaux/black-logo@2x.png",
            alt: "VertaaUX logo in black for light backgrounds",
            width: 512,
            height: 512,
            caption: "Black logo for light backgrounds",
          },
          {
            src: "/images/portfolio/vertaaux/white-logo@2x.png",
            alt: "VertaaUX logo in white for dark backgrounds",
            width: 512,
            height: 512,
            caption: "White logo for dark backgrounds",
          },
          {
            src: "/images/portfolio/vertaaux/round-logo-gradient@2x.png",
            alt: "VertaaUX round logo mark with gradient",
            width: 512,
            height: 512,
            caption: "Circular logo mark for social and icons",
          },
        ]}
        imageLayout="grid"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.brandSection}
      />

      {/* Product mockup */}
      <StoryBlock
        subtitle="Product"
        title="Dashboard Experience"
        content={[
          <Text key="p1" size="S">
            The interface prioritizes clarity and speed, presenting complex UX
            data in an instantly scannable format that teams can act on.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/vertaaux/macbook-pro-gradient.jpeg",
          alt: "VertaaUX product on colorful gradient background",
          width: 738,
          height: 506,
          caption: "Product presentation mockup",
        }}
        imageLayout="single"
        backgroundColor="light"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Results & Impact - outcomes section */}
      <StoryBlock
        subtitle="Results & Impact"
        title="Building the Future of UX Assessment"
        content={[
          <Text key="p1" size="S">
            <span style={{ fontWeight: 600 }}>
              VertaaUX.ai is currently in active development (2025-Present).
            </span>{" "}
            The product combines comprehensive brand identity design with an
            AI-powered UX intelligence platform, positioning the product to
            transform how teams approach experience optimization.
          </Text>,
          <Text key="p2" size="S">
            With audit speeds under 1.5 seconds and coverage across usability,
            clarity, accessibility, and conversion metrics, the platform aims to
            democratize UX expertise, making professional-grade insights
            accessible to teams without dedicated UX specialists.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.outcomesSection}
      />
    </ProjectDetailLayout>
  );
}
