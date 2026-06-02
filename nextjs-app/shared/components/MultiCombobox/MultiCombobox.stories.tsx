import contract from "./MultiCombobox.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { MultiCombobox, type MultiComboboxOption } from "./MultiCombobox";

const OPTIONS: MultiComboboxOption[] = [
  { value: "research", label: "Research" },
  { value: "design", label: "Design" },
  { value: "frontend", label: "Frontend" },
  { value: "accessibility", label: "Accessibility" },
];

/** Stateful wrapper — MultiCombobox is controlled (string[]). */
function MultiComboboxDemo(
  props: Partial<React.ComponentProps<typeof MultiCombobox>>,
) {
  const [value, setValue] = useState<string[]>(props.value ?? []);
  return (
    <MultiCombobox
      label="Disciplines"
      options={OPTIONS}
      placeholder="Add disciplines…"
      {...props}
      value={value}
      onValueChange={setValue}
    />
  );
}

const meta = {
  title: "Molecules/MultiCombobox",
  component: MultiCombobox,
  tags: ["beta", "!autodocs"],
  parameters: {
    contractStatus: contract.status,
    a11y: { test: "error" },
    layout: "padded",
  },
  argTypes: {
    label: {
      control: "text",
      description: "Field label (associates the input)",
      table: { category: "Content" },
    },
    options: {
      control: "object",
      description: "Selectable options",
      table: { category: "Content" },
    },
    value: {
      control: "object",
      description: "Selected values (controlled string[])",
      table: { category: "State" },
    },
    onValueChange: {
      description: "Called with the next selected values",
      table: {
        category: "Events",
        type: { summary: "(value: string[]) => void" },
      },
    },
    placeholder: {
      control: "text",
      description: "Shown when nothing is selected",
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
} satisfies Meta<typeof MultiCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: () => <MultiComboboxDemo />,
};

export const Playground: Story = {
  args: {
    label: "Disciplines",
    options: OPTIONS,
    value: [],
    placeholder: "Add disciplines…",
    onValueChange: () => {},
  },
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  parameters: { controls: { disable: true } },
  render: () => (
    <MultiComboboxDemo
      value={["design", "accessibility"]}
      helperText="Pick all that apply"
    />
  ),
};

/** Opens with ArrowDown, toggles an option with Enter — keyboard-only. */
export const KeyboardMultiSelect: Story = {
  tags: ["beta-matrix"],
  render: () => <MultiComboboxDemo />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox");
    input.focus(); // onFocus opens the list (highlight starts at index 0)
    await waitFor(() => expect(screen.getByRole("listbox")).toBeVisible());
    await userEvent.keyboard("{ArrowDown}{Enter}"); // move to 2nd option, toggle
    // Multi-select keeps the list open; the moved-to option is now aria-selected
    // and a chip is added to the field.
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /design/i })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true, test: "off" } },
  globals: { forcedColors: "active" },
  render: () => <MultiComboboxDemo value={["design"]} />,
};
