import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { userEvent, within } from "storybook/test";
import { NextMobileMenu } from "./NextMobileMenu";
import contract from "./NextMobileMenu.contract.json";

const navItems = [
  { href: "/", label: "Home", exact: true },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const languages = [
  { code: "en", label: "EN", ariaLabel: "English" },
  { code: "fi", label: "FI", ariaLabel: "Finnish" },
  { code: "sv", label: "SV", ariaLabel: "Swedish" },
];

function MobileMenuDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ minHeight: 480 }}>
      <button type="button" onClick={() => setOpen(true)}>
        Open menu
      </button>
      <NextMobileMenu
        isOpen={open}
        onClose={() => setOpen(false)}
        navItems={navItems}
        languages={languages}
        id="story-mobile-menu"
      />
    </div>
  );
}

const defaultArgs = {
  isOpen: true,
  navItems,
  languages,
  id: "story-mobile-menu",
};

const meta = {
  title: "Patterns/NextMobileMenu",
  component: NextMobileMenu,
  tags: ["beta", "!autodocs"],
  parameters: {
    layout: "fullscreen",
    contractStatus: contract.status,
    a11y: { test: "error" },
    docs: { description: { component: contract.description } },
  },
  argTypes: {
    isOpen: { control: "boolean", description: "Drawer open state" },
    onClose: { action: "close", description: "Close handler" },
    onNavigate: { action: "navigate", description: "Navigate handler" },
    id: { control: "text", description: "Dialog id for aria-controls" },
    navItems: { control: false, description: "Mobile navigation links" },
    languages: { control: false, description: "Language switcher options" },
  },
  args: defaultArgs,
} satisfies Meta<typeof NextMobileMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <MobileMenuDemo />,
};
export const Playground: Story = {
  render: () => <MobileMenuDemo />,
};

Playground.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.tab();
};

export const Example: Story = {
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => <MobileMenuDemo />,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  render: () => <MobileMenuDemo />,
};
