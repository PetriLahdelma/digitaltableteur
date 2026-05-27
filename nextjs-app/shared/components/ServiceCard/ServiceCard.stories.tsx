import contract from "./ServiceCard.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Layers } from "lucide-react";
import { ServiceCard } from "./ServiceCard";

const meta: Meta<typeof ServiceCard> = {
  title: "Molecules/ServiceCard",
  component: ServiceCard,
  tags: ["!autodocs"],
  parameters: { contractStatus: contract.status, a11y: { test: "error" } },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "bordered", "elevated", "minimal"],
    },

    iconPosition: { control: "radio", options: ["top", "left"] },
  },
};

export default meta;
type Story = StoryObj<typeof ServiceCard>;

export const Default: Story = {
  args: {
    icon: <Layers aria-hidden />,
    title: "Design systems",
    description:
      "Tokens, components, and governance that scale with your product.",
    variant: "default",
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
