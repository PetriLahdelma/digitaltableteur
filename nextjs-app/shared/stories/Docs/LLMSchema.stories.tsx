import React, { useEffect, useId, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import styles from "./Documentation.module.css";
import schemaTemplate from "../../../../docs/LLM_COMPONENT_SCHEMA_TEMPLATE.json";
import accordionSchema from "../../components/Accordion/schema.json";

const TEMPLATE_PATH = "docs/LLM_COMPONENT_SCHEMA_TEMPLATE.json";
const ACCORDION_SCHEMA_PATH =
  "nextjs-app/shared/components/Accordion/schema.json";

const templateJson = JSON.stringify(schemaTemplate, null, 2);
const accordionJson = JSON.stringify(accordionSchema, null, 2);

const buttonSchemaExample = {
  schemaVersion: "1.0",
  component: {
    name: "Button",
    type: "interaction",
    description: "Single action trigger with semantic intent and variants.",
    source: "nextjs-app/shared/components/Button/Button.tsx",
  },
  semanticRole: { container: "button" },
  layout: {
    direction: "horizontal",
    width: "intrinsic",
    height: "content-driven",
    spacing: { padding: "space.12 space.16", gap: "space.8" },
  },
  visualStyle: {
    surface: "flat",
    border: "token.border.default",
    radius: "token.radius.md",
    backgrounds: {
      default: "brand.primary",
      hover: "brand.primaryHover",
      active: "brand.primaryActive",
      disabled: "neutral.disabled",
    },
    typography: {
      fontFamily: "token.type.body",
      fontSize: "token.type.button",
      fontWeight: "token.type.semibold",
      lineHeight: "token.type.tight",
    },
  },
  behavior: {
    map: "Press triggers action. Disabled blocks interaction and feedback.",
    stateModel: "controlled | uncontrolled",
    rendering: "Always renders label and optional icon.",
    defaultState: "enabled",
  },
  interaction: {
    logic: [{ trigger: "onClick", effect: "Invoke primary action handler." }],
    feedback: {
      hover: "Increase surface contrast.",
      focus: "Show focus ring.",
      active: "Reduce elevation.",
      disabled: "Lower opacity, disable pointer events.",
    },
  },
  states: {
    default: "Idle",
    hover: "Pointer hover",
    focus: "Keyboard focus",
    active: "Pressed",
    disabled: "Non-interactive",
  },
  transitions: [
    {
      from: "default",
      to: "hover",
      trigger: "pointer enter",
      motionTokens: ["token.motion.duration.fast"],
    },
  ],
  constraints: { nesting: ["Button cannot contain another Button."] },
  accessibility: {
    roles: { container: "button" },
    aria: { label: "Required when text label is not visible." },
    keyboard: "Enter and Space activate the button.",
  },
  generativeRules: {
    contextInputs: ["variant", "mode", "density"],
    rules: [
      {
        if: { variant: "primary" },
        then: { tokens: { color: "brand.accent" } },
      },
      {
        if: { variant: "destructive" },
        then: { tokens: { color: "semantic.error" } },
      },
      {
        if: { mode: "dark" },
        then: { tokens: { surface: "neutral.surfaceElevated" } },
      },
    ],
  },
};

const buttonExampleJson = JSON.stringify(buttonSchemaExample, null, 2);

const stackDiagram = `
flowchart LR
  tokens[Token Layers\\nBase / Brand / Mode / Context] --> schema[Schema Library\\nComponents / Patterns / Layouts]
  schema --> rules[Generative Rules Engine]
  rules --> interpreter[AI Interpreter]
  interpreter --> ui[UI Output]
  interpreter --> validate[Validation\\nConstraints + Accessibility]
  context[Context Signals\\nUser / Device / Intent] --> rules
  schema --> validate
`;

const schemaBlueprintDiagram = `
graph TD
  root[Component Schema] --> anatomy[Anatomy]
  root --> layout[Layout Logic]
  root --> visual[Visual Style]
  root --> behavior[Behavior Map]
  root --> interaction[Interaction Logic]
  root --> states[States + Transitions]
  root --> accessibility[Accessibility Rules]
  root --> constraints[Constraints + Nesting]
  root --> tokens[Token Layers]
  root --> rules[Generative Rules]
`;

const stateDiagram = `
stateDiagram-v2
  [*] --> Idle
  Idle --> Hovered: pointer_enter
  Hovered --> Idle: pointer_leave
  Idle --> Active: pointer_down
  Active --> Idle: pointer_up
  Idle --> Disabled: disabled_true
  Disabled --> Idle: disabled_false
`;

const rulesDiagram = `
flowchart TD
  context[Context Inputs] --> match[Rule Matching]
  match --> tokens[Token Overrides]
  tokens --> render[Render Output]
  render --> validate[Validate Constraints + A11y]
  validate --> output[Final UI]
`;

let mermaidConfigured = false;

const loadMermaid = async () => {
  const { default: mermaid } = await import("mermaid");
  if (!mermaidConfigured) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
    });
    mermaidConfigured = true;
  }
  return mermaid;
};

