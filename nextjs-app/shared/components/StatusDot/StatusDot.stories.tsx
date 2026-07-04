import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import StatusDot from "./StatusDot";
import contract from "./StatusDot.contract.json";

const meta = {
  title: "Feedback/StatusDot",
  component: StatusDot,
  tags: ["alpha", "autodocs"],
  parameters: {
    layout: "centered",
    a11y: { test: "error" },
    contractStatus: contract.status,
  },
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // children keeps an authored text control (label-like ReactNode slot).
  argTypes: {
    children: { control: "text", description: "Visible label text" },
  },
  args: { tone: "success", size: "md", children: "Operational" },
} satisfies Meta<typeof StatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ["example"],
  parameters: {
    docs: {
      description: { story: "Dot + visible label; the dot itself is decorative (aria-hidden)." },
    },
  },
};

// children is seeded empty here so the sr-only label path is live in the
// panel (children would otherwise mask label entirely).
export const Playground: Story = {
  args: { children: "", label: "Operational" },
};

export const Tones: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "The five semantic tones; color always pairs with a text label, never alone." },
    },
  },
  render: () => (
    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
      <StatusDot tone="neutral">Idle</StatusDot>
      <StatusDot tone="success">Operational</StatusDot>
      <StatusDot tone="warning">Degraded</StatusDot>
      <StatusDot tone="error">Down</StatusDot>
      <StatusDot tone="info">Maintenance</StatusDot>
    </div>
  ),
};

export const Live: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "pulse marks an ongoing/live state; the animation is disabled under prefers-reduced-motion." },
    },
  },
  render: () => (
    <StatusDot tone="success" pulse>
      Live
    </StatusDot>
  ),
};

export const SrOnlyLabel: Story = {
  tags: ["example"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Dot-only visuals still announce their meaning: label renders as screen-reader-only text.",
      },
    },
  },
  render: () => <StatusDot tone="error" label="Connection lost" />,
};

export const Example: Story = {
  parameters: { controls: { disable: true } },
  render: () => <StatusDot tone="success">Operational</StatusDot>,
};

export const ForcedColors: Story = {
  globals: { forcedColors: "active" },
  parameters: { a11y: { disable: true, test: "off" } },
};
