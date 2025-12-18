import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ProofBlock, { ProofMetric } from "./ProofBlock";

const meta: Meta<typeof ProofBlock> = {
  title: "Patterns/ProofBlock",
  component: ProofBlock,
  tags: ["autodocs"],
  parameters: { wip: { disabled: false } },
};
export default meta;

type Story = StoryObj<typeof ProofBlock>;

const sampleMetrics: ProofMetric[] = [
  { value: "750+", label: "Services" },
  { value: "1k+", label: "Digital channels" },
  { value: "100+", label: "Content producers" },
];

export const Default: Story = {
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
