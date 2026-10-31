import contract from "./NavMenuList.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import NavMenuList from "@dt/NavMenuList";
import Icon from "@dt/Icon";

const meta: Meta<typeof NavMenuList> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts).
  title: "Site/NavMenuList",
  component: NavMenuList,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-nav-menu-list",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};
export default meta;

type Story = StoryObj<typeof NavMenuList>;

export const Default: Story = {
  tags: ["beta-matrix"],
  render: () => (
    <NavMenuList
      items={[
        { to: "/", label: "Home", exact: true },
        { to: "/work", label: "Work" },
        { to: "/about", label: "About" },
        { to: "/blog", label: "Blog" },
        { to: "/contact", label: "Contact" },
      ]}
    />
  ),
};

export const CustomActiveClass: Story = {
  render: () => (
    <NavMenuList
      items={[
        { to: "/", label: "Home", exact: true },
        { to: "/work", label: "Work" },
        { to: "/about", label: "About" },
      ]}
      activeClassName="demoActive"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates overriding the active class. In production, supply a class that applies brand-specific styling.",
      },
    },
  },
};

export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    items: {
      control: { type: "select" },
      options: ["site", "three"],
      mapping: {
        site: [
          { to: "/", label: "Home", exact: true },
          { to: "/work", label: "Work" },
          { to: "/about", label: "About" },
          { to: "/blog", label: "Blog" },
          { to: "/contact", label: "Contact" },
        ],
        three: [
          { to: "/", label: "Home", exact: true },
          { to: "/work", label: "Work" },
          { to: "/contact", label: "Contact" },
        ],
      },
      description:
        "Navigation items (to, label, exact). Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "NavMenuItem[]" } },
    },
  },
  args: {
    items: "site" as never,
  },
};
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
