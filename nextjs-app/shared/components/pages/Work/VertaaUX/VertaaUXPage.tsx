"use client";

import React from "react";
import Text from "@dt/Text";
import Title from "@dt/Title";
import { Mermaid } from "../../../Mermaid";
import ProcessBlock from "../../../../patterns/ProcessBlock";
import StoryBlock from "../../../../patterns/StoryBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiFigma, SiAdobeillustrator } from "react-icons/si";
import { ClaudeIcon } from "../../../AskAI/ai-icons";

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
          liveUrl={project.liveUrl}
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
                <ClaudeIcon width={24} height={24} aria-label="Claude AI" />
                <SiAdobeillustrator size={24} title="Illustrator" />
              </div>
            </div>
          </div>
          <div className={styles.metaRight}>
            <h3 className={styles.metaLabel}>Overview</h3>
            <p className={styles.metaOverview}>
              <strong>VertaaUX.ai</strong> is an automated UX intelligence platform
              that delivers comprehensive a11y- and UX-audits. Using 15+
              specialized AI agents and 91+ automated checks, it analyzes usability,
              clarity, information architecture, and WCAG 2.2 accessibility compliance
              without requiring deep UX expertise.
            </p>
            <p className={styles.metaOverview}>
              <strong>The goal:</strong> Establish a UX Score the industry can
              adopt, similar to PageSpeed for performance or Lighthouse for
              accessibility. The platform achieves 2x higher accuracy than
              industry benchmarks with less than 5% false positive rate on
              accessibility findings.
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
          <Mermaid
            key="mindmap"
            chart={`mindmap
  root((Traditional UX Audits))
    Time & Cost
      2-4 weeks timeline
      $5K-50K per audit
      Requires UX specialists
      Scheduling bottlenecks
    Inconsistency
      Subjective opinions
      Reviewer bias
      No standardized scoring
      Hard to compare
    Limited Scope
      Manual review only
      Samples, not full coverage
      Misses edge cases
      No real-time updates
    Actionability Gap
      Vague recommendations
      No prioritization
      Unclear ROI
      Implementation friction`}
            className={styles.problemMindmap}
          />,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* The Approach - technical foundation + How It Works */}
      <div className={styles.approachSection}>
        <StoryBlock
          subtitle="The Approach"
          title="AI-Driven UX Analysis"
          content={[
            <Text key="p1" size="S">
              <span style={{ fontWeight: 600 }}>
                The technical foundation combines predictive modeling with
                real-time analysis, running 91+ automated checks in 40-90 seconds.
              </span>{" "}
              This is 25x faster than initial performance targets, with simple
              sites completing in just seconds.
            </Text>,
            <Text key="p2" size="S">
              The hierarchical AI system coordinates specialized agents for each
              audit dimension, producing severity-weighted findings that help
              teams prioritize by business impact rather than arbitrary severity
              levels.
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
          backgroundColor="transparent"
          maxWidth="md"
          spacing="comfortable"
        />

        <StoryBlock
          subtitle="How It Works"
          title="Seven Audit Dimensions"
          content={[
            <Text key="p1" size="S">
              The engine analyzes pages across seven key dimensions: usability
              scoring based on Nielsen heuristics and cognitive load, clarity
              analysis including visual hierarchy and CTA effectiveness,
              information architecture assessment, and full WCAG 2.2 accessibility
              compliance checking.
            </Text>,
            <Text key="p2" size="S">
              Each dimension produces a 0-100 score with severity-weighted findings,
              enabling teams to prioritize fixes by impact. The hierarchical AI
              system coordinates 15+ specialized agents to deliver comprehensive
              coverage that would take human reviewers days to complete.
            </Text>,
          ]}
          imageLayout="none"
          backgroundColor="transparent"
          maxWidth="md"
          spacing="comfortable"
        />
      </div>

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
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Logo variations grid — updated brand identity */}
      <div className={styles.logoGridSection}>
        <div className={styles.logoGrid}>
          <figure className={styles.logoCard}>
            <div className={styles.logoCardDark}>
              <img
                src="/images/portfolio/vertaaux/logo-mint-on-black.svg"
                alt="VertaaUX mint teal logo on dark background"
                className={styles.logoImage}
              />
            </div>
            <figcaption className={styles.logoCaption}>Primary — dark background</figcaption>
          </figure>
          <figure className={styles.logoCard}>
            <div className={styles.logoCardLight}>
              <img
                src="/images/portfolio/vertaaux/logo-on-white.svg"
                alt="VertaaUX logo on light background"
                className={styles.logoImage}
              />
            </div>
            <figcaption className={styles.logoCaption}>Primary — light background</figcaption>
          </figure>
          <figure className={styles.logoCard}>
            <div className={styles.logoCardDark}>
              <img
                src="/images/portfolio/vertaaux/logo-on-black.svg"
                alt="VertaaUX mono logo on black"
                className={styles.logoImage}
              />
            </div>
            <figcaption className={styles.logoCaption}>Mono — black</figcaption>
          </figure>
          <figure className={styles.logoCard}>
            <div className={styles.logoCardDark}>
              <img
                src="/images/portfolio/vertaaux/logo-new.svg"
                alt="VertaaUX mark only — mint teal geometric V"
                className={styles.logoImageRound}
              />
            </div>
            <figcaption className={styles.logoCaption}>Mark only</figcaption>
          </figure>
        </div>
      </div>

      {/* Product mockup */}
      <StoryBlock
        subtitle="Product"
        title="Dashboard Experience"
        content={[
          <Text key="p1" size="S">
            The interface prioritizes clarity and speed, presenting complex UX
            data in an instantly scannable format. Users can run guest audits
            without creating an account, or sign in to access audit history,
            shareable reports, and team collaboration features.
          </Text>,
          <Text key="p2" size="S">
            Enterprise plans include SAML SSO, multi-tenant support, API access,
            and developer documentation for integration into existing CI/CD
            pipelines and quality assurance workflows.
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

      {/* Key Metrics */}
      <section className={styles.metricsSection}>
        <div className={styles.metricsContent}>
          <Title level={3} terminals="sans">Key Metrics</Title>
          <div className={styles.metricsGrid}>
            <div className={styles.metricItem}>
              <span className={styles.metricValue}>91+</span>
              <span className={styles.metricLabel}>Automated Checks</span>
              <span className={styles.metricDetail}>
                Comprehensive coverage across all audit dimensions
              </span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricValue}>15+</span>
              <span className={styles.metricLabel}>AI Agents</span>
              <span className={styles.metricDetail}>
                Specialized models for each audit dimension
              </span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricValue}>&lt;5%</span>
              <span className={styles.metricLabel}>False Positive Rate</span>
              <span className={styles.metricDetail}>
                2x more accurate than industry benchmarks
              </span>
            </div>
            <div className={styles.metricItem}>
              <span className={styles.metricValue}>40-90s</span>
              <span className={styles.metricLabel}>Audit Speed</span>
              <span className={styles.metricDetail}>
                25x faster than original performance targets
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Results & Impact - outcomes section */}
      <StoryBlock
        subtitle="Results & Impact"
        title="Building the Future of AI driven UX Assessment"
        content={[
          <Text key="p1" size="S">
            <span style={{ fontWeight: 600 }}>
              VertaaUX.ai launched in 2025 and is now in production.
            </span>{" "}
            The platform combines comprehensive brand identity design with an
            AI-powered UX intelligence engine that delivers 2x higher accuracy
            than industry benchmarks and completes audits 25x faster than
            original performance targets.
          </Text>,
          <Text key="p2" size="S">
            With 91+ automated checks across seven audit dimensions and WCAG 2.2
            compliance testing with less than 5% false positive rate, the platform
            democratizes UX expertise for teams without dedicated specialists.
            Enterprise customers benefit from SAML SSO, API access, and GDPR-
            compliant data handling.
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
