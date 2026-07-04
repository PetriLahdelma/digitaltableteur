import type { Meta, StoryObj } from "@storybook/react-vite";
import { userEvent, within, expect, fn } from "storybook/test";
import React from "react";
import { IconButton } from "./IconButton";
import contract from "./IconButton.contract.json";

const defaultArgs = {
  icon: "moon",
  label: "Toggle dark mode",
  variant: "tertiary" as const,
  size: "md" as const,
  disabled: false,
  tooltip: "",
  onClick: fn(),
};

const meta = {
  title: "Actions/IconButton",
  component: IconButton,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-icon-button",
    },
    layout: "centered",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    icon: {
      control: "text",
      description:
        "Icon glyph: a React node or a Phosphor icon name (e.g. 'x'). Always aria-hidden.",
      table: { category: "Content", type: { summary: "ReactNode | string" } },
    },
    label: {
      control: "text",
      description: "Required accessible name; announced instead of the icon.",
      table: { category: "Accessibility", type: { summary: "string" } },
    },
    variant: {
      control: { type: "inline-radio" },
      options: ["primary", "secondary", "tertiary"],
      description: "Visual weight, same scale as Button.",
      table: {
        category: "Appearance",
        type: { summary: "primary | secondary | tertiary" },
        defaultValue: { summary: "tertiary" },
      },
    },
    tone: {
      control: { type: "inline-radio" },
      options: ["neutral", "error", "warning", "success", "info"],
      description: "Semantic color, orthogonal to variant.",
      table: {
        category: "Appearance",
        type: { summary: "neutral | error | warning | success | info" },
        defaultValue: { summary: "neutral" },
      },
    },
    surface: {
      control: { type: "inline-radio" },
      options: ["default", "onDark", "onBrand"],
      description: "Surface the control sits on; prefer over color overrides.",
      table: {
        category: "Appearance",
        type: { summary: "default | onDark | onBrand" },
        defaultValue: { summary: "default" },
      },
    },
    size: {
      control: { type: "inline-radio" },
      options: ["sm", "md", "lg"],
      description: "Circular hit-target size.",
      table: {
        category: "Appearance",
        type: { summary: "sm | md | lg" },
        defaultValue: { summary: "md" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Disables interaction and dims the control.",
      table: { category: "State", type: { summary: "boolean" } },
    },
    tooltip: {
      control: "text",
      description:
        "Native hover tooltip; reassurance for sighted users, never the accessible name.",
      table: { category: "Accessibility", type: { summary: "string" } },
    },
    onClick: {
      action: "clicked",
      description: "Click handler.",
      table: { category: "Behavior", type: { summary: "(e: MouseEvent) => void" } },
    },
    className: {
      control: "text",
      description:
        "Applied on a wrapper span so responsive utilities are not overridden.",
      table: { category: "Advanced", type: { summary: "string" } },
    },
  },
  args: defaultArgs,
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
    {children}
  </div>
);

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Toggle dark mode" });
    await userEvent.click(button);
    expect(args.onClick).toHaveBeenCalled();
    expect(button).toHaveFocus();
  },
};

export const Variants: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "The three weights, same scale as Button; tertiary is the default and the right choice for toolbars and chrome.",
      },
    },
  },
  render: () => (
    <Row>
      <IconButton icon="star" label="Favorite" variant="primary" />
      <IconButton icon="share-network" label="Share" variant="secondary" />
      <IconButton icon="dots-three" label="More actions" variant="tertiary" />
    </Row>
  ),
};

export const Sizes: Story = {
  tags: ["example"],
  parameters: {
    docs: { description: { story: "sm, md and lg circular hit targets." } },
  },
  render: () => (
    <Row>
      <IconButton icon="x" label="Close" size="sm" />
      <IconButton icon="x" label="Close" size="md" />
      <IconButton icon="x" label="Close" size="lg" />
    </Row>
  ),
};

export const DestructiveTone: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "tone=error for destructive row actions; the label, not the color, carries the meaning.",
      },
    },
  },
  render: () => (
    <Row>
      <IconButton icon="trash" label="Delete row" tone="error" variant="secondary" />
      <IconButton icon="trash" label="Delete row" tone="error" variant="tertiary" />
    </Row>
  ),
};

export const WithTooltip: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "tooltip adds a native hover hint for ambiguous glyphs; label stays the accessible name.",
      },
    },
  },
  render: () => (
    <Row>
      <IconButton
        icon="clipboard"
        label="Copy link"
        tooltip="Copy link to clipboard"
        variant="secondary"
      />
    </Row>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Copy link" });
    expect(button).toHaveAttribute("title", "Copy link to clipboard");
  },
};

export const InToolbar: Story = {
  tags: ["example"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Composition in context: a toolbar row of tertiary icon actions, the IconButton home turf (this is the SiteHeader pattern).",
      },
    },
  },
  render: () => (
    <div
      role="toolbar"
      aria-label="Article actions"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.5rem",
        border: "1px solid var(--color-border, currentColor)",
        borderRadius: "var(--radius-lg)",
        width: "fit-content",
      }}
    >
      <IconButton icon="arrow-left" label="Back" />
      <IconButton icon="magnifying-glass" label="Search" />
      <IconButton icon="moon" label="Toggle dark mode" />
      <IconButton icon="list" label="Open navigation menu" />
    </div>
  ),
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  args: defaultArgs,
};

export const Example: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  name: "Example (site header toolbar)",
  parameters: { controls: { disable: true }, layout: "padded" },
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem",
      }}
    >
      <IconButton icon="moon" label="Toggle dark mode" />
      <IconButton icon="list" label="Open navigation menu" />
    </div>
  ),
};

export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: defaultArgs,
};
