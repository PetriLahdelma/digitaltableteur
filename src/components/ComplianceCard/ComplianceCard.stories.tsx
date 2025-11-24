import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ComplianceCard from "./ComplianceCard";
import type { ComplianceRule } from "./ComplianceCard";
import Icon from "@dt/Icon";

const meta = {
  title: "Utility/ComplianceCard",
  component: ComplianceCard,
  parameters: {
    layout: "padded",
    wip: { disabled: true },
    controls: { disable: true },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ComplianceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const badgeComplianceRules: ComplianceRule[] = [
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
    details: "Exported interface, forwardRef",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "useTranslation, all keys present",
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
    details: "Now 100% - no hardcoded fallbacks",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "No physical directions found",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "Uses token variables",
  },
  {
    id: "size-variants",
    rule: "Size variants",
    status: "pass",
    details: "s/m/l implemented",
  },
  {
    id: "state-variants",
    rule: "State variants",
    status: "pass",
    details: "success/info/error/warning/neutral",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "aria-label on close button",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "File exists",
  },
  {
    id: "tests",
    rule: "Tests",
    status: "pass",
    details: "File exists",
  },
];

export const Z_BadgeCompliance: Story = {
  args: {
    title: "Compliance: 12/12",
    titleIcon: (
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    ),
    rules: badgeComplianceRules,
  },
  parameters: {
    controls: { disable: true },
  },
};

const mixedComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure-mixed",
    rule: "Complete file structure",
    status: "pass",
    details: "All 5 files present",
  },
  {
    id: "typescript-mixed",
    rule: "TypeScript strict",
    status: "warning",
    details: "Missing some type exports",
  },
  {
    id: "translation-mixed",
    rule: "Translation support",
    status: "fail",
    details: "Hardcoded strings found",
  },
  {
    id: "css-modules-mixed",
    rule: "CSS Modules",
    status: "pass",
    details: "No inline styles",
  },
  {
    id: "design-tokens-mixed",
    rule: "Design tokens",
    status: "warning",
    details: "3 hardcoded fallbacks remaining",
  },
];

export const Z_MixedCompliance: Story = {
  args: {
    title: "Compliance: 2/5",
    titleIcon: (
      <Icon
        name="warning"
        color="var(--color-warning-contrast)"
        weight="fill"
      />
    ),
    rules: mixedComplianceRules,
  },
  parameters: {
    controls: { disable: true },
  },
};

export const Z_FailedCompliance: Story = {
  args: {
    title: "Compliance: 0/3",
    titleIcon: (
      <Icon name="x-circle" color="var(--color-error)" weight="fill" />
    ),
    rules: [
      {
        id: "file-structure-fail",
        rule: "Complete file structure",
        status: "fail",
        details: "Missing .test.tsx file",
      },
      {
        id: "typescript-fail",
        rule: "TypeScript strict",
        status: "fail",
        details: "Using any types",
      },
      {
        id: "translation-fail",
        rule: "Translation support",
        status: "fail",
        details: "No i18n integration",
      },
    ],
  },
  parameters: {
    controls: { disable: true },
  },
};
