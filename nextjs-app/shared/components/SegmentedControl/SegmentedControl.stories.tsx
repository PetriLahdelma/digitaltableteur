import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
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
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  args: { items, value: "list", size: "md", ariaLabel: "View" },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const Controlled = (args: SegmentedControlProps) => {
  const [value, setValue] = useState(args.value);
  return <SegmentedControl {...args} value={value} onValueChange={setValue} />;
};

export const Default: Story = {
  render: (args) => <Controlled {...args} />,
};

export const Playground: Story = {
  render: (args) => <Controlled {...args} />,
};

export const Example: Story = {
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
  globals: { forcedColors: "active" },
  parameters: { a11y: { disable: true, test: "off" } },
  render: (args) => <Controlled {...args} />,
};
