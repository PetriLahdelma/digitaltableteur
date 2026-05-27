import contract from "./CTASection.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CTASection } from "./CTASection";

const meta: Meta<typeof CTASection> = {
  title: "Patterns/CTASection",
  component: CTASection,
  tags: ["!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    title: { control: "text" },

    description: { control: "text" },

    background: {
      control: "select",
      options: ["primary", "gradient", "dark", "muted", "brand"],
    },

    align: { control: "radio", options: ["left", "center"] },
  },
};

export default meta;
type Story = StoryObj<typeof CTASection>;

export const Default: Story = {
  args: {
    title: "Ready to scale your design system?",
    description:
      "We help teams ship accessible, token-driven UI with GenAI-ready specs.",
    primaryAction: { label: "Book a call", href: "/contact" },
    secondaryAction: { label: "View work", href: "/work" },
    background: "brand",
    align: "center",
  },
};

export const Playground: Story = { ...Default };
export const Example: Story = {
  parameters: { controls: { disable: true } },
  args: Default.args,
};
export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: Default.args,
};
