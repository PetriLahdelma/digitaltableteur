import React from "react";
import Badge from "./Badge";
import * as FaIcons from "react-icons/fa";
import { within, userEvent } from "@storybook/testing-library";

// Dynamically generate all icon options from react-icons/fa
const iconOptions = {
  None: null,
  ...Object.fromEntries(
    Object.entries(FaIcons).map(([name, Icon]) => [name, <Icon key={name} />]),
  ),
};

export default {
  title: "Components/Badge",
  component: Badge,
  argTypes: {
    design: {
      control: { type: "select" },
      options: ["primary", "secondary"],
      description: "Badge design variant",
    },
    state: {
      control: { type: "select" },
      options: ["success", "info", "error", "warning", "neutral"],
      description: "Semantic state color",
    },
    children: { control: "text", description: "Badge content" },
    className: { control: "text", description: "Custom class name" },
    removable: {
      control: "boolean",
      description: "Show a close button to remove the badge",
    },
    square: {
      control: "boolean",
      description: "Toggle square (no border-radius) style",
    },
    onRemove: {
      action: "removed",
      description: "Callback when badge is removed",
    },
    icon: {
      control: { type: "select" },
      options: Object.keys(iconOptions),
      mapping: iconOptions,
      description: "React icon to display in the badge",
    },
    size: {
      control: { type: "select" },
      options: ["s", "m", "l"],
      description: "Badge size: small (s), medium (m), or large (l)",
    },
  },
  args: {
    design: "primary",
    state: undefined,
    children: "Badge",
    icon: null,
    removable: false,
    square: false,
    size: "m",
  },
};

import { StoryFn } from "@storybook/react-vite";
type BadgeProps = React.ComponentProps<typeof Badge>;

const Template: StoryFn<BadgeProps> = (args: BadgeProps) => <Badge {...args} />;

export const Playground = Template.bind({});
Playground.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/badge/i);
  await userEvent.tab();
};

export const AllVariants: StoryFn<BadgeProps> = (args) => (
  <div style={{ display: "flex", gap: "1rem" }}>
    <Badge design="primary">Primary</Badge>
    <Badge design="secondary">Secondary</Badge>
    <Badge design="primary" state="success">
      Success
    </Badge>
    <Badge design="primary" state="info">
      Info
    </Badge>
    <Badge design="primary" state="error">
      Error
    </Badge>
    <Badge design="primary" state="warning">
      Warning
    </Badge>
    <Badge design="primary" state="neutral">
      Neutral
    </Badge>
  </div>
);
AllVariants.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/primary/i);
  await canvas.findByText(/secondary/i);
  await canvas.findByText(/success/i);
  await canvas.findByText(/info/i);
  await canvas.findByText(/error/i);
  await canvas.findByText(/warning/i);
  await canvas.findByText(/neutral/i);
};

export const Removable = Template.bind({});
Removable.args = {
  removable: true,
  children: "Removable Badge",
  design: "primary",
  state: undefined,
};
Removable.parameters = {
  // Prevent the play function from removing the badge before the user sees it
  play: undefined,
};

export const AllSizes: StoryFn<BadgeProps> = (args) => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
    <Badge size="s" design="primary">
      Small
    </Badge>
    <Badge size="m" design="primary">
      Medium
    </Badge>
    <Badge size="l" design="primary">
      Large
    </Badge>
  </div>
);
AllSizes.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/small/i);
  await canvas.findByText(/medium/i);
  await canvas.findByText(/large/i);
};
