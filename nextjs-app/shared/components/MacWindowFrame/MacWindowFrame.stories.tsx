import contract from "./MacWindowFrame.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import MacWindowFrame from "@dt/MacWindowFrame";

const meta: Meta<typeof MacWindowFrame> = {
  argTypes: {
    density: {
      control: { type: "select" },
      options: ["compact", "comfortable"],
      description: "Chrome density inside the window frame",
      table: { defaultValue: { summary: "compact" } },
    },
  },
  title: "Layout/MacWindowFrame",
  component: MacWindowFrame,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-mac-window-frame",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  tags: ["beta", "!autodocs"],
};

export default meta;
type Story = StoryObj<typeof MacWindowFrame>;

const sampleContent = `You are a poet that creates short poems.

User: Write a poem about autumn.
AI: The leaves fall gently to the ground, painting the earth in hues profound.
The crisp air whispers through the trees, a symphony of nature's ease.`;

export const Default: Story = {
  tags: ["beta-matrix"],
  args: { children: sampleContent },
};

export const WithAction: Story = {
  args: {
    children: sampleContent,
    onAction: () => undefined,
    actionLabelKey: "macWindowFrame.action",
  },
};

export const Compact: Story = {
  args: { density: "compact", children: sampleContent },
};

export const Playground = Default;
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
