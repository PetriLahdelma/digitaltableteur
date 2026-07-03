import contract from "./Icon.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Icon from "@dt/Icon";

const meta: Meta<typeof Icon> = {
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-icon",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  title: "Content/Icon",
  component: Icon,
  tags: ["stable", "autodocs"],
  args: {
    name: "circle-info",
    weight: "regular",
    size: "lg",
    ariaLabel: "Information",
  },
  argTypes: {
    name: {
      control: "text",
      description: "Phosphor icon name (kebab-case)",
      table: { defaultValue: { summary: "circle-info" } },
    },

    weight: {
      control: {
        type: "select",
        options: ["thin", "light", "regular", "bold", "fill", "duotone"],
      },
      description: "Phosphor stroke/fill weight",
      table: { defaultValue: { summary: "regular" } },
    },

    size: {
      control: {
        type: "select",
        options: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
      },
      description: "Tokenized icon size",
      table: { defaultValue: { summary: "lg" } },
    },

    color: {
      control: "color",
      description: "Optional CSS color override (prefer tokens in production)",
    },

    rotate: {
      control: { type: "select", options: [0, 90, 180, 270] },
      description: "Rotation in degrees",
      table: { defaultValue: { summary: "0" } },
    },

    flip: {
      control: { type: "select", options: ["horizontal", "vertical", "both"] },
      description: "Mirror the icon along an axis",
    },

    spin: {
      control: "boolean",
      description: "Continuous rotation animation",
      table: { defaultValue: { summary: "false" } },
    },

    pulse: {
      control: "boolean",
      description: "Opacity pulse animation",
      table: { defaultValue: { summary: "false" } },
    },

    decorative: {
      control: "boolean",
      description: "When true, icon is hidden from assistive tech",
      table: { defaultValue: { summary: "false" } },
    },

    ariaLabel: {
      control: "text",
      description:
        "Accessible name when the icon is meaningful (not decorative)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Playground: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
  args: { name: "circle-info", ariaLabel: "Information icon" },
};

export const Default: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "none" },
  ...Playground,
};
export const BrandIcon: Story = {
  tags: ["example"],
  parameters: { docs: { description: { story: "Weight variants on a brand glyph." } } },
  args: { name: "github", size: "2xl", color: "#111", ariaLabel: "GitHub" },
};

export const Sizes: Story = {
  tags: ["example"],
  parameters: {
    docs: { description: { story: "The 2xs to 2xl size ladder." } },
    controls: { disable: true },
  },
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-end" }}>
      {(["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
        <div
          key={size}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Icon name="circle-info" size={size} decorative />
          <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
            {size}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Animated: Story = {
  tags: ["example"],
  parameters: { docs: { description: { story: "spin and pulse motion affordances; both stop under prefers-reduced-motion." } } },
  args: { name: "circle-notch", spin: true, ariaLabel: "Loading" },
};

export const ColorShowcase: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
        alignItems: "center",
        fontSize: "1.5rem",
      }}
    >
      <Icon name="circle-info" color="var(--color-info)" ariaLabel="Info" />
      <Icon
        name="triangle-exclamation"
        color="var(--color-warning)"
        ariaLabel="Warning"
      />
      <Icon
        name="circle-check"
        color="var(--color-success)"
        ariaLabel="Success"
      />
      <Icon name="circle-xmark" color="var(--color-error)" ariaLabel="Error" />
    </div>
  ),
};

export const Transformations: Story = {
  tags: ["example"],
  parameters: {
    docs: { description: { story: "rotate, flip and mirrored transforms." } },
    contractStatus: contract.status,
    a11y: { test: "error" }, // Disable WIP badge to prevent overlap
  },
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
        alignItems: "center",
        paddingBlockEnd: "3rem",
      }}
    >
      <Icon
        name="arrow-up"
        pulse
        color="var(--color-primary)"
        ariaLabel="Arrow down"
      />
      <Icon
        name="arrow-right"
        flip="horizontal"
        pulse
        color="var(--color-primary)"
        ariaLabel="Arrow left"
      />
      <Icon
        name="arrows-rotate"
        rotate={180}
        spin
        color="var(--color-primary)"
        ariaLabel="Refreshing"
      />
    </div>
  ),
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => (
    <Icon name="arrow-square-out" size="md" ariaLabel="Opens in a new window" />
  ),
};
export const ForcedColors: Story = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  args: { name: "circle-info" },
};
