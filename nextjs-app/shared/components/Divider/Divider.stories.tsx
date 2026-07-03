import type { Meta, StoryObj } from "@storybook/react-vite";
import Divider from "./Divider";
import contract from "./Divider.contract.json";

const meta = {
  title: "Layout/Divider",
  component: Divider,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=368-6",
    },
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

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
