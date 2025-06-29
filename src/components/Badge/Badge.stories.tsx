import React from "react";
import Badge from "./Badge";
import * as FaIcons from "react-icons/fa";
import { within } from "@storybook/testing-library";

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
      options: ["primary", "success", "info", "error", "neutral"],
      description: "Badge color variant",
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
    children: "Badge",
    icon: null,
    removable: false,
    square: false,
    size: "m",
  },
};

import { StoryFn } from "@storybook/react";
// If BadgeProps is a type exported from Badge.tsx, ensure it's exported as 'export type BadgeProps = ...' in Badge.tsx.
// import type { BadgeProps } from "./Badge";
type BadgeProps = React.ComponentProps<typeof Badge>;

const Template: StoryFn<BadgeProps> = (args: BadgeProps) => <Badge {...args} />;

export const Playground = Template.bind({});

export const Primary = Template.bind({});
Primary.args = {
  design: "primary",
  children: "Primary Badge",
};
Primary.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/primary badge/i);
};

export const AllVariants = () => (
  <div style={{ display: "flex", gap: "1rem" }}>
    <Badge design="primary">Primary</Badge>
    <Badge design="success" icon={<FaIcons.FaCheck />}>
      Success
    </Badge>
    <Badge design="info" icon={<FaIcons.FaInfoCircle />}>
      Info
    </Badge>
    <Badge design="error" icon={<FaIcons.FaExclamation />}>
      Error
    </Badge>
    <Badge design="neutral" icon={<FaIcons.FaTimes />}>
      Neutral
    </Badge>
  </div>
);

export const Removable = Template.bind({});
Removable.args = {
  removable: true,
  children: "Removable Badge",
};

export const AllSizes = () => (
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
