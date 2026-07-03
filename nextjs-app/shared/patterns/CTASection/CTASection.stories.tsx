import { CTASection } from "./CTASection";
import type { Meta, StoryObj } from "@storybook/react-vite";
import contract from "./CTASection.contract.json";

const defaultArgs = {
  title: "Ready to scale your design system?",
  description:
    "We help teams ship accessible, token-driven UI with GenAI-ready specs.",
  primaryAction: { label: "Book a call", href: "/contact" },
  secondaryAction: { label: "View work", href: "/work" },
  background: "brand" as const,
  align: "center" as const,
};

const meta = {
  title: "Patterns/CTASection",
  component: CTASection,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=502-20",
    },
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    title: { control: "text", description: "Main headline" },
    description: { control: "text", description: "Supporting description" },
    primaryAction: {
      control: "object",
      description: "Primary CTA (label + href or onClick)",
    },
    secondaryAction: {
      control: "object",
      description: "Optional secondary CTA",
    },
    background: {
      control: "select",
      options: ["primary", "gradient", "dark", "muted", "brand"],
      description: "Band background treatment",
      table: { defaultValue: { summary: "primary" } },
    },
    align: {
      control: "radio",
      options: ["left", "center"],
      description: "Text alignment",
      table: { defaultValue: { summary: "center" } },
    },
    className: {
      control: "text",
      description: "Wrapper class names",
      table: { disable: true },
    },
    id: {
      control: "text",
      description: "Section id for in-page anchors",
      table: { disable: true },
    },
    donnyTarget: {
      control: "text",
      description: "Donny spotlight target id",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof CTASection>;

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
  name: "Example (homepage contact CTA)",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => (
    <CTASection
      id="contact-cta"
      title="Ready to create something extraordinary?"
      primaryAction={{ label: "Let's talk", href: "/contact" }}
      background="primary"
      align="center"
    />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
