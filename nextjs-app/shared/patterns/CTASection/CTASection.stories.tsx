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
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite action slots keep mapping presets.
  argTypes: {
    primaryAction: {
      control: { type: "select" },
      options: ["bookCall", "letsTalk"],
      mapping: {
        bookCall: { label: "Book a call", href: "/contact" },
        letsTalk: { label: "Let's talk", href: "/contact" },
      },
      description:
        "Primary CTA (label + href or onClick). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ActionItem" } },
    },
    secondaryAction: {
      control: { type: "select" },
      options: ["none", "viewWork"],
      mapping: {
        none: undefined,
        viewWork: { label: "View work", href: "/work" },
      },
      description:
        "Optional secondary CTA. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ActionItem" } },
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
  // action args are mapping keys resolved by the presets above.
  args: {
    primaryAction: "bookCall" as unknown as typeof defaultArgs.primaryAction,
    secondaryAction: "viewWork" as unknown as typeof defaultArgs.secondaryAction,
  },
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
