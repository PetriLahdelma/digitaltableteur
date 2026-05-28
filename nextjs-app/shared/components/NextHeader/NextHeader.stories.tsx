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

export const Default: Story = {};
export const Playground: Story = {};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <NextHeader />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: {},
};
