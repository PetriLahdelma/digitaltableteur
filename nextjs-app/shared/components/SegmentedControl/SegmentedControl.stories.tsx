import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import SegmentedControl, {
  type SegmentedControlItem,
  type SegmentedControlProps,
} from "./SegmentedControl";
import contract from "./SegmentedControl.contract.json";

const items: SegmentedControlItem[] = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "board", label: "Board" },
];

const meta = {
  title: "Navigation/SegmentedControl",
  component: SegmentedControl,
  tags: ["beta", "autodocs"],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  argTypes: {
    items: {
      control: { type: "select" },
      options: ["default", "compact"],
      mapping: { default: items, compact: items.slice(0, 2) },
      description: "Segments to render, in order. Each: { value, label, disabled? }.",
      table: { category: "Content", type: { summary: "SegmentedControlItem[]" } },
    },
    value: {
      control: "text",
      description: "Currently selected value (controlled).",
      table: { category: "Behavior" },
    },
    onValueChange: {
      description: "Called with the new value when a segment is selected.",
      table: { category: "Behavior", type: { summary: "(value: string) => void" } },
    },
    size: {
      control: { type: "radio" },
      options: ["sm", "md", "lg"],
      description: "Size token.",
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    ariaLabel: {
      control: "text",
      description: "Accessible name for the group (required; announced by screen readers).",
      table: { category: "Accessibility" },
    },
    className: {
      control: "text",
      description: "Additional CSS class names.",
      table: { category: "Appearance" },
    },
  },
  args: {
    items: "default" as unknown as SegmentedControlProps["items"],
    value: "list",
    size: "md",
    ariaLabel: "View",
    className: "",
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const Controlled = (args: SegmentedControlProps) => {
  const [value, setValue] = useState(args.value);
  return <SegmentedControl {...args} value={value} onValueChange={setValue} />;
};

export const Default: Story = {
  tags: ["beta-matrix"],
  render: (args) => <Controlled {...args} />,
  // Exercises pointer + roving-tabindex arrow navigation. The moves net to zero
  // (re-select the already-selected segment, then ArrowRight/ArrowLeft round-trip)
  // so the settled selection is unchanged and the captured AT snapshot is stable.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("radio", { name: "List" });
    await userEvent.click(list);
    await expect(list).toBeChecked();
    list.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowLeft}");
    await expect(list).toBeChecked();
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <Controlled {...args} />,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  render: () => {
    const withDisabled: SegmentedControlItem[] = [
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "month", label: "Month", disabled: true },
    ];
    return <Controlled items={withDisabled} value="day" ariaLabel="Range" size="md" onValueChange={() => {}} />;
  },
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: { a11y: { disable: true, test: "off" } },
  render: (args) => <Controlled {...args} />,
};