type MermaidDiagramProps = { title?: string; code: string };

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ title, code }) => {
  const rawId = useId();
  const renderId = useMemo(
    () => `mermaid-${rawId.replace(/[:]/g, "")}`,
    [rawId],
  );
  const containerId = `${renderId}-container`;
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        const mermaid = await loadMermaid();
        const result = await mermaid.render(renderId, code);
        if (cancelled) return;
        setSvg(result.svg);
        setError(null);
        if (result.bindFunctions) {
          requestAnimationFrame(() => {
            const node = document.getElementById(containerId);
            if (node) {
              result.bindFunctions?.(node);
            }
          });
        }
      } catch (err) {
        if (!cancelled) {
          setSvg("");
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [code, renderId, containerId]);

  return (
    <figure className={styles.mermaidBlock}>
      {title ? (
        <figcaption className={styles.mermaidTitle}>{title}</figcaption>
      ) : null}
      {svg ? (
        <div
          id={containerId}
          className={styles.mermaid}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre className={styles.code}>{code}</pre>
      )}
      {error ? (
        <pre className={styles.code}>{`Mermaid render failed: ${error}`}</pre>
      ) : null}
    </figure>
  );
};

const LLMSchemaDocsContent = () => {
  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>LLM Component Schema</h1>
        <p className={styles.lead}>
          A schema is the blueprint that makes components programmable,
          controllable, and AI-readable. Tokens are the DNA. Schema is the
          skeleton. Generative rules are the brain.
        </p>
        <p className={styles.subtitle}>
          Template: <code>{TEMPLATE_PATH}</code>
        </p>
      </header>

      <section className={styles.section}>
        <h2>Why a schema exists</h2>
        <p>
          Without schema, AI can only render pixels. With schema, AI can reason
          about behavior, constraints, and intent. That is the difference
          between a static design and a programmable system.
        </p>
        <ul>
          <li>Schema defines intent and structure, not just appearance.</li>
          <li>It standardizes behavior across variants and contexts.</li>
          <li>It gives AI a single source of truth for constraints.</li>
          <li>It enables automated validation and consistency checks.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>AI Design System Stack</h2>
        <p>
          The schema sits between tokens (what is possible) and rules (how it
          should adapt). The interpreter then renders and validates UI.
        </p>
        <MermaidDiagram title="AI Design System Stack" code={stackDiagram} />
        <div className={styles.principleGrid}>
          <div className={styles.principle}>
            <h3>Tokens (DNA)</h3>
            <p>Colors, typography, spacing, radii, elevation, motion.</p>
          </div>
          <div className={styles.principle}>
            <h3>Schema (Skeleton)</h3>
            <p>Structure, behavior, accessibility, and constraints.</p>
          </div>
          <div className={styles.principle}>
            <h3>Rules (Brain)</h3>
            <p>Context-aware adaptation and personalization.</p>
          </div>
          <div className={styles.principle}>
            <h3>Interpreter</h3>
            <p>Applies rules, validates constraints, renders UI.</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Schema anatomy (the blueprint)</h2>
        <p>Every component schema describes the same major categories.</p>
        <MermaidDiagram
          title="Schema Blueprint"
          code={schemaBlueprintDiagram}
        />
        <ul>
          <li>
            <strong>Behavior map</strong>: what the component does, by default.
          </li>
          <li>
            <strong>Interaction logic</strong>: triggers, effects, feedback.
          </li>
          <li>
            <strong>States and transitions</strong>: how it changes over time.
          </li>
          <li>
            <strong>Layout logic</strong>: direction, spacing, sizing rules.
          </li>
          <li>
            <strong>Accessibility rules</strong>: roles, aria, keyboard support.
          </li>
          <li>
            <strong>Constraints</strong>: nesting limits and content rules.
          </li>
          <li>
            <strong>Generative rules</strong>: context-driven token overrides.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Token layers (Atomic DNA)</h2>
        <p>Tokens are layered so AI can reason about intent and context.</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Layer</th>
              <th>Purpose</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Base</td>
              <td>Raw primitives and scale</td>
              <td>
                <code>token.color.gray.900</code>, <code>token.space.16</code>
              </td>
            </tr>
            <tr>
              <td>Brand</td>
              <td>Identity and voice</td>
              <td>
                <code>brand.accent</code>, <code>brand.display</code>
              </td>
            </tr>
            <tr>
              <td>Mode</td>
              <td>Theme-specific overrides</td>
              <td>
                <code>mode.dark.surface</code>, <code>mode.light.text</code>
              </td>
            </tr>
            <tr>
              <td>Contextual</td>
              <td>Emotion, season, accessibility</td>
              <td>
                <code>context.a11y.highContrast</code>,{" "}
                <code>context.emotion.calm</code>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>Behavior map and interaction logic</h2>
        <p>
          The behavior map describes purpose and defaults. Interaction logic
          describes triggers and feedback.
        </p>
        <pre className={styles.code}>
          {`"behavior": {
  "map": "Clicking a trigger opens a panel and closes others.",
  "stateModel": "uncontrolled",
  "rendering": "Panels render only when open.",
  "defaultState": "all closed"
},
"interaction": {
  "logic": [
    { "trigger": "onClick", "effect": "toggle panel" }
  ],
  "feedback": {
    "hover": "highlight trigger",
    "focus": "focus ring",
    "active": "press feedback"
  }
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>States, transitions, and constraints</h2>
        <p>
          States describe the finite set of conditions. Transitions describe how
          the component moves between them. Constraints define what is allowed.
        </p>
        <MermaidDiagram title="State Transitions" code={stateDiagram} />
        <pre className={styles.code}>
          {`"states": {
  "default": "Idle",
  "hover": "Pointer hover",
  "focus": "Keyboard focus",
  "active": "Pressed",
  "disabled": "Non-interactive"
},
"constraints": {
  "nesting": [
    "Card cannot contain another Card.",
    "Button cannot contain form elements."
  ],
  "content": [
    "Label must be <= 2 lines in compact mode."
  ]
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Accessibility mapping</h2>
        <p>
          Accessibility rules make semantics explicit and enforceable. Use
          roles, aria relationships, and keyboard behavior to define expected
          interaction.
        </p>
        <pre className={styles.code}>
          {`"accessibility": {
  "roles": {
    "container": "div",
    "primary": "button",
    "panel": "region"
  },
  "aria": {
    "expanded": "true when open",
    "controls": "panel-id",
    "labelledBy": "trigger-id"
  },
  "keyboard": "Enter/Space toggles panel"
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Generative rules</h2>
        <p>
          Rules transform context into token overrides. They are the bridge
          between intent and appearance.
        </p>
        <MermaidDiagram title="Generative Rule Pipeline" code={rulesDiagram} />
        <pre className={styles.code}>
          {`"generativeRules": {
  "contextInputs": ["variant", "mode", "density", "contentType"],
  "rules": [
    { "if": { "variant": "primary" }, "then": { "tokens": { "color": "brand.accent" } } },
    { "if": { "variant": "destructive" }, "then": { "tokens": { "color": "semantic.error" } } },
    { "if": { "mode": "dark" }, "then": { "tokens": { "surface": "neutral.surfaceElevated" } } },
    { "if": { "density": "compact" }, "then": { "tokens": { "spacing": "space.-4" } } },
    { "if": { "accessibility": "dyslexic" }, "then": { "tokens": { "fontWeight": "semibold" } } }
  ]
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Example: Button schema (excerpt)</h2>
        <pre className={styles.code}>{buttonExampleJson}</pre>
      </section>

      <section className={styles.section}>
        <h2>Example: Accordion schema (real)</h2>
        <p>
          This is the live schema used by the Accordion component:{" "}
          <code>{ACCORDION_SCHEMA_PATH}</code>.
        </p>
        <pre className={styles.code}>{accordionJson}</pre>
      </section>

      <section className={styles.section}>
        <h2>Template file</h2>
        <p>
          Use the template as the starting point for any new component. Keep it
          in a stable location so LLMs can load it directly.
        </p>
        <pre className={styles.code}>{templateJson}</pre>
      </section>

      <section className={styles.section}>
        <h2>Implementation checklist</h2>
        <ol>
          <li>
            Create <code>schema.json</code> in the component folder.
          </li>
          <li>Describe anatomy, layout, behavior, and constraints.</li>
          <li>Link token layers and define generative rules.</li>
          <li>Import the schema into the Storybook docs page.</li>
        </ol>
        <pre className={styles.code}>
          {`import schema from "./schema.json";

const meta = { title: "Atoms/MyComponent",
  component: MyComponent,
  tags: ["autodocs"],
  parameters: { llm: { schema }
  }
};`}
        </pre>
      </section>
    </article>
  );
};

const meta: Meta = {
  title: "Docs/LLM Schema",
  parameters: { layout: "fullscreen", vitest: { skip: true } },
};

export default meta;

type Story = StoryObj<typeof LLMSchemaDocsContent>;

export const LLMSchemaGuide: Story = { render: () => <LLMSchemaDocsContent /> };
