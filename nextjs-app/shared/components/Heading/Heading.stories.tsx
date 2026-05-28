import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "./Heading";
import contract from "./Heading.contract.json";

const defaultArgs = {
  children: "Section heading",
  level: 2 as const,
  size: "lg" as const,
};

const meta = {
  title: "Atoms/Heading",
  component: Heading,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: "text",
      description: "Heading text content",
    },
    level: {
      control: "select",
      options: [1, 2, 3, 4, 5, 6],
      description: "Semantic heading level (document outline)",
      table: { defaultValue: { summary: "2" } },
    },
    size: {
      control: "select",
      options: ["display", "xl", "lg", "md", "sm", "xs"],
      description: "Visual size decoupled from semantic level",
      table: { defaultValue: { summary: "lg" } },
    },
    as: {
      control: "text",
      description: "Override rendered tag (h1–h6)",
      table: { disable: true },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  globals: { forcedColors: "none" },
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <Heading level={2} size="lg">
        What we believe
      </Heading>
      <Heading level={3} size="md">
        Accessibility is a product feature
      </Heading>
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
