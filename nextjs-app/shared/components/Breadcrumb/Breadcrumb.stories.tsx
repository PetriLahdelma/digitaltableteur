import contract from "./Breadcrumb.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import Breadcrumb from "@dt/Breadcrumb";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";

const meta: Meta<typeof Breadcrumb> = {
  title: "Molecules/Breadcrumb",
  component: Breadcrumb,
  tags: ["beta", "!autodocs"],
  parameters: {
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    items: {
      control: "object",
      description: "Breadcrumb items (label, optional href)",
    },
    "aria-label": {
      control: "text",
      description: "Accessible name for the nav landmark",
      table: { defaultValue: { summary: "Breadcrumb" } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: "Article" },
    ],
  },
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
};

export const Example: Story = {
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Contact", href: "/contact" },
    ],
  },
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
