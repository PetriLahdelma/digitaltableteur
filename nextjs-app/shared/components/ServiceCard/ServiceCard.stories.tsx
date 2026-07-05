import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { Sparkle } from "@phosphor-icons/react";
import { ServiceCard } from "./ServiceCard";
import contract from "./ServiceCard.contract.json";

const defaultArgs = {
  icon: (
    <Sparkle weight="duotone" className="size-8 text-primary" aria-hidden />
  ),
  title: "Design systems",
  description:
    "Tokens, components, and governance that scale with your product.",
  variant: "bordered" as const,
};

const meta = {
  title: "Site/ServiceCard",
  component: ServiceCard,
  tags: ["stable", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-service-card",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  args: defaultArgs,
} satisfies Meta<typeof ServiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  argTypes: {
    icon: {
      control: { type: "select" },
      options: ["sparkle", "none"],
      mapping: {
        sparkle: defaultArgs.icon,
        none: undefined,
      },
      description:
        "Icon slot. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ReactNode" } },
    },
  },
  args: {
    icon: "sparkle" as never,
  },
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (services grid tile)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => <ServiceCard {...defaultArgs} />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
