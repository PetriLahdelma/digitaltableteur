"use client";

import React from "react";
import { ProcessBlock, Text, Title } from "@digitaltableteur/react";
import StoryBlock from "../../../../patterns/StoryBlock";
import GridBlock from "../../../../patterns/GridBlock";
import { ProjectDetailLayout } from "../../../../patterns/ProjectDetailLayout";
import { ProjectHero } from "../../../../patterns/ProjectHero";
import { RelatedProjects } from "../../../../patterns/RelatedProjects";
import { ProjectNav } from "../../../ProjectNav";
import { getProjectBySlug } from "../../../../data/projects";
import { SiTypescript, SiNpm, SiGithubactions } from "react-icons/si";

import styles from "./llm-component-schema.module.css";

/**
 * Hand-crafted SVG of the contract pipeline.
 * Designed for portfolio use: native SVG text (no foreignObject scaling issues),
 * perfect centering via text-anchor/dominant-baseline, blue on transparent,
 * edge labels with section-bg backdrops so they mask the connector cleanly.
 */
function ContractPipelineDiagram() {
  const blue = "#4A90E2";
  const node = { rx: 4, stroke: blue, strokeWidth: 1.5, fill: "transparent" } as const;
  const nodeText = {
    textAnchor: "middle" as const,
    dominantBaseline: "central" as const,
    stroke: "none",
    fill: blue,
    fontSize: 16,
    fontWeight: 500,
  };
  const edgeLabelText = {
    textAnchor: "middle" as const,
    dominantBaseline: "central" as const,
    stroke: "none",
    fill: blue,
    fontSize: 14,
    fontStyle: "italic" as const,
  };
  const edgeLabelBg = {
    fill: "var(--color-light-bg)",
    stroke: "none",
    rx: 2,
  };
  const connector = {
    fill: "none",
    stroke: blue,
    strokeWidth: 1.5,
  };

  return (
    <figure className={styles.pipelineDiagram}>
      <svg
        viewBox="0 0 800 640"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="pipelineDiagramTitle"
        className={styles.pipelineSvg}
      >
        <title id="pipelineDiagramTitle">
          Contract pipeline: Governance Templates review the Component Schema, which drives the AI Coding Agent to produce a Generated Component. The CLI runs validate and drift-check, the Eval Harness scores the output, and the CI Gate either releases immutable artifacts (pass) or returns control to the Agent (fail).
        </title>

        <defs>
          <marker
            id="pipeline-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={blue} />
          </marker>
        </defs>

        <g fontFamily='"Geist", "Geist Sans", system-ui, sans-serif'>
          {/* Dashed connectors (meta-layer: reviews, scores) */}
          <g {...connector} strokeDasharray="5 5">
            <line x1="180" y1="60" x2="306" y2="60" markerEnd="url(#pipeline-arrow)" />
            <line x1="560" y1="285" x2="494" y2="285" markerEnd="url(#pipeline-arrow)" />
          </g>

          {/* Solid connectors (main pipeline + fail loop) */}
          <g {...connector} strokeLinejoin="round">
            <line x1="400" y1="85" x2="400" y2="146" markerEnd="url(#pipeline-arrow)" />
            <line x1="400" y1="195" x2="400" y2="256" markerEnd="url(#pipeline-arrow)" />
            <path d="M 340 310 C 340 340, 270 340, 270 366" markerEnd="url(#pipeline-arrow)" />
            <path d="M 460 310 C 460 340, 530 340, 530 366" markerEnd="url(#pipeline-arrow)" />
            <path d="M 290 420 C 290 455, 345 465, 353 491" markerEnd="url(#pipeline-arrow)" />
            <path d="M 510 420 C 510 455, 455 465, 447 491" markerEnd="url(#pipeline-arrow)" />
            <line x1="400" y1="540" x2="400" y2="581" markerEnd="url(#pipeline-arrow)" />
            {/* Fail loop: orthogonal routing through the right-side channel between Eval Harness (right edge x=740) and the viewBox edge. x=770 gives a clean 30px clearance from Eval. */}
            <path d="M 470 510 L 770 510 L 770 170 L 494 170" markerEnd="url(#pipeline-arrow)" />
          </g>

          {/* Nodes */}
          <g>
            <rect x="0" y="35" width="180" height="50" {...node} />
            <text x="90" y="60" {...nodeText}>Governance Templates</text>

            <rect x="310" y="35" width="180" height="50" {...node} />
            <text x="400" y="60" {...nodeText}>Component Schema</text>

            <rect x="310" y="145" width="180" height="50" {...node} />
            <text x="400" y="170" {...nodeText}>AI Coding Agent</text>

            <rect x="310" y="260" width="180" height="50" {...node} />
            <text x="400" y="285" {...nodeText}>Generated Component</text>

            <rect x="560" y="260" width="180" height="50" {...node} />
            <text x="650" y="285" {...nodeText}>Eval Harness</text>

            <rect x="180" y="370" width="180" height="50" {...node} />
            <text x="270" y="395" {...nodeText}>validate (CLI)</text>

            <rect x="440" y="370" width="180" height="50" {...node} />
            <text x="530" y="395" {...nodeText}>drift-check (CLI)</text>

            <polygon points="400,480 470,510 400,540 330,510" {...node} />
            <text x="400" y="510" {...nodeText}>CI Gate</text>

            <rect x="310" y="585" width="180" height="50" {...node} />
            <text x="400" y="610" {...nodeText}>Immutable Release</text>
          </g>

          {/* Edge labels (backdrop rect + text, italic) */}
          <g>
            <rect x="220" y="51" width="56" height="18" {...edgeLabelBg} />
            <text x="248" y="60" {...edgeLabelText}>reviews</text>

            <rect x="504" y="276" width="46" height="18" {...edgeLabelBg} />
            <text x="527" y="285" {...edgeLabelText}>scores</text>

            <rect x="410" y="552" width="36" height="18" {...edgeLabelBg} />
            <text x="428" y="561" {...edgeLabelText}>pass</text>

            <rect x="755" y="276" width="30" height="18" {...edgeLabelBg} />
            <text x="770" y="285" {...edgeLabelText}>fail</text>
          </g>
        </g>
      </svg>
      <figcaption className={styles.pipelineCaption}>
        Contract pipeline: schema drives generation, CI enforces the contract, governance reviews schema evolution
      </figcaption>
    </figure>
  );
}

