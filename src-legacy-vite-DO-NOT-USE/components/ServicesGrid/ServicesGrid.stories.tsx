import React from "react";
import ServicesGrid from "./ServicesGrid";
import type { Meta, StoryObj } from "@storybook/react";
import { withTranslation } from "react-i18next";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";

const servicesGridComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Uses i18n for service titles",
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
    details: "Uses var(--font-serif) for headings per guidelines",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses gap for grid spacing",
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
    details: "Flexible grid with icons",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "aria-label, aria-hidden, test-ids",
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

const meta: Meta<typeof ServicesGrid> = {
  title: "Components/AI/Chat/Custom Components/ServicesGrid",
  component: ServicesGrid,
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof ServicesGrid>;

export const Z_ServicesGridCompliance: Story = {
  render: () => (
    <ComplianceCard
      title="Compliance: 11/11"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={servicesGridComplianceRules}
    />
  ),
};

export const Default: Story = {
  render: () => <ServicesGrid />,
};
