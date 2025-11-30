import type { Meta, StoryObj } from "@storybook/react";
import MacWindowFrame from "./MacWindowFrame";

const meta: Meta<typeof MacWindowFrame> = {
  title: "Components/MacWindowFrame",
  component: MacWindowFrame,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MacWindowFrame>;

const sampleContent = `You are a poet that creates short poems.

User: Write a poem about autumn.
AI: The leaves fall gently to the ground, painting the earth in hues profound.
The crisp air whispers through the trees, a symphony of nature's ease.`;

export const Default: Story = {
  args: {
    children: sampleContent,
  },
};

export const WithAction: Story = {
  args: {
    children: sampleContent,
    onAction: () => undefined,
    actionLabelKey: "macWindowFrame.action",
  },
};

export const Compact: Story = {
  args: {
    density: "compact",
    children: sampleContent,
  },
};
