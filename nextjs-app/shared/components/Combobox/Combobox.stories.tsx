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
  tags: ["beta", "autodocs"],
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
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: () => <ComboboxDemo />,
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  args: {
    label: "Timeline",
    options: OPTIONS,
    value: "",
    placeholder: "Select…",
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
          "A preselected value with helper text; the helper is linked to the trigger via aria-describedby.",
      },
    },
  },
  render: () => (
    <ComboboxDemo
      value="1-2-months"
      helperText="When should the project start?"
    />
  ),
};

export const WithError: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "error replaces the helper line, colors the control, and sets aria-invalid on the trigger.",
      },
    },
  },
  render: () => <ComboboxDemo required error="Pick a timeline to continue." />,
};

export const Disabled: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "disabled turns off the whole control; individual options can also carry their own disabled flag.",
      },
    },
  },
  render: () => (
    <ComboboxDemo
      value="asap"
      disabled
      helperText="Timeline is locked for this request."
    />
  ),
};

/** Options loaded after a delay — the pattern for API-backed lists. */
export const AsyncOptions: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Load options into state and swap the array in; while empty, the open listbox shows the localized no-results row.",
      },
    },
  },
  render: function AsyncOptionsStory() {
    const [options, setOptions] = useState<ComboboxOption[]>([]);
    const [value, setValue] = useState("");
    React.useEffect(() => {
      const timer = setTimeout(() => setOptions(OPTIONS), 1200);
      return () => clearTimeout(timer);
    }, []);
    return (
      <Combobox
        label="Timeline"
        options={options}
        placeholder={options.length === 0 ? "Loading…" : "Select…"}
        value={value}
        onValueChange={setValue}
        helperText="Options arrive from the network after ~1 second."
      />
    );
  },
};

/** Opens with ArrowDown, moves the highlight, selects with Enter — keyboard-only. */
export const KeyboardSelection: Story = {
  tags: ["beta-matrix", "example"],
  parameters: {
    docs: {
      description: {
        story:
          "The full APG keyboard model, driven by the play function: ArrowDown opens, arrows move aria-activedescendant, Enter selects, Escape closes.",
      },
    },
  },
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
