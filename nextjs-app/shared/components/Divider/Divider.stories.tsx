import type { Meta, StoryObj } from "@storybook/react-vite";
import Divider from "./Divider";
import contract from "./Divider.contract.json";

const meta = {
  title: "Atoms/Divider",
  component: Divider,
  tags: ["!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout axis of the separator",
      table: { category: "Layout", defaultValue: { summary: "horizontal" } },
    },
    decorative: {
      control: "boolean",
      description: "When true, exposed as presentational only (role=none)",
      table: { category: "Accessibility", defaultValue: { summary: "true" } },
    },
    className: {
      control: false,
      description: "Optional spacing/width utility classes",
      table: { category: "Advanced" },
    },
  },
  args: { orientation: "horizontal", decorative: true },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Default: Story = Playground;

export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{ inlineSize: "min(24rem, 100%)", fontFamily: "var(--font-text)" }}
    >
      <p>Section one</p>
      <Divider />
      <p>Section two</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-layout-16)",
        alignItems: "stretch",
        minBlockSize: "6rem",
      }}
    >
      <span>Left</span>
      <Divider orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

export const ForcedColors: Story = { globals: { forcedColors: "active" } };
