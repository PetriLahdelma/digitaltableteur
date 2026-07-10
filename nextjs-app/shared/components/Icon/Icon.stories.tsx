import contract from "./Icon.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Icon from "@dt/Icon";

const meta: Meta<typeof Icon> = {
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=1176-1658",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  title: "Content/Icon",
  component: Icon,
  tags: ["stable", "autodocs"],
  // spin/pulse/mirrored/decorative seeded false (their effective defaults with
  // an ariaLabel set) so the boolean controls render toggles, not Set-buttons.
  // weight is deliberately NOT seeded: a defined weight arg would permanently
  // mask legacyStyle (weight ?? legacyStyle) and the select offers "default".
  args: {
    name: "circle-info",
    size: "lg",
    ariaLabel: "Information",
    spin: false,
    pulse: false,
    mirrored: false,
    decorative: false,
  },
  argTypes: {
    name: {
      control: "text",
      description: "Phosphor icon name (kebab-case)",
      table: { defaultValue: { summary: "circle-info" } },
    },

    weight: {
      control: { type: "select", labels: { undefined: "default (regular)" } },
      options: [undefined, "thin", "light", "regular", "bold", "fill", "duotone"],
      description:
        "Phosphor stroke/fill weight. Leave on default to let legacyStyle apply; an explicit weight always wins.",
      table: { defaultValue: { summary: "regular" } },
    },

    size: {
      control: { type: "select" },
      options: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
      description: "Tokenized icon size",
      table: { defaultValue: { summary: "lg" } },
    },

    color: {
      control: "color",
      description: "Optional CSS color override (prefer tokens in production)",
    },

    rotate: {
      control: { type: "select" },
      options: [0, 90, 180, 270],
      description: "Rotation in degrees",
      table: { defaultValue: { summary: "0" } },
    },

    flip: {
      control: { type: "select", labels: { undefined: "none" } },
      options: [undefined, "horizontal", "vertical", "both"],
      description: "Mirror the icon along an axis",
      table: { defaultValue: { summary: "undefined" } },
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
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { table: { disable: true } },
      id: { table: { disable: true } },
      legacyStyle: {
        control: { type: "select", labels: { undefined: "none" } },
        options: [undefined, "solid", "regular", "light", "thin", "duotone", "brands"],
        description: "Legacy FontAwesome-style weight string kept for backward compatibility; weight wins when both are set.",
        table: { category: "Content", defaultValue: { summary: "undefined" } },
      },
      mirrored: { control: "boolean", description: "Flip the glyph horizontally (RTL-aware icons).", table: { category: "Content" } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
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

export const DecorativeVsInformative: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: {
        story:
          "The two accessibility modes: decorative icons vanish from the accessibility tree (the surrounding label carries the meaning); informative icons carry ariaLabel because they are the only content.",
      },
    },
    controls: { disable: true },
  },
  render: () => (
    <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
      <span style={{ display: "inline-flex", gap: "0.5rem", alignItems: "center" }}>
        <Icon name="check" decorative />
        Saved
      </span>
      <Icon name="arrow-square-out" ariaLabel="Opens in a new window" />
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
