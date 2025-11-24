import React, { useEffect, useState } from "react";
import BusyIndicator from "./BusyIndicator";
import type { Meta, StoryObj } from "@storybook/react";
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
  title: "Feedback/BusyIndicator",
  component: BusyIndicator,
  parameters: { wip: { disabled: false } },
};
export default meta;

type Story = StoryObj<typeof BusyIndicator>;

export const Indeterminate: Story = {
  args: { size: "m" },
};

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

export const Completed: Story = {
  args: { progress: 1, size: "m" },
};

export const Z_BusyIndicatorCompliance: Story = {
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
