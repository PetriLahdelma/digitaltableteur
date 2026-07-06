import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Kbd from "./Kbd";
import contract from "./Kbd.contract.json";

const meta = {
  title: "Content/Kbd",
  component: Kbd,
  tags: ["beta", "autodocs"],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Size token",
      table: { defaultValue: { summary: "md" } },
    },
    children: {
      control: "text",
      description: "Key label (text or symbols)",
    },
  },
  args: { size: "md", children: "⌘" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["beta-matrix", "example"],
  parameters: {
    docs: {
      description: { story: "A single keycap; the element is a semantic <kbd>." },
    },
  },
  args: { children: "Esc" },
};

export const Playground: Story = { tags: ["beta-matrix"] };

export const Example: Story = {
  tags: ["beta-matrix", "example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Shortcut combinations read naturally inline: compose several Kbds with + between them.",
      },
    },
  },
  render: () => (
    <span>
      <Kbd>⌘</Kbd> + <Kbd>K</Kbd>
    </span>
  ),
};

export const Sizes: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "sm/md/lg track the text ladder so keycaps sit well in prose of any size." },
    },
  },
  render: () => (
    <span>
      <Kbd size="sm">Shift</Kbd> <Kbd size="md">Shift</Kbd> <Kbd size="lg">Shift</Kbd>
    </span>
  ),
};

export const KeyNames: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Named keys keep their full word; symbols stay symbols." },
    },
  },
  render: () => (
    <span>
      <Kbd>Esc</Kbd> <Kbd>Enter</Kbd> <Kbd>Space</Kbd> <Kbd>Tab</Kbd>
    </span>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  parameters: { a11y: { disable: true, test: "off" } },
  args: { children: "Enter" },
};
