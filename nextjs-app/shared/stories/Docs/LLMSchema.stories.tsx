import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Code from "@dt/Code";
import CodeBlock from "@dt/CodeBlock";
import Mermaid from "@dt/Mermaid";
import Title from "@dt/Title";
import {
  GuideList,
  GuidePage,
  GuideSection,
  GuideSteps,
  GuideTable,
} from "../../../../.storybook/blocks/guide/GuidePage";
import styles from "./LLMSchema.module.css";
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

const code = (value: string) => <Code size="inherit">{value}</Code>;

/** Long JSON stays scrollable inside its block instead of running for pages. */
const JSON_MAX_HEIGHT = 420;

function Diagram({
  title,
  chart,
  description,
  steps,
  compact = false,
}: {
  title: string;
  chart: string;
  description: string;
  steps: string[];
  /** Cap the width of a tall top-to-bottom chart. */
  compact?: boolean;
}) {
  return (
    <div className={compact ? `${styles.diagram} ${styles.compact}` : styles.diagram}>
      <Mermaid
        chart={chart}
        title={title}
        description={description}
        accessibleDetails={
          <ol>
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        }
      />
    </div>
  );
}

const LLMSchemaDocsContent = () => (
  <GuidePage
    kicker="Reference"
    title="LLM component schema"
    lede={
      <>
        A schema is the blueprint that makes components programmable,
        controllable and AI-readable. Tokens are the DNA, the schema is the
        skeleton and generative rules are the brain. The template lives at{" "}
        {code(TEMPLATE_PATH)}.
      </>
    }
  >
    <GuideSection
      title="Why a schema exists"
      intro="Without a schema, AI can only render pixels. With one, it can reason about behaviour, constraints and intent. That is the difference between a static design and a programmable system."
    >
      <GuideList
        items={[
          "It defines intent and structure, not just appearance.",
          "It standardises behaviour across variants and contexts.",
          "It gives AI a single source of truth for constraints.",
          "It makes automated validation and consistency checks possible.",
        ]}
      />
    </GuideSection>

    <GuideSection
      title="The AI design system stack"
      intro="The schema sits between tokens (what is possible) and rules (how it should adapt). An interpreter then renders the UI and validates it."
    >
      <GuideSteps
        steps={[
          { title: "Tokens, the DNA", body: "Colour, typography, spacing, radii, elevation and motion." },
          { title: "Schema, the skeleton", body: "Structure, behaviour, accessibility and constraints." },
          { title: "Rules, the brain", body: "Context-aware adaptation and personalisation." },
          { title: "Interpreter", body: "Applies the rules, validates the constraints and renders the UI." },
        ]}
      />
      <Diagram
        title="AI design system stack"
        chart={stackDiagram}
        description="Token layers feed the schema library, which feeds the generative rules engine and an AI interpreter that renders and validates the UI."
        steps={[
          "Token layers (base, brand, mode, context) feed the schema library.",
          "The schema library (components, patterns, layouts) feeds the generative rules engine and validation.",
          "Context signals (user, device, intent) also feed the rules engine.",
          "The rules engine drives the AI interpreter.",
          "The interpreter produces the UI output and runs validation for constraints and accessibility.",
        ]}
      />
    </GuideSection>

    <GuideSection
      title="Schema anatomy"
      intro="Every component schema describes the same major parts."
    >
      <GuideTable
        caption="Schema sections"
        columns={["Section", "Describes"]}
        rows={[
          ["Behavior map", "What the component does by default."],
          ["Interaction logic", "Triggers, effects and feedback."],
          ["States and transitions", "How it changes over time."],
          ["Layout logic", "Direction, spacing and sizing rules."],
          ["Accessibility rules", "Roles, ARIA relationships and keyboard support."],
          ["Constraints", "Nesting limits and content rules."],
          ["Generative rules", "Context-driven token overrides."],
        ]}
      />
    </GuideSection>

    <GuideSection
      title="Token layers"
      intro="Tokens are layered so AI can reason about intent and context, not only values."
    >
      <GuideTable
        caption="Token layers"
        columns={["Layer", "Purpose", "Examples"]}
        rows={[
          ["Base", "Raw primitives and scale", <>{code("token.color.gray.900")} {code("token.space.16")}</>],
          ["Brand", "Identity and voice", <>{code("brand.accent")} {code("brand.display")}</>],
          ["Mode", "Theme-specific overrides", <>{code("mode.dark.surface")} {code("mode.light.text")}</>],
          ["Contextual", "Emotion, season and accessibility", <>{code("context.a11y.highContrast")} {code("context.emotion.calm")}</>],
        ]}
      />
    </GuideSection>

    <GuideSection
      title="Behaviour and interaction"
      intro="The behaviour map describes purpose and defaults. Interaction logic describes triggers and feedback."
    >
      <CodeBlock
        language="json"
        copyable
        code={`"behavior": {
  "map": "Clicking a trigger opens a panel and closes others.",
  "stateModel": "uncontrolled",
  "rendering": "Panels render only when open.",
  "defaultState": "all closed"
},
"interaction": {
  "logic": [{ "trigger": "onClick", "effect": "toggle panel" }],
  "feedback": { "hover": "highlight trigger", "focus": "focus ring", "active": "press feedback" }
}`}
      />
    </GuideSection>

    <GuideSection
      title="States, transitions and constraints"
      intro="States are the finite set of conditions, transitions are how the component moves between them and constraints say what is allowed."
    >
      <Diagram
        title="State transitions"
        chart={stateDiagram}
        description="A pointer moves the component between idle, hovered and active; the disabled flag moves it in and out of disabled."
        steps={[
          "Idle to hovered on pointer enter, and back on pointer leave.",
          "Idle to active on pointer down, and back on pointer up.",
          "Idle to disabled when disabled becomes true, and back when it becomes false.",
        ]}
      />
      <CodeBlock
        language="json"
        copyable
        code={`"states": {
  "default": "Idle",
  "hover": "Pointer hover",
  "focus": "Keyboard focus",
  "active": "Pressed",
  "disabled": "Non-interactive"
},
"constraints": {
  "nesting": ["Card cannot contain another Card.", "Button cannot contain form elements."],
  "content": ["Label must be <= 2 lines in compact mode."]
}`}
      />
    </GuideSection>

    <GuideSection
      title="Accessibility mapping"
      intro="Accessibility rules make semantics explicit and enforceable: roles, ARIA relationships and keyboard behaviour define the expected interaction."
    >
      <CodeBlock
        language="json"
        copyable
        code={`"accessibility": {
  "roles": { "container": "div", "primary": "button", "panel": "region" },
  "aria": { "expanded": "true when open", "controls": "panel-id", "labelledBy": "trigger-id" },
  "keyboard": "Enter/Space toggles panel"
}`}
      />
    </GuideSection>

    <GuideSection
      title="Generative rules"
      intro="Rules turn context into token overrides. They are the bridge between intent and appearance."
    >
      <Diagram
        title="Generative rule pipeline"
        compact
        chart={rulesDiagram}
        description="Context inputs are matched to rules, which produce token overrides; the result is rendered and validated before it becomes the final UI."
        steps={[
          "Context inputs go to rule matching.",
          "Matching rules produce token overrides.",
          "The overrides are rendered.",
          "The render is validated for constraints and accessibility.",
          "The validated render is the final UI.",
        ]}
      />
      <CodeBlock
        language="json"
        copyable
        code={`"generativeRules": {
  "contextInputs": ["variant", "mode", "density", "contentType"],
  "rules": [
    { "if": { "variant": "primary" }, "then": { "tokens": { "color": "brand.accent" } } },
    { "if": { "variant": "destructive" }, "then": { "tokens": { "color": "semantic.error" } } },
    { "if": { "mode": "dark" }, "then": { "tokens": { "surface": "neutral.surfaceElevated" } } },
    { "if": { "density": "compact" }, "then": { "tokens": { "spacing": "space.-4" } } },
    { "if": { "accessibility": "dyslexic" }, "then": { "tokens": { "fontWeight": "semibold" } } }
  ]
}`}
      />
    </GuideSection>

    <GuideSection title="Examples">
      <Title as="h3" size="xxs" lineHeight="snug" className={styles.exampleTitle}>
        Button schema, excerpt
      </Title>
      <CodeBlock language="json" copyable maxHeight={JSON_MAX_HEIGHT} code={buttonExampleJson} />
      <Title as="h3" size="xxs" lineHeight="snug" className={styles.exampleTitle}>
        Accordion schema, in use
      </Title>
      <CodeBlock
        language="json"
        copyable
        filename={ACCORDION_SCHEMA_PATH}
        maxHeight={JSON_MAX_HEIGHT}
        code={accordionJson}
      />
    </GuideSection>

    <GuideSection
      title="The template"
      intro="Start every new schema from the template, and keep it at a stable path so LLMs can load it directly."
    >
      <CodeBlock
        language="json"
        copyable
        filename={TEMPLATE_PATH}
        maxHeight={JSON_MAX_HEIGHT}
        code={templateJson}
      />
    </GuideSection>

    <GuideSection title="Adding a schema to a component">
      <GuideList
        ordered
        items={[
          <>Create {code("schema.json")} in the component folder.</>,
          "Describe anatomy, layout, behaviour and constraints.",
          "Link the token layers and define the generative rules.",
          "Pass the schema to the component's stories.",
        ]}
      />
      <CodeBlock
        language="tsx"
        copyable
        code={`import schema from "./schema.json";

const meta = {
  title: "Actions/MyComponent",
  component: MyComponent,
  parameters: { llm: { schema } },
};`}
      />
    </GuideSection>
  </GuidePage>
);

const meta: Meta = {
  title: "Docs/LLM schema",
  parameters: { layout: "fullscreen", wip: { disabled: true }, vitest: { skip: true } },
};

export default meta;

type Story = StoryObj<typeof LLMSchemaDocsContent>;

export const LLMSchemaGuide: Story = { render: () => <LLMSchemaDocsContent /> };
