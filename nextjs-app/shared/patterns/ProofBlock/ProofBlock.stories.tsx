import contract from "./ProofBlock.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ProofBlock, { ProofMetric } from "./ProofBlock";

const meta: Meta<typeof ProofBlock> = {
  // Controls are contract-derived at runtime (.storybook/lib/controls-autogen.ts);
  // the composite metrics slot keeps a mapping preset (defined on Playground
  // below, after the sample data).
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

export const Playground: Story = {
  tags: ["beta-matrix"],
  argTypes: {
    metrics: {
      control: { type: "select" },
      options: ["three", "two"],
      mapping: {
        three: sampleMetrics,
        two: sampleMetrics.slice(0, 2),
      },
      description:
        "Proof metrics: { value, label } pairs. Pick a preset here; compose your own in code.",
      table: { category: "Content", type: { summary: "ProofMetric[]" } },
    },
  },
  args: {
    ...Default.args,
    metrics: "three" as unknown as ProofMetric[],
  },
};
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
