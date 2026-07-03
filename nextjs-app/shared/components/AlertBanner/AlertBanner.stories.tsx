import contract from "./AlertBanner.contract.json";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import AlertBanner from "@dt/AlertBanner";

const meta: Meta<typeof AlertBanner> = {
  title: "Feedback/AlertBanner",
  component: AlertBanner,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=394-41",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    tone: {
      control: { type: "select" },
      options: ["info", "success", "warning", "error"],
      description: "Semantic tone controlling icon and surface colors",
      table: { defaultValue: { summary: "info" } },
    },

    title: { control: "text", description: "Alert heading text" },

    description: { control: "text", description: "Supporting body copy" },

    dismissible: {
      control: "boolean",
      description: "Shows a dismiss control when true",
      table: { defaultValue: { summary: "false" } },
    },
    onDismiss: {
      action: "dismissed",
      description: "Called when the user dismisses the banner",
      table: { disable: true },
    },
    "aria-live": {
      control: { type: "select" },
      options: ["polite", "assertive", "off"],
      description: "Live region politeness for assistive tech",
      table: { defaultValue: { summary: "polite" }, disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AlertBanner>;

export const Info: Story = {
  args: {
    tone: "info",
    title: "Heads up",
    description: "This is an informational message.",
  },
};

export const Warning: Story = {
  args: {
    tone: "warning",
    title: "Check details",
    description: "There might be something you need to review.",
  },
};

export const Dismissible: Story = {
  args: {
    tone: "success",
    title: "Saved",
    description: "Your changes have been stored.",
    dismissible: true,
  },
};

export const Default = Info;

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  args: Dismissible.args,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
