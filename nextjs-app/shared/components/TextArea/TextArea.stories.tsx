import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import TextArea from "./TextArea";
import contract from "./TextArea.contract.json";

const meta = {
  title: "Atoms/TextArea",
  component: TextArea,
  tags: ["beta", "!autodocs"],
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
    placeholder: {
      description: "Placeholder",
      control: "text",
      table: { category: "Content" },
    },
    helperText: {
      description: "Helper Text",
      control: "text",
      table: { category: "Content" },
    },
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
      description: "Max Length",
      control: { type: "number", min: 1 },
      table: { category: "Validation" },
    },
    rows: {
      description: "Rows",
      control: { type: "number", min: 2, max: 20 },
      table: { category: "Layout", defaultValue: { summary: "4" } },
    },
    resize: {
      description: "Resize",
      control: "radio",
      options: ["none", "vertical", "both"],
      table: { category: "Layout", defaultValue: { summary: "vertical" } },
    },
    size: {
      description: "Size",
      control: "select",
      options: ["sm", "md", "lg"],
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    isDisabled: {
      description: "Is Disabled",
      control: "boolean",
      table: { category: "State" },
    },
    onValueChange: {
      description: "On Value Change",
      action: "valueChanged",
      table: { category: "Events" },
    },
    className: {
      description: "Class Name",
      control: false,
      table: { category: "Advanced" },
    },
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

export const Playground: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
};
export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  ...Playground,
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const field = canvas.getByRole("textbox", { name: /message/i });
  await userEvent.click(field);
  await userEvent.type(field, "Project kickoff notes");
};

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
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true } },
  render: () => (
    <TextArea
      label="Project brief"
      helperText="Share goals, timeline, and constraints."
      rows={5}
    />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
