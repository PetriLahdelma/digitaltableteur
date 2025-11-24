import type { Meta, StoryObj } from "@storybook/react";
import MCPActionButton from "./MCPActionButton";

const meta: Meta<typeof MCPActionButton> = {
  title: "Components/MCPActionButton",
  component: MCPActionButton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MCPActionButton>;

const mockExecute = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ok: true };
};

export const Default: Story = {
  args: {
    toolId: "sync.calendar",
    onExecute: mockExecute,
  },
};

export const WithCustomLabel: Story = {
  args: {
    toolId: "publish.report",
    children: "Publish via MCP",
    onExecute: mockExecute,
  },
};

export const Disabled: Story = {
  args: {
    toolId: "disabled.tool",
    onExecute: mockExecute,
    disabled: true,
  },
};
