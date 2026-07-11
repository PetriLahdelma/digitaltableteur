"use client";

import React from "react";
import { CodeSnippet, Text, Title } from "@digitaltableteur/react";
import ProcessBlock from "../../../../patterns/ProcessBlock";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiNodedotjs, SiTypescript, SiNpm } from "react-icons/si";

import styles from "./rhythmguard.module.css";

const RHYTHMGUARD_STRICT_CONFIG_SNIPPET = `npm i -D stylelint stylelint-plugin-rhythmguard

# .stylelintrc.json
{
  "extends": ["stylelint-plugin-rhythmguard/configs/strict"]
}

npx stylelint "src/**/*.css"`;

export function RhythmguardPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("rhythmguard");

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ProjectDetailLayout
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title="Rhythmguard"
          description="A Stylelint plugin that enforces spacing scales and design token usage across CSS declarations and Tailwind class strings. Three rules, all with autofix. The enforcement layer that turns a design system from a suggestion into a contract."
          image={{
            src: "/images/portfolio/rhythmguard/hero.png",
            alt: "Rhythmguard wordmark: monospace |Rhythmguard| lockup centered on a near-black background",
            width: 1800,
            height: 896,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          date="December 2025–Present"
          liveUrl={project.liveUrl}
          variant="contained"
          showScrollIndicator={true}
          className="pb-16 tablet:pb-20 desktop:pb-24"
        />
      }
      relatedProjects={<RelatedProjects currentSlug={project.slug} />}
      className={styles.page}
    >
      {/* Meta */}
      <section className={styles.metaSection}>
        <div className={styles.metaGrid}>
          <div className={styles.metaLeft}>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Type</Title>
              <p className={styles.metaText}>Open-source Stylelint plugin (MIT)</p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Version</Title>
              <p className={styles.metaText}>v2.0.1</p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Stack</Title>
              <div className={styles.metaTools}>
                <SiNodedotjs size={24} title="Node.js" />
                <SiTypescript size={24} title="TypeScript" />
                <SiNpm size={24} title="npm" />
              </div>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Links</Title>
              <p className={styles.metaText}>
                <a href="https://www.npmjs.com/package/stylelint-plugin-rhythmguard" target="_blank" rel="noopener noreferrer">npm</a>
                {" · "}
                <a href="https://github.com/PetriLahdelma/stylelint-plugin-rhythmguard" target="_blank" rel="noopener noreferrer">GitHub</a>
              </p>
            </div>
          </div>
          <div className={styles.metaRight}>
            <Title as="h3" unstyled className={styles.metaLabel}>Overview</Title>
            <p className={styles.metaOverview}>
              <strong>Every design system ships a spacing scale.</strong> Almost none enforce it. Documentation says &ldquo;use <code>--space-16</code>&rdquo; but <code>padding: 14px</code> compiles just fine. Over months, the codebase drifts from the system. Auditing manually doesn&apos;t scale. Existing linters check syntax, not semantics.
            </p>
            <p className={styles.metaOverview}>
              <strong>Rhythmguard is the enforcement layer.</strong> It catches spacing drift (arbitrary pixel values that violate a configured scale or bypass design tokens) and autofixes them at lint time, before the PR is opened. The only tool that governs the actual values in both CSS declarations and Tailwind arbitrary brackets.
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <ProcessBlock
        phases={[
          {
            title: "Token Ingestion",
            activities: [
              "DTCG JSON parsing",
              "Tokens Studio format",
              "CSS custom properties",
              "Tailwind @theme blocks",
            ],
          },
          {
            title: "Declaration Scanning",
            activities: [
              "PostCSS walkDecls",
              "Property group filtering",
              "Reverse token lookup",
              "Scale proximity check",
            ],
          },
          {
            title: "Violation Reporting",
            activities: [
              "Nearest scale value",
              "Token replacement suggestion",
              "Contextual messages",
              "CI-friendly JSON output",
            ],
          },
          {
            title: "Autofix",
            activities: [
              "Raw → token reference",
              "Off-scale → nearest step",
              "Source-aware output format",
              "Zero manual migration",
            ],
          },
        ]}
        sectionTitle="How it works"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        columns={4}
      />

      {/* Installation: with step 1 scene */}
      <StoryBlock
        subtitle="Installation"
        title="Install and extend the strict config"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>One install, one extends line.</span> The strict config turns Rhythmguard on immediately across the codebase, so off-scale spacing and raw token bypasses fail before review.
          </Text>,
          <Text key="2" size="s">
            Shared config replaces ad-hoc spacing rules spread across files. The strict preset ships with sensible defaults; <code>init</code> and <code>doctor</code> pick up from there when the team wants stack-specific configuration.
          </Text>,
          <CodeSnippet
            key="strict-config-snippet"
            code={RHYTHMGUARD_STRICT_CONFIG_SNIPPET}
            language="bash"
            variant="multi"
            allowCopy
            showLineNumbers={false}
            maxLines={0}
            aria-label="Rhythmguard strict config install commands"
          />,
        ]}
        images={{
          src: "/images/portfolio/rhythmguard/scene-1.png",
          alt: "Rhythmguard step 1 of 6: install + strict config. Terminal shows npm install, .stylelintrc.json extending the strict preset, and the three rules (use-scale, prefer-token, no-offscale-transform).",
          width: 1920,
          height: 1080,
          caption: "Step 1: install stylelint-plugin-rhythmguard and extend the strict config",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Three Rules: with rules diagram */}
      <StoryBlock
        subtitle="Core Rules"
        title="Three rules, all with autofix"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>use-scale</span>. Every spacing value must be on the configured scale. Write <code>margin-top: 13px</code>, get autofixed to <code>12px</code>. Supports 17 built-in scales including 4pt grid, 8pt grid, Material 8dp, Atlassian, Carbon 2x, Fibonacci, and golden ratio.
          </Text>,
          <Text key="2" size="s">
            <span style={{ fontWeight: 600 }}>prefer-token</span>. Raw literal values must use design tokens. Write <code>padding: 16px</code>, get autofixed to <code>var(--spacing-4)</code>. Builds token maps from four sources with cascade precedence.
          </Text>,
          <Text key="3" size="s">
            <span style={{ fontWeight: 600 }}>no-offscale-transform</span>. Transform translations must be on scale. The same discipline applied to <code>translateX</code> and <code>translateY</code> values, which are easy to miss in manual review.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/rhythmguard/scene-2.png",
          alt: "Rhythmguard use-scale rule: LOCK TO SCALE. Every spacing value gets checked. Autofix maps to nearest safe scale step.",
          width: 1920,
          height: 1080,
          caption: "use-scale rule: catches off-scale values and autofixes to nearest step",
        }}
        imageLayout="single"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Token Sources: with prefer-token scene */}
      <StoryBlock
        subtitle="Token Intelligence"
        title="Multi-format token ingestion"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>Rhythmguard reads tokens from wherever your team defines them</span>, not just one format. DTCG JSON with nested <code>$value</code> groups? Parsed recursively. Tailwind v4 <code>@theme</code> blocks? PostCSS traverses them natively. CSS custom properties? Scanned from your stylesheet.
          </Text>,
          <Text key="2" size="s">
            Autofix output is source-aware: tokens from <code>@theme</code> emit <code>var(--spacing-4)</code>, tokens from Tailwind JS config emit <code>theme(spacing.4)</code>. The developer gets the right reference for their stack without knowing the underlying token format.
          </Text>,
        ]}
        images={[
          {
            src: "/images/portfolio/rhythmguard/scene-3.png",
            alt: "Rhythmguard prefer-token rule: TOKENS FIRST. Raw pixels become design tokens via tokenMap automatic replacements.",
            width: 1920,
            height: 1080,
            caption: "prefer-token: raw values autofixed to token references",
          },
          {
            src: "/images/portfolio/rhythmguard/scene-4.png",
            alt: "Rhythmguard no-offscale-transform rule: transform translations enforced on scale.",
            width: 1920,
            height: 1080,
            caption: "no-offscale-transform: same discipline for CSS transforms",
          },
        ]}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Ecosystem: with Tailwind scene */}
      <StoryBlock
        subtitle="Ecosystem"
        title="Beyond CSS: Tailwind & ESLint"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>The ESLint companion catches drift in JSX too.</span> A separate export provides the <code>tailwind-class-use-scale</code> rule. It checks every string literal, automatically covering <code>cn()</code>, <code>clsx()</code>, <code>cva()</code>, <code>twMerge()</code>, and JSX <code>className</code>. <code>p-[13px]</code> becomes <code>p-[12px]</code>.
          </Text>,
          <Text key="2" size="s">
            Seven shipped config presets, from <code>migration</code> (lenient) to <code>strict</code> (scale + tokens + transforms) to <code>react-tailwind</code> (Tailwind + CSS Modules + Next.js ignores). Framework snippets for Vue, Lit, Astro, and SvelteKit.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/rhythmguard/scene-5.png",
          alt: "Rhythmguard Tailwind integration: arbitrary class scanning and config presets.",
          width: 1920,
          height: 1080,
          caption: "Tailwind v4 integration with @theme block token extraction",
        }}
        imageLayout="single"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* CLI + audit */}
      <StoryBlock
        subtitle="Developer Experience"
        title="CLI: audit, init, doctor"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>npx rhythmguard audit</span> scans a directory for scale drift (off-scale values, token opportunities) and outputs JSON for CI. Know exactly how much spacing debt exists before you start enforcing.
          </Text>,
          <Text key="2" size="s">
            <span style={{ fontWeight: 600 }}>npx rhythmguard init</span> detects your stack and writes the right config. <span style={{ fontWeight: 600 }}>npx rhythmguard doctor</span> validates the setup: Stylelint installed, config valid, token pattern compiles. Zero-friction onboarding.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/rhythmguard/scene-6.png",
          alt: "Rhythmguard CLI tools: audit, init, doctor commands for developer onboarding.",
          width: 1920,
          height: 1080,
          caption: "CLI tools: audit for drift analysis, init for setup, doctor for validation",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Metrics */}
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
                <Text size="l">3 Rules</Text>
                <Text size="s">use-scale, prefer-token, no-offscale-transform. Each with full autofix.</Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">17 Scale Presets</Text>
                <Text size="s">4pt grid, 8pt grid, Material, Atlassian, Carbon, Fibonacci, golden ratio, and custom.</Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">7 Config Presets</Text>
                <Text size="s">From migration to strict to react-tailwind. Framework support for Vue, Lit, Astro, SvelteKit.</Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">269 Downloads/mo</Text>
                <Text size="s">npm weekly installs. Zero runtime dependencies. CJS + ESM dual. Stylelint 16 &amp; 17.</Text>
              </>
            ),
          },
        ]}
      />

      {/* Positioning */}
      <StoryBlock
        subtitle="Positioning"
        title="The only value-level linter"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>Rhythmguard is not a class sorter, not a token transformer, not a Tailwind class linter.</span> It&apos;s the only tool that governs actual values in both CSS declarations and Tailwind arbitrary brackets. Where Project Spine says &ldquo;use <code>--spacing-4</code>&rdquo;, Rhythmguard catches developers who don&apos;t.
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
