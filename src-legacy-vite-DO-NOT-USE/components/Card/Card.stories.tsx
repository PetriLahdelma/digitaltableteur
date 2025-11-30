import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Card from "./Card";
import type { CardProps } from "./Card";
import Icon from "@dt/Icon";
import Button from "@dt/Button";
import * as PhosphorIcons from "@phosphor-icons/react";
import styles from "./Card.module.css";

// Extended args type for Storybook-only controls
type StoryArgs = CardProps & {
  iconName?: string;
  actionsConfig?: "none" | "1 action" | "2 actions" | "3 actions";
  headerActionsConfig?: "none" | "tertiary" | "icons";
};

const iconOptions = Object.keys(PhosphorIcons)
  // Filter to components (PascalCase), skip helpers
  .filter((name) => /^[A-Z]/.test(name))
  .sort();

const meta: Meta<StoryArgs> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "radio" },
      options: ["S", "M", "L", "full"],
      description: "Size variant of the card",
      table: { category: "Appearance" },
    },
    showHeader: {
      control: { type: "boolean" },
      description: "Show/hide the header section",
      table: { category: "Layout" },
    },
    title: {
      control: { type: "text" },
      description: "Title text for the header",
      table: { category: "Content" },
    },
    titleSize: {
      control: { type: "select" },
      options: ["XS", "S", "M", "L", "XL"],
      description: "Title size variant",
      table: { category: "Appearance" },
    },
    titleSans: {
      control: { type: "boolean" },
      description:
        "Whether title uses sans-serif (true) or serif (false) terminals",
      table: { category: "Appearance" },
    },
    showFooter: {
      control: { type: "boolean" },
      description: "Show/hide the footer section",
      table: { category: "Layout" },
    },
    iconName: {
      control: { type: "select" },
      options: iconOptions,
      description: "Select an icon from available Phosphor icons",
      table: { category: "Content" },
    },
    actionsConfig: {
      control: { type: "select" },
      options: ["none", "1 action", "2 actions", "3 actions"],
      description: "Select number of action buttons in footer",
      table: { category: "Content" },
    },
    headerActionsConfig: {
      control: { type: "select" },
      options: ["none", "tertiary", "icons"],
      description: "Header actions (icon-only or tertiary)",
      table: { category: "Content" },
    },
    children: {
      control: { type: "text" },
      description: "Content to display in the card body",
      table: { category: "Content" },
    },
    className: {
      control: { type: "text" },
      description: "Additional CSS class names",
      table: { category: "Advanced" },
    },
  },
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  args: {
    size: "M",
    showHeader: true,
    title: "Card Title",
    showFooter: false,
    iconName: "star",
    actionsConfig: "none",
    children:
      "This is the card content. You can customize this text using the controls panel.",
  },
  render: (args) => {
    const {
      iconName,
      actionsConfig,
      headerActionsConfig = "none",
      size,
      showHeader,
      title,
      titleSize,
      titleSans,
      showFooter,
      children,
      className,
    } = args;

    // Map iconName to icon component
    const icon = iconName ? (
      <Icon name={iconName} ariaLabel={iconName} />
    ) : undefined;

    let headerActions: React.ReactNode;
    if (headerActionsConfig === "tertiary") {
      headerActions = (
        <>
          <Button
            variant="tertiary"
            onClick={() => alert("Header tertiary clicked")}
          >
            Tertiary
          </Button>
          <Button
            variant="tertiary"
            onClick={() => alert("Header tertiary 2 clicked")}
          >
            More
          </Button>
        </>
      );
    } else if (headerActionsConfig === "icons") {
      headerActions = (
        <>
          <Button
            variant="tertiary"
            icon="gear"
            accessibleName="Settings"
            onClick={() => alert("Settings clicked")}
          />
          <Button
            variant="tertiary"
            icon="dots-three-vertical"
            accessibleName="More options"
            onClick={() => alert("More options clicked")}
          />
        </>
      );
    }

    // Map actionsConfig to actions JSX
    let actions: React.ReactNode;
    if (actionsConfig === "1 action") {
      actions = (
        <Button onClick={() => alert("Primary action clicked")}>
          Primary Action
        </Button>
      );
    } else if (actionsConfig === "2 actions") {
      actions = (
        <div className={styles.footerTrailingContainer}>
          <div className={styles.footerTrailing}>
            <Button onClick={() => alert("Cancel clicked")} variant="secondary">
              Cancel
            </Button>
            <Button onClick={() => alert("Confirm clicked")}>Confirm</Button>
          </div>
        </div>
      );
    } else if (actionsConfig === "3 actions") {
      actions = (
        <>
          <Button
            onClick={() => alert("Delete clicked")}
            variant="tertiaryError"
            icon="trash"
          >
            Delete
          </Button>
          <Button onClick={() => alert("Cancel clicked")} variant="secondary">
            Cancel
          </Button>
          <Button onClick={() => alert("Save clicked")}>Save</Button>
        </>
      );
    }

    return (
      <Card
        size={size}
        showHeader={showHeader}
        title={title}
        titleSize={titleSize}
        titleSans={titleSans}
        showFooter={showFooter}
        headerActions={headerActions}
        icon={icon}
        actions={actions}
        className={className}
      >
        {children}
      </Card>
    );
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    size: "M",
    showHeader: true,
    title: "Action Card",
    showFooter: true,
    iconName: "heart",
    actionsConfig: "2 actions",
    children: "Card with header icon and footer action buttons.",
  },
  render: Default.render,
};

export const LargeWithThreeActions: Story = {
  args: {
    size: "L",
    showHeader: true,
    title: "Confirmation Card",
    showFooter: true,
    iconName: "triangle-exclamation",
    actionsConfig: "3 actions",
    children:
      "This is a larger card with three action buttons. Perfect for forms or confirmation dialogs.",
  },
  render: Default.render,
};

export const NoHeaderMinimal: Story = {
  args: {
    size: "S",
    showHeader: false,
    showFooter: true,
    children:
      "Minimal card without a header, just content and a single action button.",
  },
  render: (args) => (
    <Card
      {...args}
      actions={
        <div className={styles.footerTrailingContainer}>
          <div className={styles.footerTrailing}>
            <Button onClick={() => alert("Primary action clicked")}>
              Primary Action
            </Button>
          </div>
        </div>
      }
    />
  ),
};

export const FullWidthWithCustomClass: Story = {
  args: {
    size: "full",
    showHeader: true,
    title: "Full Width Card",
    showFooter: true,
    iconName: "chart-bar",
    actionsConfig: "2 actions",
    children: "This card takes up full width of its container.",
    className: "custom-card-class",
  },
  parameters: {
    layout: "fullscreen",
  },
  render: (args) => (
    <div style={{ width: "100%", padding: "2rem" }}>
      {Default.render?.(args as StoryArgs)}
    </div>
  ),
};

export const TitleWrapsTwoLines: Story = {
  args: {
    size: "M",
    showHeader: true,
    title: "A lengthy confirmation title that wraps onto a second line",
    showFooter: true,
    actionsConfig: "2 actions",
    children: "Demonstrates how the header behaves when the title spans multiple lines.",
  },
  render: Default.render,
};
