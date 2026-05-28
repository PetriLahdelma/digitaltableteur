import type { Meta, StoryObj } from "@storybook/react-vite";
import VisuallyHidden from "./VisuallyHidden";
import contract from "./VisuallyHidden.contract.json";

const meta = {
  title: "Atoms/VisuallyHidden",
  component: VisuallyHidden,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    children: {
      control: "text",
      description: "Text announced to assistive technology only",
      table: { category: "Content" },
    },
    as: {
      control: "select",
      options: ["span", "div", "p", "h2"],
      description: "Semantic element wrapper",
      table: { category: "Structure", defaultValue: { summary: "span" } },
    },
    className: {
      description: "Class Name",
      control: false, table: { category: "Advanced" } },
  },
  args: { children: "Additional context for screen readers", as: "span" },
} satisfies Meta<typeof VisuallyHidden>;

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
    <button
      type="button"
      style={{
        fontFamily: "var(--font-text)",
        padding: "var(--space-internal-12)",
      }}
    >
      Save
      <VisuallyHidden> — saves your profile changes</VisuallyHidden>
    </button>
  ),
};

export const ForcedColors: Story = { globals: { forcedColors: "active" } };
