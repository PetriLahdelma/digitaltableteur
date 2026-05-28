import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./Tag";
import contract from "./Tag.contract.json";

const defaultArgs = {
  children: "Design systems",
  variant: "default" as const,
  size: "md" as const,
  showIcon: true,
};

const meta = {
  title: "Atoms/Tag",
  component: Tag,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    children: {
      control: "text",
      description: "Visible tag label",
    },
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "outline",
        "success",
        "warning",
        "error",
        "info",
      ],
      description: "Color / emphasis variant",
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Tag size scale",
      table: { defaultValue: { summary: "md" } },
    },
    showIcon: {
      control: "boolean",
      description: "Show leading status icon when variant is semantic",
    },
    className: {
      control: "text",
      description: "Additional CSS class names",
      table: { disable: true },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

export const Example: Story = {
  name: "Example (article metadata)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      <Tag variant="secondary" size="sm">
        DesignOps
      </Tag>
      <Tag variant="outline" size="sm">
        Accessibility
      </Tag>
      <Tag variant="success" size="sm">
        Published
      </Tag>
      <Tag variant="warning" size="sm">
        Draft
      </Tag>
      <Tag variant="info" size="sm">
        Case study
      </Tag>
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
