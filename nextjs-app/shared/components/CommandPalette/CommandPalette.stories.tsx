import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import {
  CommandPalette,
  type CommandPaletteItem,
  type CommandPaletteProps,
} from "./CommandPalette";
import contract from "./CommandPalette.contract.json";

const commands: CommandPaletteItem[] = [
  { id: "home", label: "Go to Home", keywords: ["start", "index"], onSelect: () => {} },
  { id: "blog", label: "Go to Blog", keywords: ["articles", "posts"], onSelect: () => {} },
  { id: "work", label: "Go to Work", keywords: ["projects", "portfolio"], onSelect: () => {} },
  { id: "contact", label: "Go to Contact", keywords: ["email", "reach"], onSelect: () => {} },
  { id: "new-post", label: "New blog post", keywords: ["create", "write"], onSelect: () => {} },
];

const meta = {
  title: "Navigation/CommandPalette",
  component: CommandPalette,
  tags: ["alpha", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  args: { open: true, items: commands, label: "Command palette" },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

const Harness = (args: CommandPaletteProps) => {
  const [open, setOpen] = useState(args.open);
  return (
    <div style={{ minHeight: "60vh", padding: "1rem" }}>
      <button type="button" onClick={() => setOpen(true)}>
        Open command palette
      </button>
      <CommandPalette {...args} open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Harness {...args} />,
};

export const Playground: Story = {
  render: (args) => <Harness {...args} />,
};

export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Harness open items={commands} label="Command palette" placeholder="Type a command…" onClose={() => {}} />
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  parameters: { a11y: { disable: true, test: "off" } },
  render: (args) => <Harness {...args} />,
};
