import type { Meta, StoryObj } from "@storybook/react-vite";
import TextArea from "./TextArea";
import contract from "./TextArea.contract.json";

const meta = {
  title: "Atoms/TextArea",
  component: TextArea,
  tags: ["!autodocs"],
  parameters: {
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    label: {
      control: "text",
      description: "Visible field label (omit for aria-label-only usage)",
      table: { category: "Content" },
    },
    placeholder: { control: "text", table: { category: "Content" } },
    helperText: { control: "text", table: { category: "Content" } },
    error: {
      control: "text",
      description: "Error message or invalid state",
      table: { category: "Validation" },
    },
    showCount: {
      control: "boolean",
      description: "Show live character count (pairs with maxLength)",
      table: { category: "Validation", defaultValue: { summary: "false" } },
    },
    maxLength: {
      control: { type: "number", min: 1 },
      table: { category: "Validation" },
    },
    rows: {
      control: { type: "number", min: 2, max: 20 },
      table: { category: "Layout", defaultValue: { summary: "4" } },
    },
    resize: {
      control: "radio",
      options: ["none", "vertical", "both"],
      table: { category: "Layout", defaultValue: { summary: "vertical" } },
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    isDisabled: { control: "boolean", table: { category: "State" } },
    onValueChange: { action: "valueChanged", table: { category: "Events" } },
    className: { control: false, table: { category: "Advanced" } },
  },
  args: {
    label: "Message",
    placeholder: "How can we help?",
    helperText: "Max 500 characters.",
    rows: 4,
    resize: "vertical",
    size: "md",
    isDisabled: false,
    showCount: false,
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Default: Story = Playground;

export const WithError: Story = {
  args: { error: "Message is required.", helperText: undefined },
};

export const WithCharacterCount: Story = {
  args: {
    label: undefined,
    "aria-label": "Message",
    showCount: true,
    maxLength: 200,
    value: "Hello",
  },
};

export const BareTextarea: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <TextArea aria-label="Notes" placeholder="Add a note…" rows={3} />
  ),
};

export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <TextArea
      label="Project brief"
      helperText="Share goals, timeline, and constraints."
      rows={5}
    />
  ),
};

export const ForcedColors: Story = { globals: { forcedColors: "active" } };
