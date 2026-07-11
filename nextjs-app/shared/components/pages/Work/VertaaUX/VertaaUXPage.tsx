"use client";

import React from "react";
import { Text, Title } from "@digitaltableteur/react";
import { Mermaid } from "../../../Mermaid";
import ProcessBlock from "../../../../patterns/ProcessBlock";
import StoryBlock from "../../../../patterns/StoryBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiFigma } from "react-icons/si";
import { ClaudeIcon } from "../../../AskAI/ai-icons";
import { AdobeToolIcon } from "../AdobeToolIcon";

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
            src: "/images/portfolio/vertaaux/hero-checkmark.webp",
            alt: "VertaaUX — glass checkmark icon with ethereal green smoke on dark background",
            width: 2752,
            height: 1536,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          date="December 2025–Present"
          liveUrl={project.liveUrl}
          variant="contained"
          showScrollIndicator={true}
          className={styles.hero}
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} />}
      className={styles.page}
    >
      {/* Project Meta - Custom 2-column layout */}
      <section className={styles.metaSection}>
        <div className={styles.metaGrid}>
          <div className={styles.metaLeft}>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Services</Title>
              <p className={styles.metaText}>
                Product Strategy, UX Intelligence, Accessibility and Brand Identity
              </p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Duration</Title>
              <p className={styles.metaText}>2025–Present</p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Tools used</Title>
              <div className={styles.metaTools}>
                <SiFigma size={24} title="Figma" />
                <ClaudeIcon width={24} height={24} aria-label="Claude AI" />
                <AdobeToolIcon tool="illustrator" />
              </div>
            </div>
          </div>
          <div className={styles.metaRight}>
            <Title as="h3" unstyled className={styles.metaLabel}>Overview</Title>
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
          <Text key="p1" size="s">
            Most digital products fail because the experience is confusing,
            unclear, inaccessible, or unoptimized. Traditional UX audits are
            slow, expensive, manual, and often inconsistent.
          </Text>,
          <Text key="p2" size="s">
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
            themeColors={{ color: "#00FFCC", nodeBg: "#111111", lineColor: "#111111" }}
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
            <Text key="p1" size="s">
              <span style={{ fontWeight: 600 }}>
                The technical foundation combines predictive modeling with
                real-time analysis, running 90+ automated checks in under 30 seconds.
              </span>{" "}
              This is 25x faster than initial performance targets, with simple
              sites completing in just seconds.
            </Text>,
            <Text key="p2" size="s">
              The hierarchical AI system coordinates specialized agents for each
              audit dimension, producing severity-weighted findings that help
              teams prioritize by business impact rather than arbitrary severity
              levels.
            </Text>,
          ]}
          images={{
            src: "/images/portfolio/vertaaux/screenshot-audit-results.png",
            alt: "VertaaUX audit results interface showing scores across usability, clarity, and accessibility dimensions",
            width: 1920,
            height: 1080,
            caption: "Audit results with severity-weighted findings across seven dimensions.",
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
            <Text key="p1" size="s">
              The engine analyzes pages across seven key dimensions: usability
              scoring based on Nielsen heuristics and cognitive load, clarity
              analysis including visual hierarchy and CTA effectiveness,
              information architecture assessment, and full WCAG 2.2 accessibility
              compliance checking.
            </Text>,
            <Text key="p2" size="s">
              Each dimension produces a 0-100 score with severity-weighted findings,
              enabling teams to prioritize fixes by impact. The hierarchical AI
              system coordinates 15+ specialized agents to deliver comprehensive
              coverage that would take human reviewers days to complete.
            </Text>,
          ]}
          images={{
            src: "/images/portfolio/vertaaux/screenshot-detailed-analysis.png",
            alt: "VertaaUX detailed analysis view showing individual findings with severity, selectors, and fix recommendations",
            width: 1920,
            height: 1080,
            caption: "Detailed analysis — severity-weighted findings with inspectable evidence.",
          }}
          imageLayout="single"
          backgroundColor="transparent"
          maxWidth="md"
          spacing="comfortable"
        />
      </div>

      {/* Brand Identity - updated to reflect current guidelines */}
      <StoryBlock
        subtitle="Brand Identity"
        title="Visual Language for UX Intelligence"
        content={[
          <Text key="p1" size="s">
            <span style={{ fontWeight: 600 }}>
              For dev teams who treat accessibility as craft, not compliance.
            </span>{" "}
            The brand identity is built on three pillars: Evidence-First
            (every finding backed by inspectable data), Quiet Confidence
            (the product speaks through clarity and measured output), and
            Craft Over Compliance (accessibility as a discipline, not a checklist).
          </Text>,
          <Text key="p2" size="s">
            Typography pairs Geist Sans for everything human with Geist Mono
            for everything data — scores, selectors, code references. The neon
            teal (#00FFCC) accent is used as a signal color, never decorative.
            Dark-biased surfaces let the data breathe.
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
            <div className={`${styles.logoCardDark} ${styles.logoCardMark}`}>
              <img
                src="/images/portfolio/vertaaux/logo-mint-on-black.svg"
                alt="VertaaUX mint teal logo on dark background"
                className={styles.logoImageMark}
                width={512}
                height={512}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className={styles.logoCaption}>Primary — dark background</figcaption>
          </figure>
          <figure className={styles.logoCard}>
            <div className={`${styles.logoCardLight} ${styles.logoCardMark}`}>
              <img
                src="/images/portfolio/vertaaux/logo-mint-on-white.svg"
                alt="VertaaUX mint teal logo on light background"
                className={styles.logoImageMark}
                width={512}
                height={512}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className={styles.logoCaption}>Primary — light background</figcaption>
          </figure>
          <figure className={styles.logoCard}>
            <div className={`${styles.logoCardDark} ${styles.logoCardMark}`}>
              <img
                src="/images/portfolio/vertaaux/logo-on-black.svg"
                alt="VertaaUX mono logo on black"
                className={styles.logoImageMark}
                width={512}
                height={512}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className={styles.logoCaption}>Mono — On black</figcaption>
          </figure>
          <figure className={styles.logoCard}>
            <div className={`${styles.logoCardLight} ${styles.logoCardMark}`}>
              <img
                src="/images/portfolio/vertaaux/logo-on-white.svg"
                alt="VertaaUX logo on light background"
                className={styles.logoImageMark}
                width={512}
                height={512}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className={styles.logoCaption}>Mono — On white</figcaption>
          </figure>
        </div>
        <div className={`${styles.logoGrid} ${styles.logoGridWordmarks}`}>
          <figure className={styles.logoCard}>
            <div className={`${styles.logoCardDark} ${styles.logoCardWordmark}`}>
              <img
                src="/images/portfolio/vertaaux/wordmark-on-black.svg"
                alt="VertaaUX wordmark with mint logo on black"
                className={styles.logoImageWordmark}
                width={1346}
                height={416}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className={styles.logoCaption}>Wordmark — On black</figcaption>
          </figure>
          <figure className={styles.logoCard}>
            <div className={`${styles.logoCardLight} ${styles.logoCardWordmark}`}>
              <img
                src="/images/portfolio/vertaaux/wordmark-on-white.svg"
                alt="VertaaUX wordmark with mint logo on white"
                className={styles.logoImageWordmark}
                width={1346}
                height={416}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className={styles.logoCaption}>Wordmark — On white</figcaption>
          </figure>
          <figure className={styles.logoCard}>
            <div className={`${styles.logoCardDark} ${styles.logoCardWordmark}`}>
              <img
                src="/images/portfolio/vertaaux/wordmark-white-on-black.svg"
                alt="VertaaUX wordmark white on black"
                className={styles.logoImageWordmark}
                width={1346}
                height={416}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className={styles.logoCaption}>Wordmark mono — On black</figcaption>
          </figure>
          <figure className={styles.logoCard}>
            <div className={`${styles.logoCardLight} ${styles.logoCardWordmark}`}>
              <img
                src="/images/portfolio/vertaaux/wordmark-black-on-white.svg"
                alt="VertaaUX wordmark black on white"
                className={styles.logoImageWordmark}
                width={1346}
                height={416}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className={styles.logoCaption}>Wordmark mono — On white</figcaption>
          </figure>
        </div>
      </div>

      {/* Color — extracted palette elements */}
      <StoryBlock
        subtitle="Color"
        title="The Palette"
        content={[
          <Text key="p1" size="s">
            Dark-biased surfaces with neon teal (#00FFCC) as a signal color — used
            sparingly for CTAs, scores, and key data. Never decorative. Semantic
            score states map to Excellent, Good, Fair, and Poor with WCAG AA
            contrast on all surfaces.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />
      <div className={styles.paletteSection}>
        <p className={styles.paletteSectionTitle}>Dark theme (Default)</p>
        <img
          src="/images/portfolio/vertaaux/brand/palette-dark-theme.png"
          alt="VertaaUX dark theme palette — Neon Teal #00FFCC, Near Black #0D0D0D, Card Surface #141414, Near White #F2F2F2"
          width={956}
          height={181}
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      <div className={styles.paletteSection}>
        <p className={styles.paletteSectionTitle}>Light theme</p>
        <img
          src="/images/portfolio/vertaaux/brand/palette-light-theme.png"
          alt="VertaaUX light theme palette — Muted Teal #00CCAA, Warm Ink #1A1A1A, White #FFFFFF, Warm White #F7F5F0"
          width={956}
          height={181}
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      <div className={styles.paletteSection}>
        <p className={styles.paletteSectionTitle}>Score state colors</p>
        <img
          src="/images/portfolio/vertaaux/brand/palette-score-states.png"
          alt="VertaaUX score state colors — Excellent #10B981, Good #3B82F6, Fair #F59E0B, Poor #EF4444"
          width={956}
          height={181}
          style={{ width: "100%", height: "auto" }}
        />
      </div>

      {/* Typography — extracted elements */}
      <StoryBlock
        subtitle="Typography"
        title="The Type System"
        content={[
          <Text key="p1" size="s">
            Geist Sans for everything human. Geist Mono for everything data.
            The font pairing has clear semantic roles — Sans for prose, headings,
            and UI labels; Mono for scores, selectors, code references, and
            technical metadata.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/vertaaux/brand/type-pairing-rule.png",
          alt: "VertaaUX type pairing rule — Geist Sans for everything human, Geist Mono for everything data",
          width: 1280,
          height: 96,
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      {/* Font waterfall — Geist Sans & Mono at descending sizes */}
      <div className={styles.fontWaterfall}>
        <div className={styles.waterfallColumn}>
          <span className={styles.waterfallLabel}>Geist Sans</span>
          {[
            { sizeClass: styles.waterfallSize4xl, text: "Aa" },
            { sizeClass: styles.waterfallSize2xl, text: "The quick brown fox" },
            { sizeClass: styles.waterfallSizeXl, text: "Jumps over the lazy dog" },
            { sizeClass: styles.waterfallSizeLg, text: "Score 76 / 100 — Solid foundation" },
            {
              sizeClass: styles.waterfallSizeMd,
              text: "Audit completed in 2.7 s · 91 checks passed · 4 dimensions analyzed",
            },
            {
              sizeClass: styles.waterfallSizeSpecimen,
              text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789",
              wrap: true,
            },
          ].map(({ sizeClass, text, wrap }) => (
            <p
              key={text}
              className={`${styles.waterfallSansLine} ${sizeClass}${wrap ? ` ${styles.waterfallWrap}` : ""}`}
            >
              {text}
            </p>
          ))}
        </div>
        <div className={styles.waterfallColumn}>
          <span className={styles.waterfallLabel}>Geist Mono</span>
          {[
            { sizeClass: styles.waterfallSize4xl, text: "Aa" },
            { sizeClass: styles.waterfallSize2xl, text: "76 / 100" },
            { sizeClass: styles.waterfallSizeXl, text: "wcag-2.2-aa" },
            { sizeClass: styles.waterfallSizeLg, text: 'aria-label="navigation"' },
            {
              sizeClass: styles.waterfallSizeMd,
              text: "div.hero > section.cta > button.primary { color: #00E5A0 }",
            },
            {
              sizeClass: styles.waterfallSizeSpecimen,
              text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789",
              wrap: true,
            },
          ].map(({ sizeClass, text, wrap }) => (
            <p
              key={text}
              className={`${styles.waterfallMonoLine} ${sizeClass}${wrap ? ` ${styles.waterfallWrap}` : ""}`}
            >
              {text}
            </p>
          ))}
        </div>
      </div>

      {/* UI Components — extracted individual elements */}
      <StoryBlock
        subtitle="Interface"
        title="The Components"
        content={[
          <Text key="p1" size="s">
            Neon glow as a signature effect on primary CTAs — used sparingly,
            max one per screen. Score badges, metric cards, and issue rows follow
            a consistent 8px card radius, 4px input radius system.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        className={styles.storySection}
      />

      <div className={styles.brandImageGrid}>
        <figure className={styles.brandFigure}>
          <img
            src="/images/portfolio/vertaaux/brand/ui-score-badge.png"
            alt="VertaaUX circular score badge showing 66/100 overall score with yellow progress arc"
            className={styles.brandImage}
          />
          <figcaption className={styles.brandCaption}>Score badge</figcaption>
        </figure>
        <figure className={styles.brandFigure}>
          <img
            src="/images/portfolio/vertaaux/brand/ui-metric-card.png"
            alt="VertaaUX score card showing Usability Score 76/100 with confidence badge, progress bar, and Solid foundation rating"
            className={styles.brandImage}
          />
          <figcaption className={styles.brandCaption}>Metric card</figcaption>
        </figure>
        <figure className={styles.brandFigure}>
          <img
            src="/images/portfolio/vertaaux/brand/ui-issue-row.png"
            alt="VertaaUX issue detail card showing missing alt text error with severity badges, business impact grid, and fix priority"
            className={styles.brandImage}
          />
          <figcaption className={styles.brandCaption}>Issue row</figcaption>
        </figure>
      </div>

      {/* Product — Dashboard */}
      <StoryBlock
        subtitle="Product"
        title="Dashboard Experience"
        content={[
          <Text key="p1" size="s">
            The interface prioritizes clarity and speed, presenting complex UX
            data in an instantly scannable format. Users can run guest audits
            without creating an account, or sign in to access audit history,
            shareable reports, and team collaboration features.
          </Text>,
          <Text key="p2" size="s">
            Enterprise plans include SAML SSO, multi-tenant support, API access,
            and developer documentation for integration into existing CI/CD
            pipelines and quality assurance workflows.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/vertaaux/screenshot-dashboard.png",
          alt: "Person using VertaaUX dashboard on a laptop, showing score trends, audit history, and team activity",
          width: 2000,
          height: 1333,
          caption: "Dashboard — audit history, scores, and team collaboration.",
        }}
        imageLayout="single"
        backgroundColor="light"
        maxWidth="lg"
        spacing="comfortable"
        className={`${styles.storySection} ${styles.roundedImage}`}
      />

      {/* Key Metrics */}
      <section className={styles.metricsSection}>
        <div className={styles.metricsContent}>
          <Title level={3}>Key Metrics</Title>
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
              <span className={styles.metricValue}>&lt;30s</span>
              <span className={styles.metricLabel}>Audit Speed</span>
              <span className={styles.metricDetail}>
                Full audit in under a minute, simple sites in seconds
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
          <Text key="p1" size="s">
            <span style={{ fontWeight: 600 }}>
              VertaaUX.ai launched in 2025 and is now in production.
            </span>{" "}
            The platform combines comprehensive brand identity design with an
            AI-powered UX intelligence engine that delivers 2x higher accuracy
            than industry benchmarks and completes audits 25x faster than
            original performance targets.
          </Text>,
          <Text key="p2" size="s">
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
