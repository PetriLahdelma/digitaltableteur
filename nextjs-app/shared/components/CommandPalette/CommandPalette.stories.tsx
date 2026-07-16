import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
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
  tags: ["beta", "autodocs"],
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  argTypes: {
    open: {
      control: "boolean",
      description: "Whether the palette is open (controlled).",
      table: { category: "Behavior" },
    },
    onClose: {
      description: "Called to request close (Escape, overlay click, or after a selection).",
      table: { category: "Behavior", type: { summary: "() => void" } },
    },
    items: {
      control: { type: "select" },
      options: ["full", "minimal"],
      mapping: { full: commands, minimal: commands.slice(0, 2) },
      description: "Commands to show, in order. Each: { id, label, onSelect, keywords?, icon? }.",
      table: { category: "Content", type: { summary: "CommandPaletteItem[]" } },
    },
    label: {
      control: "text",
      description: "Accessible name for the dialog + listbox.",
      table: { category: "Accessibility", defaultValue: { summary: "Command palette" } },
    },
    placeholder: {
      control: "text",
      description: "Search input placeholder.",
      table: { category: "Content", defaultValue: { summary: "Search commands…" } },
    },
    emptyText: {
      control: "text",
      description: "Shown when nothing matches.",
      table: { category: "Content", defaultValue: { summary: "No results" } },
    },
    className: {
      control: "text",
      description: "Additional CSS class names for the dialog.",
      table: { category: "Appearance" },
    },
  },
  args: {
    open: true,
    items: "full" as unknown as CommandPaletteProps["items"],
    label: "Command palette",
    placeholder: "Search commands…",
    emptyText: "No results",
    className: "",
  },
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
  tags: ["beta-matrix"],
  render: (args) => <Harness {...args} />,
  // The palette renders in a portal (document.body), so this drives the combobox
  // and roving active-option there and leaves the dialog open (axe validates the
  // open state). The canvas snapshot is only the trigger button, unperturbed.
  play: async () => {
    const body = within(document.body);
    const input = body.getByRole("combobox");
    await userEvent.type(input, "blog");
    await userEvent.keyboard("{ArrowDown}{ArrowUp}");
    await expect(body.getByRole("dialog")).toBeInTheDocument();
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  render: (args) => <Harness {...args} />,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  render: () => (
    <Harness open items={commands} label="Command palette" placeholder="Type a command…" onClose={() => {}} />
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: { a11y: { disable: true, test: "off" } },
  render: (args) => <Harness {...args} />,
};
