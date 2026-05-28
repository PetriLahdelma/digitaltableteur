import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sparkle } from "@phosphor-icons/react";
import { ValueCard } from "./ValueCard";
import contract from "./ValueCard.contract.json";

const defaultArgs = {
  icon: <Sparkle weight="duotone" className="size-8 text-primary" aria-hidden />,
  title: "Clarity first",
  description: "Interfaces should explain themselves before they decorate.",
  variant: "bordered" as const,
};

const meta = {
  title: "Molecules/ValueCard",
  component: ValueCard,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    icon: { control: false, description: "Decorative leading icon" },
    title: { control: "text", description: "Card heading" },
    description: { control: "text", description: "Supporting copy" },
    variant: {
      control: "select",
      options: ["default", "bordered", "elevated"],
      description: "Card surface treatment",
      table: { defaultValue: { summary: "default" } },
    },
    className: {
      control: "text",
      description: "Article wrapper class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof ValueCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        maxWidth: 720,
      }}
    >
      <ValueCard {...defaultArgs} />
      <ValueCard
        icon={<Sparkle weight="duotone" className="size-8 text-primary" aria-hidden />}
        title="Accessible by default"
        description="Keyboard, contrast, and semantics are part of the definition of done."
        variant="bordered"
      />
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
