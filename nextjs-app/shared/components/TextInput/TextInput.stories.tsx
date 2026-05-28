import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { TextInput } from "./TextInput";
import contract from "./TextInput.contract.json";

const defaultArgs = {
  placeholder: "Search components…",
  size: "md" as const,
  clearable: true,
  error: false,
};

const meta = {
  title: "Atoms/TextInput",
  component: TextInput,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Input height / typography scale",
      table: { defaultValue: { summary: "md" } },
    },
    startIcon: {
      control: false,
      description: "Leading affordance icon",
    },
    endIcon: {
      control: false,
      description: "Trailing icon slot",
    },
    clearable: {
      control: "boolean",
      description: "Show clear button when value present",
    },
    onClear: {
      action: "clear",
      description: "Clear button handler",
    },
    error: {
      control: "boolean",
      description: "Error border state (message lives in FormField)",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    disabled: {
      control: "boolean",
      description: "Native disabled state",
    },
    value: {
      control: "text",
      description: "Controlled value",
      table: { disable: true },
    },
    onChange: {
      action: "change",
      description: "Input change handler",
      table: { disable: true },
    },
    className: {
      control: "text",
      description: "Input class names",
      table: { disable: true },
    },
  },
  args: {
    ...defaultArgs,
    startIcon: <MagnifyingGlass className="size-4" aria-hidden />,
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Playground: Story = {};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div style={{ width: 320 }}>
      <TextInput
        placeholder="Search…"
        startIcon={<MagnifyingGlass className="size-4" aria-hidden />}
        clearable
      />
    </div>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  args: {
    ...defaultArgs,
    startIcon: <MagnifyingGlass className="size-4" aria-hidden />,
  },
};
