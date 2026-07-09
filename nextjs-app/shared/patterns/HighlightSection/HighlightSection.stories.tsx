import HighlightSection from "./HighlightSection";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./HighlightSection.contract.json";

const defaultArgs = {
  title: "Component schema for GenAI design systems",
  description:
    "Keep AI-generated UI consistent with shared prop structures, naming, and token bindings.",
  variant: "dots" as const,
  size: "comfortable" as const,
  cta: [
    { label: "Download schema", href: "https://example.com/schema" },
    { label: "Read article", href: "/blog" },
  ],
};

const meta = {
  title: "Patterns/HighlightSection",
  component: HighlightSection,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-highlight-section",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite cta slot keeps a mapping preset.
  argTypes: {
    cta: {
      control: { type: "select" },
      options: ["two", "one", "none"],
      mapping: {
        two: [
          { label: "Download schema", href: "https://example.com/schema" },
          { label: "Read article", href: "/blog" },
        ],
        one: [{ label: "Download schema", href: "https://example.com/schema" }],
        none: undefined,
      },
      description:
        "Up to three CTA actions. Pick a preset here; compose your own in code.",
      table: {
        category: "Content",
        type: { summary: "HighlightSectionCTA | HighlightSectionCTA[]" },
      },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof HighlightSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  // cta arg is a mapping key resolved by the preset above.
  args: {
    cta: "two" as unknown as typeof defaultArgs.cta,
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (homepage GenAI highlight)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  args: {
    title: "Component Schema Template for GenAI Design Systems",
    description:
      "Enforce shared prop structures and naming so AI output stays on-brand.",
    variant: "dots",
    size: "comfortable",
    cta: [
      { label: "Download Schema", href: "https://example.com" },
      { label: "Read Article", href: "/blog" },
    ],
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
