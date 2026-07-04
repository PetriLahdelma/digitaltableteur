import contract from "./ProofBlock.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ProofBlock, { ProofMetric } from "./ProofBlock";

const meta: Meta<typeof ProofBlock> = {
  argTypes: {
      ariaLabel: { control: "text", description: "Accessible name for the proof section landmark.", table: { category: "Accessibility" } },
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      caption: { control: "text", description: "Small print under the metrics (source, timeframe).", table: { category: "Content" } },
      children: { table: { disable: true } },
      className: { control: "text", description: "Additional CSS classes on the section.", table: { category: "Advanced" } },
      dark: { control: "boolean", description: "Render on the dark band treatment.", table: { category: "Appearance" } },
      id: { table: { disable: true } },
      metrics: { control: "object", description: "Proof metrics: { value, label } pairs.", table: { category: "Content" } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } },
      subTitle: { control: "text", description: "Supporting line under the title.", table: { category: "Content" } },
      tight: { control: "boolean", description: "Reduce the band vertical padding.", table: { category: "Appearance" } },
      title: { control: "text", description: "Section heading.", table: { category: "Content" } }
},
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
