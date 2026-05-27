import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./Tag";
import contract from "./Tag.contract.json";

const meta = {
  title: "Atoms/Tag",
  component: Tag,
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    docs: {
      description: {
        component: contract.description,
      },
    },
  },
  argTypes: {
    children: { control: "text", table: { category: "Content" } },
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
      table: { defaultValue: { summary: "default" } },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      table: { defaultValue: { summary: "md" } },
    },
    showIcon: { control: "boolean" },
  },
  args: {
    children: "Design systems",
    variant: "default",
    size: "md",
  },
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

export const SemanticLarge: Story = {
  args: {
    children: "Action required",
    variant: "error",
    size: "lg",
  },
};
