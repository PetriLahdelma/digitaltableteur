import contract from "./MultiCombobox.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import MultiCombobox from "./MultiCombobox";

const OPTIONS = [
  { value: "brand-identity", label: "Brand & Identity" },
  { value: "digital-product", label: "Digital Product" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const meta: Meta<typeof MultiCombobox> = {
  title: "Molecules/MultiCombobox",
  component: MultiCombobox,
  tags: ["alpha", "wip", "!autodocs"],
  parameters: {
    contractStatus: contract.status,
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof MultiCombobox>;

function MultiComboboxDemo(
  props: Partial<React.ComponentProps<typeof MultiCombobox>>,
) {
  const [value, setValue] = useState<string[]>(props.value ?? []);
  return (
    <MultiCombobox
      label="Project type"
      options={OPTIONS}
      value={value}
      onValueChange={setValue}
      placeholder="Select one or more..."
      {...props}
    />
  );
}

export const Default: Story = {
  render: () => <MultiComboboxDemo />,
};

export const Playground: Story = {
  render: () => <MultiComboboxDemo value={["website", "other"]} />,
};
