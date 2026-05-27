import type { Meta, StoryObj } from "@storybook/react-vite";
import Spinner from "./Spinner";
import contract from "./Spinner.contract.json";

const meta = {
  title: "Atoms/Spinner",
  component: Spinner,
  tags: ["!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    label: {
      control: "text",
      table: {
        category: "Accessibility",
        defaultValue: { summary: "Loading" },
      },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    className: { control: false, table: { category: "Advanced" } },
  },
  args: { label: "Loading content", size: "md" },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Default: Story = Playground;
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-layout-16)",
        alignItems: "center",
      }}
    >
      <Spinner size="sm" label="Loading small" />
      <Spinner size="md" label="Loading medium" />
      <Spinner size="lg" label="Loading large" />
    </div>
  ),
};
export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Spinner />,
};
export const ForcedColors: Story = { globals: { forcedColors: "active" } };
