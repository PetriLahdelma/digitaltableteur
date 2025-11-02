import React from "react";
import Badge from "./Badge";
import { within, userEvent } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";
import * as FaIcons from "react-icons/fa";

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
      control: { type: "text" },
      description:
        "Enter a react-icons/fa component name (e.g. FaBeer) to display in the badge",
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
    icon: "",
    removable: false,
    square: false,
    size: "m",
  },
};

import { StoryFn } from "@storybook/react-vite";
type BadgeProps = React.ComponentProps<typeof Badge>;

// Template as a component to avoid hook issues
const BadgeStoryTemplate: React.FC<BadgeProps> = (args) => {
  const { t } = useTranslation();
  const { icon, children, ...rest } = args;
  let content = children;
  if (typeof children === "string" && children.startsWith("badge")) {
    content = t(children);
  }
  const iconName = typeof icon === "string" ? icon.trim() : null;
  const iconLibrary = FaIcons as Record<string, React.ComponentType>;
  const IconComponent = iconName ? iconLibrary[iconName] : undefined;
  const resolvedIcon =
    typeof icon === "string"
      ? IconComponent
        ? React.createElement(IconComponent)
        : null
      : icon;

  return (
    <Badge {...rest} icon={resolvedIcon}>
      {content}
    </Badge>
  );
};

const Template: StoryFn<BadgeProps> = (args: BadgeProps) => (
  <BadgeStoryTemplate {...args} />
);

export const Playground = Template.bind({});
Playground.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/badge/i);
  await userEvent.tab();
};

export const AllVariants: StoryFn<BadgeProps> = (args) => {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <Badge design="primary">{t("badgePrimary")}</Badge>
      <Badge design="secondary">{t("badgeSecondary")}</Badge>
      <Badge design="primary" state="success">
        {t("badgeSuccess")}
      </Badge>
      <Badge design="primary" state="error">
        {t("badgeError")}
      </Badge>
      <Badge design="primary" state="warning">
        {t("badgeWarning")}
      </Badge>
      <Badge design="primary" state="info">
        {t("badgeInfo")}
      </Badge>

      <Badge design="primary" state="neutral">
        {t("badgeNeutral")}
      </Badge>
    </div>
  );
};
AllVariants.play = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/primary/i);
  await canvas.findByText(/secondary/i);
  await canvas.findByText(/success/i);
  await canvas.findByText(/error/i);
  await canvas.findByText(/warning/i);
  await canvas.findByText(/info/i);
  await canvas.findByText(/neutral/i);
};

export const Removable = Template.bind({});
Removable.args = {
  removable: true,
  children: "badgeRemovable",
  design: "primary",
  state: undefined,
};
Removable.parameters = {
  // Prevent the play function from removing the badge before the user sees it
  play: undefined,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  design: "primary",
  state: "info",
  children: "badgeInfo",
  icon: "FaInfoCircle",
};

export const AllSizes: StoryFn<BadgeProps> = (args) => {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Badge size="s" design="primary">
        {t("badgeSmall")}
      </Badge>
      <Badge size="m" design="primary">
        {t("badgeMedium")}
      </Badge>
      <Badge size="l" design="primary">
        {t("badgeLarge")}
      </Badge>
    </div>
  );
};
AllSizes.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  await canvas.findByText(/small/i);
  await canvas.findByText(/medium/i);
  await canvas.findByText(/large/i);
};
