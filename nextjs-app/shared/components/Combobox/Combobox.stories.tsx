import contract from "./Combobox.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import Combobox from "./Combobox";

const OPTIONS = [
  { value: "asap", label: "ASAP" },
  { value: "1-2-months", label: "1–2 months" },
  { value: "flexible", label: "Flexible" },
];

const meta: Meta<typeof Combobox> = {
  title: "Molecules/Combobox",
  component: Combobox,
  tags: ["alpha", "wip", "!autodocs"],
  parameters: {
    contractStatus: contract.status,
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof Combobox>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <Combobox
        label="Timeline"
        options={OPTIONS}
        value={value}
        onValueChange={setValue}
        placeholder="Select..."
      />
    );
  },
};
