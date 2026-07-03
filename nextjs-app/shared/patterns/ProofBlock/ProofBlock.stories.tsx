import contract from "./ProofBlock.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ProofBlock, { ProofMetric } from "./ProofBlock";

const meta: Meta<typeof ProofBlock> = {
  argTypes: {},
  title: "Patterns/ProofBlock",
  component: ProofBlock,
  tags: ["beta", "autodocs"],
  parameters: {
    layout: "fullscreen",
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-proof-block",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    wip: { disabled: false },
  },
};
export default meta;

type Story = StoryObj<typeof ProofBlock>;

const sampleMetrics: ProofMetric[] = [
  { value: "750+", label: "Services" },
  { value: "1k+", label: "Digital channels" },
  { value: "100+", label: "Content producers" },
];

export const Default: Story = {
  tags: ["beta-matrix"],
  args: {
    title: "The challenge in numbers",
    subTitle: "Works at city scale",
    caption: "Every UI choice scales across the ecosystem.",
    metrics: sampleMetrics,
  },
};

export const TightDark: Story = {
  args: {
    title: "Proof it’s real",
    subTitle: "Open and production-grade",
    caption: "MIT-licensed and used widely.",
    metrics: sampleMetrics,
    tight: true,
    dark: true,
  },
};

export const Playground = Default;
export const Example = {
  tags: ["beta-matrix"],
  parameters: { controls: { disable: true } },
  ...Default,
};
export const ForcedColors = {
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  ...Default,
};
