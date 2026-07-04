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
  tags: ["beta", "!autodocs"],
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
  argTypes: {
    icon: { control: false, description: "Leading service icon" },
    title: { control: "text", description: "Card title" },
    description: { control: "text", description: "Supporting copy" },
    href: { control: "text", description: "Optional link destination" },
    variant: {
      control: "select",
      options: ["default", "bordered", "elevated", "minimal"],
      description: "Surface treatment",
      table: { defaultValue: { summary: "default" } },
    },
    iconPosition: {
      control: "select",
      options: ["top", "left"],
      description: "Icon placement",
      table: { defaultValue: { summary: "top" } },
    },
    className: {
      control: "text",
      description: "Card class names",
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
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
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
