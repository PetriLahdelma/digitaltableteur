import contract from "./Combobox.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import Combobox, { type ComboboxOption } from "./Combobox";

const OPTIONS: ComboboxOption[] = [
  { value: "asap", label: "ASAP" },
  { value: "1-2-months", label: "1–2 months" },
  { value: "flexible", label: "Flexible" },
];

/** Stateful wrapper — Combobox is controlled. */
function ComboboxDemo(props: Partial<React.ComponentProps<typeof Combobox>>) {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <Combobox
      label="Timeline"
      options={OPTIONS}
      placeholder="Select…"
      {...props}
      value={value}
      onValueChange={setValue}
    />
  );
}

const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  tags: ["beta", "!autodocs"],
  parameters: {
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  argTypes: {
    label: {
      control: "text",
      description: "Field label (associates the trigger)",
      table: { category: "Content" },
    },
    options: {
      control: "object",
      description: "Selectable options",
      table: { category: "Content" },
    },
    value: {
      control: "text",
      description: "Selected option value (controlled)",
      table: { category: "State" },
    },
    onValueChange: {
      description: "Called with the chosen value",
      table: {
        category: "Events",
        type: { summary: "(value: string) => void" },
      },
    },
    placeholder: {
      control: "text",
      description: "Shown when no value is selected",
      table: { category: "Content" },
    },
    helperText: {
      control: "text",
      description: "Assistive text below the field",
      table: { category: "Content" },
    },
    error: {
      control: "text",
      description: "Error message; sets aria-invalid",
      table: { category: "Validation" },
    },
    required: {
      control: "boolean",
      description: "Marks the field required",
      table: { category: "Validation" },
    },
    isDisabled: {
      control: "boolean",
      description: "Disables the control",
      table: { category: "State" },
    },
    className: {
      control: false,
      description: "Classes on the field wrapper",
      table: { category: "Advanced" },
    },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: () => <ComboboxDemo />,
};

export const Playground: Story = {
  args: {
    label: "Timeline",
    options: OPTIONS,
    value: "",
    placeholder: "Select…",
    onValueChange: () => {},
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComboboxDemo
      value="1-2-months"
      helperText="When should the project start?"
    />
  ),
};

/** Opens with ArrowDown, moves the highlight, selects with Enter — keyboard-only. */
export const KeyboardSelection: Story = {
  tags: ["beta-matrix"],
  render: () => <ComboboxDemo />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox");
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}"); // opens
    // Listbox is portaled to document.body.
    await waitFor(() => expect(screen.getByRole("listbox")).toBeVisible());
    await userEvent.keyboard("{ArrowDown}{Enter}"); // move to 2nd option, select
    expect(trigger).toHaveTextContent("1–2 months");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true, test: "off" } },
  globals: { forcedColors: "active" },
  render: () => <ComboboxDemo value="asap" />,
};
