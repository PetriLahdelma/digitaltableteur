import type { Meta, StoryObj } from "@storybook/react-vite";
import Progress from "./Progress";
import contract from "./Progress.contract.json";

const meta = {
  title: "Feedback/Progress",
  component: Progress,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=369-15",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Current progress value",
      table: { category: "Value", defaultValue: { summary: "0" } },
    },
    max: {
      control: { type: "number", min: 1 },
      description: "Maximum value",
      table: { category: "Value", defaultValue: { summary: "100" } },
    },
    label: {
      control: "text",
      description: "Accessible name for progressbar",
      table: { category: "Accessibility" },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Track height token",
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    state: {
      control: "select",
      options: ["neutral", "success", "info", "warning", "error"],
      description: "Semantic fill color",
      table: { category: "Appearance", defaultValue: { summary: "neutral" } },
    },
    className: {
      control: false,
      description: "Optional utility classes on the root",
      table: { category: "Advanced" },
    },
  },
  args: {
    value: 45,
    max: 100,
    label: "Upload progress",
    size: "md",
    state: "info",
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  ...Playground,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ inlineSize: "min(20rem, 100%)" }}>
      <Progress value={72} state="success" label="Profile completeness" />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
