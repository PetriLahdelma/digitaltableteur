import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spacer } from "./Spacer";
import contract from "./Spacer.contract.json";

const defaultArgs = {
  size: "md" as const,
  axis: "vertical" as const,
};

const meta = {
  title: "Atoms/Spacer",
  component: Spacer,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl", "2xl"],
      description: "Tokenized gap size",
      table: { defaultValue: { summary: "md" } },
    },
    axis: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Block (vertical) or inline (horizontal) axis",
      table: { defaultValue: { summary: "vertical" } },
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Spacer>;

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
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span className="text-sm">First block</span>
      <Spacer size="md" axis="vertical" />
      <span className="text-sm">Second block after deliberate gap</span>
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
