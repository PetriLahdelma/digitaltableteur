import contract from "./Badge.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within } from "storybook/test";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";
import Badge from "@dt/Badge";
import Button from "@dt/Button";
import schema from "./schema.json";

const TONE_ICON_MAP: Record<string, string> = {
  success: "check-circle",
  info: "info",
  error: "warning-circle",
  warning: "warning",
};

const meta: Meta<typeof Badge> = {
  title: "Content/Badge",
  component: Badge,
  tags: ["stable", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=400-1249",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    // Content
    children: {
      control: "text",
      description: "Badge label text.",
      table: { category: "Content" },
    },
    iconName: {
      control: { type: "text" },
      description:
        "Phosphor icon name (story knob); a semantic icon is supplied automatically for non-neutral tones when empty.",
      table: { category: "Content" },
    },
    icon: {
      // ReactNode — nothing useful to control; documented in the contract.
      table: { disable: true },
    },

    // Appearance
    variant: {
      control: { type: "inline-radio" },
      options: ["primary", "secondary"],
      description: "Visual weight (filled vs outlined).",
      table: { category: "Appearance", defaultValue: { summary: "primary" } },
    },
    tone: {
      control: { type: "inline-radio" },
      options: ["neutral", "error", "warning", "success", "info"],
      description:
        "Semantic colour, orthogonal to variant. Matches design tokens.",
      table: { category: "Appearance", defaultValue: { summary: "neutral" } },
    },
    size: {
      control: { type: "inline-radio" },
      options: ["sm", "md", "lg"],
      description: "Size step: 32/40/56px tall with 12/16/20px labels.",
      table: { category: "Appearance", defaultValue: { summary: "md" } },
    },
    square: {
      control: "boolean",
      description: "Square (non-pill) corners.",
      table: { category: "Appearance", defaultValue: { summary: "false" } },
    },

    // Behavior
    removable: {
      control: "boolean",
      description: "Show a dismiss control that removes the badge.",
      table: { category: "Behavior", defaultValue: { summary: "false" } },
    },
    onRemove: {
      action: "removed",
      table: { disable: true },
    },

    // Accessibility
    role: {
      control: { type: "inline-radio", labels: { undefined: "none" } },
      options: [undefined, "status"],
      description:
        "ARIA role override; role=\"status\" makes badge updates announce politely (aria-live).",
      table: { category: "Accessibility", type: { summary: "string" } },
    },
    title: {
      control: "text",
      description:
        "Native title attribute (pointer-hover tooltip). Not a substitute for visible text.",
      table: { category: "Accessibility" },
    },

    // Advanced
    className: {
      control: "text",
      description: "Additional CSS classes on the badge.",
      table: { category: "Advanced" },
    },
  },
  args: {
    variant: "primary",
    children: "Badge",
    iconName: "",
    title: "",
    className: "",
    removable: false,
    square: false,
    size: "md",
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;
type BadgeProps = React.ComponentProps<typeof Badge>;

const BadgeStoryTemplate: React.FC<BadgeProps & { iconName?: string }> = (args) => {
  const { t } = useTranslation();
  const { iconName, children, tone, ...rest } = args;
  let content = children;
  if (typeof children === "string" && children.startsWith("badge")) {
    content = t(children);
  }
  const resolvedName =
    iconName && iconName.trim() ? iconName.trim() : tone && TONE_ICON_MAP[tone];
  const resolvedIcon = resolvedName ? (
    <Icon name={resolvedName} ariaLabel={resolvedName} />
  ) : undefined;
  return (
    <Badge {...rest} tone={tone} icon={resolvedIcon}>
      {content}
    </Badge>
  );
};

const Template = (args: BadgeProps & { iconName?: string }) => (
  <BadgeStoryTemplate {...args} />
);

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

const TonesContent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Badge variant="primary">{t("badgePrimary")}</Badge>
      <Badge variant="secondary">{t("badgeSecondary")}</Badge>
      <Badge variant="primary" tone="success">
        {t("badgeSuccess")}
      </Badge>
      <Badge variant="primary" tone="error">
        {t("badgeError")}
      </Badge>
      <Badge variant="primary" tone="warning">
        {t("badgeWarning")}
      </Badge>
      <Badge variant="primary" tone="info">
        {t("badgeInfo")}
      </Badge>
      <Badge variant="primary" tone="neutral">
        {t("badgeNeutral")}
      </Badge>
    </div>
  );
};

export const Tones: Story = {
  tags: ["example"],
  parameters: { docs: { description: { story: "Filled tones; a status icon is auto-resolved for every non-neutral tone." } } }, render: () => <TonesContent /> };

const SecondaryContent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Badge variant="secondary">{t("badgeSecondary")}</Badge>
      <Badge variant="secondary" tone="success">
        {t("badgeSuccess")}
      </Badge>
      <Badge variant="secondary" tone="error">
        {t("badgeError")}
      </Badge>
      <Badge variant="secondary" tone="warning">
        {t("badgeWarning")}
      </Badge>
      <Badge variant="secondary" tone="info">
        {t("badgeInfo")}
      </Badge>
      <Badge variant="secondary" tone="neutral">
        {t("badgeNeutral")}
      </Badge>
    </div>
  );
};

export const SecondaryVariants: Story = {
  tags: ["example"],
  parameters: { docs: { description: { story: "Outlined weight across the tone matrix, for surfaces where a filled badge would compete." } } }, render: () => <SecondaryContent /> };

export const Removable: Story = {
  tags: ["example"],
  parameters: { docs: { description: { story: "Filter-chip mode; the dismiss affordance is an internal Button with a translated accessible name." } } },
  render: Template,
  args: { removable: true, children: "badgeRemovable", variant: "primary" },
};

export const WithIcon: Story = {
  tags: ["example"],
  parameters: { docs: { description: { story: "Custom icon next to the label via the icon slot." } } },
  render: Template,
  args: { variant: "primary", tone: "info", children: "badgeInfo", iconName: "info" },
};

const SizesContent: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Badge size="sm">{t("badgeSmall")}</Badge>
      <Badge size="md">{t("badgeMedium")}</Badge>
      <Badge size="lg">{t("badgeLarge")}</Badge>
    </div>
  );
};

export const Sizes: Story = {
  tags: ["example"],
  parameters: { docs: { description: { story: "sm, md and lg badge sizes." } } }, render: () => <SizesContent /> };

const AsCountContent: React.FC = () => {
  const [count, setCount] = React.useState(3);
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Badge role="status" tone="info" size="sm">
        {count} unread
      </Badge>
      <Button variant="secondary" size="sm" onClick={() => setCount((c) => c + 1)}>
        Add message
      </Button>
    </div>
  );
};

export const AsCount: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "role=status makes a runtime-updating counter announce politely via aria-live; reserve it for badges that actually change.",
      },
    },
  },
  render: () => <AsCountContent />,
};

export const InButtonEndSlot: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "Composition in context: a Badge in Button's endIcon slot for count-carrying actions (cross-links Button).",
      },
    },
  },
  render: () => (
    <Button
      variant="secondary"
      endIcon={
        <Badge size="sm" tone="info">
          3
        </Badge>
      }
    >
      Notifications
    </Button>
  ),
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => <TonesContent />,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: () => <TonesContent />,
};
