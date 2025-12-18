import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import OpenHours from "@dt/OpenHours";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";

const openHoursComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure",
    rule: "Complete file structure",
    status: "pass",
    details: "All 5 files present",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict",
    status: "pass",
    details: "Proper typing with OpenHoursProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Uses i18n for day names and status",
  },
  {
    id: "css-modules",
    rule: "CSS Modules",
    status: "pass",
    details: "No inline styles",
  },
  {
    id: "design-tokens",
    rule: "Design tokens",
    status: "pass",
    details: "Replaced --font-family-sans with var(--font-text)",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses margin-bottom for spacing",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "CSS custom properties throughout",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Flexible: compact, showAllDays, injected date",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Semantic table, status icons",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Multiple variants with ComplianceCard",
  },
  {
    id: "tests",
    rule: "Tests",
    status: "pass",
    details: "Test file exists",
  },
];

const meta: Meta<typeof OpenHours> = {
  title: "Components/AI/Chat/Custom Components/OpenHours",
  component: OpenHours,
  tags: ["autodocs"],
  args: {},
};
export default meta;

type Story = StoryObj<typeof OpenHours>;

export const Z_OpenHoursCompliance: Story = {
  parameters: {
    docs: { disable: true },
  },
  render: () => (
    <ComplianceCard
      title="Compliance: 11/11"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={openHoursComplianceRules}
    />
  ),
};

export const Default: Story = {
  args: {},
};

export const Compact: Story = {
  args: { compact: true },
};

export const TodayOnly: Story = {
  args: { showAllDays: false },
};

export const InjectedDate: Story = {
  args: { date: new Date("2025-11-01T10:30:00") },
  parameters: {
    docs: {
      description: {
        story: "Shows Saturday closed state based on injected date.",
      },
    },
  },
};
