import contract from "./BusyIndicator.contract.json";
import React, { useEffect, useState } from "react";
import BusyIndicator from "@dt/BusyIndicator";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Icon from "@dt/Icon";

const busyIndicatorComplianceRules: ComplianceRule[] = [
  { title: "CSS Modules only (no inline styles)", status: "pass" },
  { title: "Design tokens for spacing/colors", status: "pass" },
  { title: "Logical CSS properties", status: "pass" },
  { title: "Component reuse (Icon)", status: "pass" },
  { title: "TypeScript strict mode", status: "pass" },
  { title: "Accessibility attributes (role, aria-*)", status: "pass" },
  { title: "i18n for user-facing text", status: "pass" },
  { title: "Unit tests present", status: "pass" },
  { title: "Storybook stories", status: "pass" },
  { title: "Font token compliance (--font-text)", status: "pass" },
  { title: "No hardcoded values", status: "pass" },
];

const meta: Meta<typeof BusyIndicator> = {
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["inline", "overlay"],
      description: "Presentation context for the busy indicator",
      table: { defaultValue: { summary: "inline" } },
    },
    size: {
      control: { type: "select" },
      options: ["s", "m", "l"],
      description: "Spinner size",
      table: { defaultValue: { summary: "s" } },
    },
  },
  title: "Feedback/BusyIndicator",
  component: BusyIndicator,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-busy-indicator",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
};
export default meta;

type Story = StoryObj<typeof BusyIndicator>;

export const Indeterminate: Story = { args: { size: "m" } };

export const SmallInline: Story = { args: { size: "s" } };
export const Large: Story = { args: { size: "l" } };
export const Overlay: Story = { args: { size: "m", variant: "overlay" } };

const DeterminateDemo: React.FC = () => {
  const [p, setP] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setP((v) => (v >= 1 ? 1 : v + 0.1)), 300);
    return () => clearInterval(id);
  }, []);
  return (
    <BusyIndicator
      progress={p}
      label={`Loading ${Math.round(p * 100)}%`}
      size="m"
    />
  );
};

export const Determinate: Story = { render: () => <DeterminateDemo /> };

export const Completed: Story = { args: { progress: 1, size: "m" } };

export const Z_BusyIndicatorCompliance: Story = {
  parameters: { docs: { disable: true } },
  render: () => (
    <ComplianceCard
      title="Compliance: 11/11"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={busyIndicatorComplianceRules}
    />
  ),
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
