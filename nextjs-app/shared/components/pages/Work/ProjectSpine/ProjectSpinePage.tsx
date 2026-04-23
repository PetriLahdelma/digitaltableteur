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
import { SiNodedotjs, SiTypescript } from "react-icons/si";

import styles from "./project-spine.module.css";

export function ProjectSpinePage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("project-spine");

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ProjectDetailLayout
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title="Project Spine"
          description="An OSS CLI that compiles a client brief, a repo, and optional design-system inputs into a repo-native, machine-readable operating layer for humans and AI coding agents. One command, 19 structured files, zero hosted dependencies."
          image={{
            src: "/images/portfolio/project-spine/hero.png",
            alt: "Project Spine wordmark: bold pink retro display type with dark starfield shadow on blue background",
            width: 2358,
            height: 1544,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          date="April 2026"
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
              <h3 className={styles.metaLabel}>Type</h3>
              <p className={styles.metaText}>Open-source CLI tool (MIT)</p>
            </div>
            <div className={styles.metaBlock}>
              <h3 className={styles.metaLabel}>Version</h3>
              <p className={styles.metaText}>v0.9.x (alpha, feature-complete for PRD v0.1)</p>
            </div>
            <div className={styles.metaBlock}>
              <h3 className={styles.metaLabel}>Stack</h3>
              <div className={styles.metaTools}>
                <SiTypescript size={24} title="TypeScript (strict)" />
                <SiNodedotjs size={24} title="Node 20+" />
              </div>
            </div>
            <div className={styles.metaBlock}>
              <h3 className={styles.metaLabel}>Links</h3>
              <p className={styles.metaText}>
                <a href="https://projectspine.dev" target="_blank" rel="noopener noreferrer">projectspine.dev</a>
                {" · "}
                <a href="https://github.com/PetriLahdelma/project-spine" target="_blank" rel="noopener noreferrer">GitHub</a>
              </p>
            </div>
          </div>
          <div className={styles.metaRight}>
            <h3 className={styles.metaLabel}>Overview</h3>
            <p className={styles.metaOverview}>
              <strong>Developers save ~10 hours/week with AI tools and lose ~10 hours/week to fragmented context</strong> (Atlassian 2025 DevEx). Only ~5% of repos contain AI configuration files. The 5% that do typically use boilerplate generators that drift from reality immediately.
            </p>
            <p className={styles.metaOverview}>
              <strong>Project Spine closes that gap.</strong> It reads your actual brief, scans the repo for framework signals, ingests design tokens (DTCG or Tokens Studio), and compiles everything into 19 structured files that AI coding agents consume on the first prompt.
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <ProcessBlock
        phases={[
          {
            title: "Ingestion",
            activities: [
              "Client brief (brief.md)",
              "Repo scan (framework signals)",
              "Design tokens (DTCG/Tokens Studio)",
              "Template selection (6 built-in)",
            ],
          },
          {
            title: "Compilation",
            activities: [
              "Normalize brief → spine.json",
              "Profile repo structure",
              "Resolve token aliases (10-hop)",
              "Generate component plan",
            ],
          },
          {
            title: "Export",
            activities: [
              "Agent discovery layer (root)",
              "11 markdown exports",
              "Hashed export manifest",
              "Source pointers for traceability",
            ],
          },
          {
            title: "Drift Detection",
            activities: [
              "SHA-256 per export file",
              "spine drift check",
              "spine drift diff",
              "CI-blocking on hand-edits",
            ],
          },
        ]}
        sectionTitle="How it works"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        columns={4}
      />

      {/* Inputs: with banner */}
      <StoryBlock
        subtitle="Inputs"
        title="Brief + Repo + Tokens"
        content={[
          <Text key="1" size="S">
            <span style={{ fontWeight: 600 }}>brief.md</span>. A client or product brief. Can be hand-written or scaffolded from one of six built-in templates: saas-marketing, saas-dashboard, saas-auth, agency-site, ecommerce, b2b-marketing.
          </Text>,
          <Text key="2" size="S">
            <span style={{ fontWeight: 600 }}>Repo directory</span>. Scanned for <code>package.json</code>, <code>tsconfig.json</code>, and framework signals. Spine doesn&apos;t need you to describe your stack; it reads it.
          </Text>,
          <Text key="3" size="S">
            <span style={{ fontWeight: 600 }}>tokens.json</span> (optional). DTCG or Tokens Studio format, auto-detected. Nested groups flattened to dotted paths. Aliases resolved recursively with a 10-hop cap.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/project-spine/banner.png",
          alt: "Terminal screenshot of spine init scaffolding a saas-marketing brief, with the ASCII Project Spine wordmark above the compiled output log",
          width: 2200,
          height: 1470,
          caption: "spine init --template saas-marketing: one command scaffolds a production-shape brief",
        }}
        imageLayout="single"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Outputs: with tree visualization */}
      <StoryBlock
        subtitle="Outputs"
        title="19 files per compile"
        content={[
          <Text key="1" size="S">
            <span style={{ fontWeight: 600 }}>Tool-discovery layer at repo root</span>. <code>AGENTS.md</code>, <code>CLAUDE.md</code>, <code>.github/copilot-instructions.md</code>. The paths where Claude Code, Cursor, and GitHub Copilot look first. Spine writes them with repo-specific content, not boilerplate.
          </Text>,
          <Text key="2" size="S">
            <span style={{ fontWeight: 600 }}>Full compiled layer under <code>.project-spine/</code></span>. Architecture summary, brief summary, component plan, QA guardrails, rationale, route inventory, scaffold plan, sprint-1 backlog, plus the canonical <code>spine.json</code> and hashed <code>export-manifest.json</code>.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/project-spine/tree.png",
          alt: "Project Spine compiled output tree: 19 files organized under .project-spine/ with agent discovery layer at repo root",
          width: 1270,
          height: 760,
          caption: "Compiled output tree: agent discovery layer + 11 markdown exports + manifest",
        }}
        imageLayout="single"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Drift detection: with drift-diff screenshot */}
      <StoryBlock
        subtitle="Enforcement"
        title="Drift detection as first-class"
        content={[
          <Text key="1" size="S">
            <span style={{ fontWeight: 600 }}>Drift detection is first-class.</span> <code>spine drift check --fail-on any</code> exits non-zero if any export has been hand-edited since the last compile. <code>spine drift diff</code> shows exactly what changed. The hashed manifest makes this deterministic. No fuzzy matching, no false positives.
          </Text>,
          <Text key="2" size="S">
            The same instinct Rhythmguard applies to spacing values, Spine applies to compiled context. If the brief changes but the exports don&apos;t, the pipeline catches it.
          </Text>,
        ]}
        images={{
          src: "/images/portfolio/project-spine/drift-diff.png",
          alt: "Project Spine drift diff output: unified diff between last-compiled state and current state of each export",
          width: 1270,
          height: 760,
          caption: "spine drift diff: unified diff between compiled and current state",
        }}
        imageLayout="single"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Design systems angle */}
      <StoryBlock
        subtitle="Design Systems"
        title="Why design systems are the highest-leverage context"
        content={[
          <Text key="1" size="S">
            <span style={{ fontWeight: 600 }}>Token dictionaries, component APIs, naming conventions.</span> This is the difference between an AI agent that generates consistent UI and one that generates noise. Spine records source pointers in <code>spine.json</code> so every downstream rule is traceable back to the token definition.
          </Text>,
          <Text key="2" size="S">
            Spine does not transform tokens to platform code. That&apos;s Style Dictionary&apos;s job. It consumes tokens as input signal so the compiled operating layer references the right values. Complementary to token transformers, not competitive.
          </Text>,
        ]}
        imageLayout="none"
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
                <Text size="L">19 Files</Text>
                <Text size="S">Per compile. Agent discovery layer + full compiled operating context + hashed manifest.</Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="L">121 Tests</Text>
                <Text size="S">Vitest suite. TypeScript strict mode. No runtime telemetry. No hosted dependency.</Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="L">6 Templates</Text>
                <Text size="S">Production-shape briefs: SaaS marketing, dashboard, auth, agency, ecommerce, B2B.</Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="L">Repo-Native</Text>
                <Text size="S">Outputs are markdown in the repo, versioned like code. No external service, no vendor lock-in.</Text>
              </>
            ),
          },
        ]}
      />

      {/* Positioning */}
      <StoryBlock
        subtitle="Positioning"
        title="Not a scaffolder, not a doc generator"
        content={[
          <Text key="1" size="S">
            <span style={{ fontWeight: 600 }}>AGENTS.md generators</span> dump boilerplate. Spine reads the actual brief + repo + tokens and produces repo-specific content. <span style={{ fontWeight: 600 }}>Design token transformers</span> emit platform code. Spine consumes tokens as input signal. <span style={{ fontWeight: 600 }}>Hosted AI project management</span> requires a service. Spine is local-first, repo-native, OSS.
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
