import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import ListItem from "./ListItem";
import Badge from "@dt/Badge";
import Kbd from "@dt/Kbd";
import StatusDot from "@dt/StatusDot";
import Icon from "@dt/Icon";
import contract from "./ListItem.contract.json";

const meta = {
  title: "Content/ListItem",
  component: ListItem,
  tags: ["beta", "autodocs"],
  parameters: {
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  args: {
    children: "Rename",
    tone: "neutral",
    selected: false,
    disabled: false,
    highlighted: false,
    // Seeded so the text control renders an input instead of a dead
    // "Set string" button ("" is the no-op default).
    className: "",
  },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["neutral", "destructive"],
      description: "Color treatment. destructive is for irreversible actions (delete, remove).",
      table: { defaultValue: { summary: "neutral" } },
    },
    selected: {
      control: "boolean",
      description: "Renders the check indicator in the trailing position. Visual only; semantic selection belongs to the consumer.",
    },
    disabled: {
      control: "boolean",
      description: "Visual disabled treatment via the canonical disabled tokens. The consumer carries aria-disabled.",
    },
    highlighted: {
      control: "boolean",
      description: "Parent-driven active row (combobox/palette). Radix menus work without it via [data-highlighted].",
    },
    icon: { table: { disable: true } },
    meta: { table: { disable: true } },
    trailingIcon: { table: { disable: true } },
    children: {
      control: "text",
      description: "Primary label. Truncates with an ellipsis; never wraps.",
    },
  },
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const column: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  inlineSize: "16rem",
};

export const Default: Story = { tags: ["beta-matrix"] };

export const Playground: Story = { tags: ["beta-matrix"] };

export const Slots: Story = {
  render: () => (
    <div style={column}>
      <ListItem icon={<Icon name="pencil" ariaLabel="" />}>Rename</ListItem>
      <ListItem meta="⌘K">Search</ListItem>
      <ListItem meta={<Kbd size="sm">⌘S</Kbd>}>Save</ListItem>
      <ListItem meta={<Badge size="sm" tone="info">New</Badge>}>Inbox</ListItem>
      <ListItem meta={<StatusDot tone="success" label="Online" />}>Server</ListItem>
      <ListItem meta="1.4 GB">Storage</ListItem>
      <ListItem trailingIcon={<Icon name="caret-right" ariaLabel="" />}>Share</ListItem>
      <ListItem selected>Finnish</ListItem>
    </div>
  ),
};

export const Destructive: Story = {
  render: () => (
    <div style={column}>
      <ListItem tone="destructive" icon={<Icon name="trash" ariaLabel="" />}>
        Delete project
      </ListItem>
      <ListItem tone="destructive" highlighted icon={<Icon name="trash" ariaLabel="" />}>
        Delete project
      </ListItem>
    </div>
  ),
};

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "States are visual only; the interactive wrapper owns the semantics. Here each row sits in a menuitem wrapper and the disabled rows carry aria-disabled on it, per the consumer contract.",
      },
    },
  },
  render: () => (
    <div style={column} role="menu" aria-label="States">
      <div role="menuitem">
        <ListItem>Default</ListItem>
      </div>
      <div role="menuitem">
        <ListItem highlighted>Highlighted</ListItem>
      </div>
      <div role="menuitem" aria-disabled="true">
        <ListItem disabled>Disabled</ListItem>
      </div>
      <div role="menuitem" aria-disabled="true">
        <ListItem disabled meta="⌘X">Disabled with meta</ListItem>
      </div>
    </div>
  ),
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={column}>
      <ListItem icon={<Icon name="pencil" ariaLabel="" />} meta={<Kbd size="sm">⌘R</Kbd>}>
        Rename
      </ListItem>
      <ListItem icon={<Icon name="copy-simple" ariaLabel="" />}>Duplicate</ListItem>
      <ListItem icon={<Icon name="share-network" ariaLabel="" />} trailingIcon={<Icon name="caret-right" ariaLabel="" />}>
        Share
      </ListItem>
      <ListItem selected>English</ListItem>
      <ListItem meta={<StatusDot tone="success" label="Synced" />}>Workspace</ListItem>
      <ListItem tone="destructive" icon={<Icon name="trash" ariaLabel="" />}>
        Delete
      </ListItem>
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Example,
};
