import contract from "./Skeleton.contract.json";
import React from "react";
import Skeleton from "@dt/Skeleton";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Skeleton> = {
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["text", "circle", "rect", "avatar", "card"],
      description: "Skeleton shape preset",
      table: { defaultValue: { summary: "text" } },
    },
  },
  title: "Feedback/Skeleton",
  component: Skeleton,
  tags: ["beta", "autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-skeleton",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const TextLines: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The text variant renders a paragraph-shaped stack; lines controls how many. The last line is shorter, like real prose.",
      },
    },
  },
  args: { variant: "text", lines: 4, animate: true },
};

export const Card: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A card-shaped block for grid items and media modules; size it with width/height when the default footprint does not match.",
      },
    },
  },
  args: { variant: "card" },
};

export const Avatar: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A circular avatar placeholder at the Avatar component's footprint.",
      },
    },
  },
  args: { variant: "avatar" },
};

export const Shapes: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "circle and rect are the free-form primitives; size them with width/height to sketch anything the presets miss.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      <Skeleton variant="circle" width={48} height={48} label="Loading icon" />
      <Skeleton
        variant="rect"
        width="16rem"
        height={100}
        label="Loading media"
      />
    </div>
  ),
};

/** Compose variants to sketch a whole loading module. */
export const ComposedPage: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Compose variants to mirror the incoming module — here an author row and article body. The wrapper carries one meaningful label for the whole region.",
      },
    },
  },
  render: () => (
    <div role="status" aria-label="Loading article">
      <div
        aria-hidden="true"
        style={{
          inlineSize: "min(24rem, 100%)",
          display: "grid",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Skeleton variant="avatar" />
          <Skeleton variant="text" lines={1} width="40%" />
        </div>
        <Skeleton variant="rect" height={140} />
        <Skeleton variant="text" lines={3} />
      </div>
    </div>
  ),
};

export const Static: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "animate={false} renders the resting placeholder — the same look users with prefers-reduced-motion get automatically.",
      },
    },
  },
  args: { variant: "text", animate: false, lines: 3 },
};

export const Default = { tags: ["beta-matrix"] };
export const Playground = { tags: ["beta-matrix"] };
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
