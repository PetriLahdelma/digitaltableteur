import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import AvatarGroup from "./AvatarGroup";
import Avatar from "@dt/Avatar";
import contract from "./AvatarGroup.contract.json";

const PEOPLE = ["Aino Virtanen", "Bo Lindqvist", "Carla Mendes", "Deniz Aydın", "Eero Salmi", "Freja Holm"];

const avatars = (count: number, size: "2rem" | "2.5rem" | "3rem" = "2.5rem") =>
  PEOPLE.slice(0, count).map((name) => (
    <Avatar key={name} name={name} variant="initials" size={size} />
  ));

const meta = {
  title: "Content/AvatarGroup",
  component: AvatarGroup,
  tags: ["alpha", "autodocs"],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  argTypes: {
    ariaLabel: { control: "text", description: "Accessible name for the cluster" },
    max: {
      control: { type: "number", min: 1, max: 8 },
      description: "Avatars shown before collapsing into +N",
      table: { defaultValue: { summary: "4" } },
    },
    size: {
      control: "radio",
      options: ["sm", "md", "lg"],
      description: "Overflow bubble size; children Avatars should match",
      table: { defaultValue: { summary: "md" } },
    },
    children: {
      control: {
        type: "select",
        labels: { three: "3 members", six: "6 members (overflows at max 4)" },
      },
      options: ["three", "six"],
      mapping: { three: avatars(3), six: avatars(6) },
      description: "@dt/Avatar elements (member presets here; pass Avatars in code)",
      table: { type: { summary: "ReactNode" } },
    },
  },
  args: { ariaLabel: "Project members", max: 4, size: "md", children: "six" },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: { story: "Six members, max 4: the stack shows four and collapses the rest into +2." },
    },
  },
};

export const Playground: Story = {};

export const NoOverflow: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "At or under max, every Avatar renders and no bubble appears." },
    },
  },
  render: () => <AvatarGroup ariaLabel="Reviewers">{avatars(3)}</AvatarGroup>,
};

export const Sizes: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "size sizes the +N bubble; pass matching Avatar sizes (sm=2rem, md=2.5rem, lg=3rem)." },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "flex-start" }}>
      <AvatarGroup ariaLabel="Team" size="sm" max={3}>
        {avatars(5, "2rem")}
      </AvatarGroup>
      <AvatarGroup ariaLabel="Team" size="md" max={3}>
        {avatars(5, "2.5rem")}
      </AvatarGroup>
      <AvatarGroup ariaLabel="Team" size="lg" max={3}>
        {avatars(5, "3rem")}
      </AvatarGroup>
    </div>
  ),
};

export const WithLabel: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Pair the stack with a text label when the count matters as much as the faces." },
    },
  },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <AvatarGroup ariaLabel="Contributors" max={3}>
        {avatars(6)}
      </AvatarGroup>
      <span>6 contributors</span>
    </div>
  ),
};

export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <AvatarGroup ariaLabel="Project members" max={4}>
      {avatars(6)}
    </AvatarGroup>
  ),
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  parameters: { a11y: { disable: true, test: "off" } },
  render: () => <AvatarGroup ariaLabel="Project members">{avatars(5)}</AvatarGroup>,
};
