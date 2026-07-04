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
  tags: ["beta", "autodocs"],
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
  argTypes: {
    title: { control: "text", description: "Headline" },
    overline: { control: "text", description: "Optional eyebrow above title" },
    description: { control: "text", description: "Supporting body copy" },
    cta: { control: false, description: "Up to three CTA actions" },
    variant: {
      control: "select",
      options: ["gradient", "pattern", "dots", "solid"],
      description: "Background variant",
      table: { defaultValue: { summary: "gradient" } },
    },
    size: {
      control: "select",
      options: ["compact", "comfortable", "spacious"],
      description: "Vertical rhythm scale",
      table: { defaultValue: { summary: "comfortable" } },
    },
    className: {
      control: "text",
      description: "Section class names",
      table: { disable: true },
    },
    ariaLabel: {
      control: "text",
      description: "Accessible section label override",
      table: { disable: true },
    },
    id: {
      control: "text",
      description: "Section anchor id",
      table: { disable: true },
    },
    donnyTarget: {
      control: "text",
      description: "Donny spotlight target id",
      table: { disable: true },
    },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
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
