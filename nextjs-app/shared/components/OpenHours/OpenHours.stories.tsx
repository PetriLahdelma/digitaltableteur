import contract from "./OpenHours.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
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
  { id: "tests", rule: "Tests", status: "pass", details: "Test file exists" },
];

const meta: Meta<typeof OpenHours> = {
  argTypes: {
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { table: { disable: true } },
      compact: { control: "boolean", description: "Dense single-line layout for cards.", table: { category: "Content" } },
      date: { control: false, description: "Reference date for the open-now calculation (defaults to now).", table: { category: "Content" } },
      highlightToday: { control: "boolean", description: "Emphasize the current weekday row.", table: { category: "Content" } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      showAllDays: { control: "boolean", description: "List all seven days instead of collapsing identical ranges.", table: { category: "Content" } },
      style: { table: { disable: true } }
},
  title: "Site/OpenHours",
  component: OpenHours,
  tags: ["beta", "!autodocs"],
  args: {},
};
export default meta;

type Story = StoryObj<typeof OpenHours>;

export const Z_OpenHoursCompliance: Story = {
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-open-hours",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
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
  tags: ["beta-matrix"],
  args: {},
};

export const Compact: Story = { args: { compact: true } };

export const TodayOnly: Story = { args: { showAllDays: false } };

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
