import contract from "./Badge.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";

import Badge from "@dt/Badge";
import Text from "@dt/Text";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
const STATE_ICON_MAP: Record<string, string> = {
  success: "check-circle",
  info: "info",
  error: "warning-circle",
  warning: "warning",
};

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=400-1249",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    // Disable global WIP badge to prevent duplicate 'Badge' text collision in tests
    llm: { schema },
  },
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

    iconName: {
      control: { type: "text" },
      description:
        "Enter a Phosphor icon name (e.g. palette) to display inside the badge. Defaults to a semantic icon when empty.",
    },

    size: {
      control: { type: "select" },
      options: ["s", "m", "l"],
      description: "Badge size: small (s), medium (m), or large (l)",
      table: { defaultValue: { summary: "m" } },
    },
  },
  args: {
    design: "primary",
    state: undefined,
    children: "Badge",
    iconName: "",
    removable: false,
    square: false,
    size: "m",
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;
type BadgeProps = React.ComponentProps<typeof Badge>;

const BadgeStoryTemplate: React.FC<BadgeProps & { iconName?: string }> = (
  args,
) => {
  const { t } = useTranslation();
  const { iconName, children, state, ...rest } = args;
  let content = children;
  if (typeof children === "string" && children.startsWith("badge")) {
    content = t(children);
  }

  const resolvedName =
    iconName && iconName.trim()
      ? iconName.trim()
      : state && STATE_ICON_MAP[state];

  const resolvedIcon = resolvedName ? (
    <Icon name={resolvedName} ariaLabel={resolvedName} />
  ) : undefined;

  return (
    <Badge {...rest} state={state} icon={resolvedIcon}>
      {content}
    </Badge>
  );
};

const Template = (args: BadgeProps & { iconName?: string }) => (
  <BadgeStoryTemplate {...args} />
);

const badgeComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure",
    rule: "Complete file structure",
    status: "pass",
    details: "All 5 files present",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict",
    status: "pass",
    details: "Exported interface, forwardRef",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "useTranslation, all keys present",
  },
  {
    id: "css-modules",
    rule: "CSS Modules",
    status: "pass",
    details: "No inline styles",
  },
  {
    id: "design-tokens",
    rule: "Design tokens",
    status: "pass",
    details: "Now 100% - no hardcoded fallbacks",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "No physical directions found",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "Uses token variables",
  },
  {
    id: "size-variants",
    rule: "Size variants",
    status: "pass",
    details: "s/m/l implemented",
  },
  {
    id: "state-variants",
    rule: "State variants",
    status: "pass",
    details: "success/info/error/warning/neutral",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "aria-label on close button",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "File exists",
  },
  { id: "tests", rule: "Tests", status: "pass", details: "File exists" },
];

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  render: Template,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(/Badge$/i);
    await userEvent.tab();
  },
};

export const Default = Playground;

const AllVariantsContent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
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

export const AllVariants: Story = {
  render: () => <AllVariantsContent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(/primary/i);
    await canvas.findByText(/secondary/i);
    await canvas.findByText(/success/i);
    await canvas.findByText(/error/i);
    await canvas.findByText(/warning/i);
    await canvas.findByText(/info/i);
    await canvas.findByText(/neutral/i);
  },
};

const SecondaryVariantsContent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Badge design="secondary">{t("badgeSecondary")}</Badge>
        <Badge design="secondary" state="success">
          {t("badgeSuccess")}
        </Badge>
        <Badge design="secondary" state="error">
          {t("badgeError")}
        </Badge>
        <Badge design="secondary" state="warning">
          {t("badgeWarning")}
        </Badge>
        <Badge design="secondary" state="info">
          {t("badgeInfo")}
        </Badge>
        <Badge design="secondary" state="neutral">
          {t("badgeNeutral")}
        </Badge>
      </div>
      <Text terminals="sans" size="S">
        Secondary badges have no background, only border and text color changes
      </Text>
    </div>
  );
};

export const SecondaryVariants: Story = {
  render: () => <SecondaryVariantsContent />,
};

export const Removable: Story = {
  render: Template,
  args: {
    removable: true,
    children: "badgeRemovable",
    design: "primary",
    state: undefined,
  },
};

export const WithIcon: Story = {
  render: Template,
  args: {
    design: "primary",
    state: "info",
    children: "badgeInfo",
    iconName: "info",
  },
};

const AutoSemanticIconsContent: React.FC = () => (
  <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
    <div style={{ display: "flex", gap: "1rem" }}>
      <BadgeStoryTemplate design="primary" state="success">
        Success
      </BadgeStoryTemplate>
      <BadgeStoryTemplate design="primary" state="info">
        Info
      </BadgeStoryTemplate>
      <BadgeStoryTemplate design="primary" state="error">
        Error
      </BadgeStoryTemplate>
      <BadgeStoryTemplate design="primary" state="warning">
        Warning
      </BadgeStoryTemplate>
      <BadgeStoryTemplate design="primary" state="neutral">
        Neutral
      </BadgeStoryTemplate>
    </div>
    <Text terminals="sans" size="M">
      Icons automatically selected based on state when icon prop is empty
    </Text>
  </div>
);

export const AutoSemanticIcons: Story = {
  render: () => <AutoSemanticIconsContent />,
};

const AllSizesContent: React.FC = () => {
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

export const AllSizes: Story = {
  render: () => <AllSizesContent />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(/small/i);
    await canvas.findByText(/medium/i);
    await canvas.findByText(/large/i);
  },
};

export const Z_BadgeCompliance: Story = {
  parameters: { docs: { disable: true } },
  render: () => (
    <ComplianceCard
      title="Compliance: 12/12"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={badgeComplianceRules}
    />
  ),
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => <AllVariantsContent />,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
