import contract from "./MCPActionButton.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import MCPActionButton from "@dt/MCPActionButton";

const meta: Meta<typeof MCPActionButton> = {
  argTypes: {},
  title: "Site/MCPActionButton",
  component: MCPActionButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-mcpaction-button",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  tags: ["beta", "!autodocs"],
};

export default meta;
type Story = StoryObj<typeof MCPActionButton>;

const mockExecute = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ok: true };
};

export const Default: Story = {
  tags: ["beta-matrix"],
  args: { toolId: "sync.calendar", onExecute: mockExecute },
};

export const WithCustomLabel: Story = {
  args: {
    toolId: "publish.report",
    children: "Publish via MCP",
    onExecute: mockExecute,
  },
};

export const Disabled: Story = {
  args: { toolId: "disabled.tool", onExecute: mockExecute, disabled: true },
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
