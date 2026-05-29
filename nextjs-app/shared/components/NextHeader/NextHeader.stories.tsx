import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { NextHeader } from "./NextHeader";
import contract from "./NextHeader.contract.json";

const meta = {
  title: "Patterns/NextHeader",
  component: NextHeader,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {},
  args: {},
} satisfies Meta<typeof NextHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <NextHeader />,
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: {},
};