export function LlmComponentSchemaPage({ nav }: { nav?: React.ReactNode }) {
  const project = getProjectBySlug("llm-component-schema");

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <ProjectDetailLayout
      nav={nav ?? <ProjectNav currentSlug={project.slug} />}
      hero={
        <ProjectHero
          title="LLM Component Schema"
          description="A JSON schema, CLI, and governance toolkit that makes component intent machine-readable, so AI coding agents generate to spec, not from vibes. Two published npm packages, a CI drift-and-eval pipeline, and a reusable playbook."
          image={{
            src: "/images/portfolio/llm-component-schema/hero.png",
            alt: "LLM Component Schema: brain icon flanked by JSON braces, representing machine-readable component intelligence.",
            width: 1456,
            height: 816,
          }}
          category={project.category.replace("-", " ")}
          tags={project.tags}
          date="December 2025–Present"
          liveUrl={project.liveUrl}
          variant="contained"
          showScrollIndicator={true}
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
              <p className={styles.metaText}>npm schema + CLI + governance toolkit (MIT)</p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Version</Title>
              <p className={styles.metaText}>v1.2.0</p>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Stack</Title>
              <div className={styles.metaTools}>
                <SiTypescript size={24} title="TypeScript" />
                <SiNpm size={24} title="npm" />
                <SiGithubactions size={24} title="GitHub Actions CI" />
              </div>
            </div>
            <div className={styles.metaBlock}>
              <Title as="h3" unstyled className={styles.metaLabel}>Packages</Title>
              <p className={styles.metaText}>
                <a href="https://www.npmjs.com/package/@petritapanilahdelma/llm-component-contracts" target="_blank" rel="noopener noreferrer">contracts</a>
                {" · "}
                <a href="https://www.npmjs.com/package/@petritapanilahdelma/llm-component-cli" target="_blank" rel="noopener noreferrer">cli</a>
                {" · "}
                <a href="https://github.com/PetriLahdelma/llm-component-schema-template" target="_blank" rel="noopener noreferrer">GitHub</a>
              </p>
            </div>
          </div>
          <div className={styles.metaRight}>
            <Title as="h3" unstyled className={styles.metaLabel}>Overview</Title>
            <p className={styles.metaOverview}>
              <strong>AI-generated components look right but behave wrong.</strong> They miss ARIA attributes, invent prop APIs that don&apos;t match the system, use hardcoded values instead of tokens. Code review catches some of this. Most of it ships.
            </p>
            <p className={styles.metaOverview}>
              <strong>LLM Component Schema gives agents ground truth.</strong> Tokens define visual possibilities. Component schemas define structure, behavior, accessibility, and constraints. Generative rules define how components adapt. Storybook + CI + Code Connect enforce the contract on every push.
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <ProcessBlock
        phases={[
          {
            title: "Schema Definition",
            activities: [
              "Props & variant typing",
              "Accessibility contract",
              "Token bindings",
              "Generative rules",
            ],
          },
          {
            title: "Agent Generation",
            activities: [
              "Schema-guided output",
              "Constrained prop APIs",
              "Token-aware styling",
              "ARIA-complete markup",
            ],
          },
          {
            title: "Validation",
            activities: [
              "CLI schema validation",
              "Drift detection (CI)",
              "Fixture test corpus",
              "Agent eval harness",
            ],
          },
          {
            title: "Governance",
            activities: [
              "Change-request templates",
              "Health-review templates",
              "Benchmark lineage",
              "Immutable release artifacts",
            ],
          },
        ]}
        sectionTitle="How it works"
        backgroundColor="transparent"
        maxWidth="lg"
        spacing="comfortable"
        columns={4}
      />

      {/* Schema anatomy: with npm contracts screenshot */}
      <StoryBlock
        subtitle="Schema Anatomy"
        title="What a component contract defines"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>Props &amp; variants.</span> Every prop typed with allowed values, defaults, and constraints. Two style packs: <code>base</code> (styling-agnostic) and <code>tailwind</code> (class-name-aware). Same schema shape, different <code>stylingSystem</code>.
          </Text>,
          <Text key="2" size="s">
            <span style={{ fontWeight: 600 }}>Accessibility contract.</span> Required ARIA attributes, keyboard interaction patterns, focus management rules. Per variant, not per component. <span style={{ fontWeight: 600 }}>Token bindings.</span> Which tokens map to which visual properties. No ambiguity.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* CLI: with npm-cli screenshot */}
      <StoryBlock
        subtitle="Published Packages"
        title="Contracts + CLI"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>@petritapanilahdelma/llm-component-cli</span> ships four commands: <code>validate</code> (strict structure + JSON contract checks), <code>drift-check</code> (compare schema against component props and Storybook args), <code>migrate</code> (v1 → v2 schema upgrade), and <code>init</code> (scaffold a full component starter).
          </Text>,
          <Text key="2" size="s">
            Both packages versioned in lockstep via npm workspace root. Tag-release workflow publishes immutable artifacts: schema pack archive, validator output, drift report, eval report, dashboard snapshot.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Drift + Evals: text + vertical pipeline diagram */}
      <StoryBlock
        subtitle="Enforcement"
        title="Drift detection &amp; agent evals"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>Drift detection is a failing build, not a warning.</span> The CI workflow treats contract drift the same way Project Spine treats export drift. If the schema and the component diverge, the pipeline stops. The golden test corpus provides permanent regression coverage.
          </Text>,
          <Text key="2" size="s">
            <span style={{ fontWeight: 600 }}>The eval harness scores agent output against the contract</span> so the feedback loop is measurable. The <code>failing-examples/</code> library provides intentionally bad fixtures as anti-pattern regression tests.
          </Text>,
          <ContractPipelineDiagram key="pipeline" />,
        ]}
        imageLayout="none"
        backgroundColor="light"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Governance */}
      <StoryBlock
        subtitle="Governance"
        title="Schema evolution as reviewed process"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>Schema change-request and system-health-review templates live in-repo</span> so contract evolution is reviewed, not ambient. When a component needs a new prop or variant, the change goes through the governance template: documenting why, what breaks, and what the migration path is.
          </Text>,
          <Text key="2" size="s">
            The contract pattern here is the ancestor of per-component <code>.contract.json</code> files in client projects. This repo is where the pattern was proven before being deployed in production design systems.
          </Text>,
        ]}
        imageLayout="none"
        backgroundColor="transparent"
        maxWidth="md"
        spacing="comfortable"
      />

      {/* Metrics */}
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
                <Text size="l">2 npm Packages</Text>
                <Text size="s">Contracts + CLI, versioned in lockstep. Workspace root at packages/.</Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">4 CLI Commands</Text>
                <Text size="s">validate, drift-check, migrate, init. CI enforcement on every push.</Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">2 Style Packs</Text>
                <Text size="s">Base (styling-agnostic) and Tailwind (class-name-aware). Same schema shape.</Text>
              </>
            ),
          },
          {
            type: "text",
            innerPadding: true,
            content: (
              <>
                <Text size="l">Eval Harness</Text>
                <Text size="s">Agent output scored against contracts. Failing-examples library as regression surface.</Text>
              </>
            ),
          },
        ]}
      />

      {/* Positioning */}
      <StoryBlock
        subtitle="Positioning"
        title="Component-level context for agents"
        content={[
          <Text key="1" size="s">
            <span style={{ fontWeight: 600 }}>Where Project Spine compiles repo-level agent context, LLM Component Schema compiles component-level context.</span> Both are repo-native. Both use hashed drift reports. Both address the core failure mode: generic agent prompts drift; explicit schemas + CI don&apos;t.
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
