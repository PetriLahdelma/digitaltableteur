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
  title: "Forms/MultiCombobox",
  component: MultiCombobox,
  tags: ["beta", "autodocs"],
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
    disabled: {
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
  tags: ["beta-matrix"],
  args: {
    label: "Disciplines",
    options: OPTIONS,
    value: [],
    placeholder: "Add disciplines…",
    onValueChange: () => {},
  },
};

export const Example: Story = {
  tags: ["beta-matrix", "example"],
  globals: { forcedColors: "none" },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Tokenized selection: each chosen value renders as a removable Badge chip inside the field.",
      },
    },
  },
  render: () => (
    <MultiComboboxDemo
      value={["design", "accessibility"]}
      helperText="Pick all that apply"
    />
  ),
};

/** Form-level cap on selections — the field itself never blocks input. */
export const MaxItems: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Cap selections in your handler: ignore additions past the limit and surface the cap as an error.",
      },
    },
  },
  render: function MaxItemsStory() {
    const MAX = 2;
    const [value, setValue] = useState<string[]>(["research"]);
    const overLimit = value.length >= MAX;
    return (
      <MultiCombobox
        label="Disciplines (max 2)"
        options={OPTIONS}
        placeholder="Add disciplines…"
        value={value}
        onValueChange={(next) => {
          if (next.length > MAX) return;
          setValue(next);
        }}
        error={overLimit ? "Limit reached — remove one to add another." : undefined}
        helperText="Pick up to two."
      />
    );
  },
};

export const Overflow: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Many chips wrap onto new rows and the field grows; keep option labels short to keep the field compact.",
      },
    },
  },
  render: () => (
    <MultiComboboxDemo
      value={["research", "design", "frontend", "accessibility"]}
      helperText="The field grows with every chip."
    />
  ),
};

/** Type-to-filter to a single match, then select it with Enter — keyboard-only. */
export const KeyboardMultiSelect: Story = {
  tags: ["beta-matrix", "example"],
  parameters: {
    docs: {
      description: {
        story:
          "Type-to-filter plus Enter to toggle, asserted by the play function; Backspace with an empty filter removes the last chip.",
      },
    },
  },
  render: () => <MultiComboboxDemo />,
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("combobox");
    // Type-to-filter narrows to a single option and resets the highlight to it,
    // so Enter selects it deterministically — no dependence on auto-open
    // behavior or arrow-key index math.
    await userEvent.type(input, "acc");
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /accessibility/i }),
      ).toBeVisible(),
    );
    await userEvent.keyboard("{Enter}");
    // Multi-select keeps the list open; the option is now aria-selected and a
    // chip is added to the field.
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: /accessibility/i }),
      ).toHaveAttribute("aria-selected", "true"),
    );
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true, test: "off" } },
  globals: { forcedColors: "active" },
  render: () => <MultiComboboxDemo value={["design"]} />,
};
