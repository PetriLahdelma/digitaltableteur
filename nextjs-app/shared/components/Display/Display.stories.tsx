import type { Meta, StoryObj } from "@storybook/react-vite";
import { Display } from "./Display";
import contract from "./Display.contract.json";

const defaultArgs = {
  children: "Design systems that ship",
  as: "h1" as const,
};

const meta = {
  title: "Atoms/Display",
  component: Display,
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
      description: "Hero display copy",
    },
    as: {
      control: "select",
      options: ["h1", "h2", "p", "span", "div"],
      description: "Semantic element override",
      table: { defaultValue: { summary: "h1" } },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Display>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <Display>Clarity at marketing scale</Display>
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
