import React from "react";
import Skeleton from "./Skeleton";
import type { Meta, StoryObj } from "@storybook/react";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";

const skeletonComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing with SkeletonProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "No user-facing text",
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
    details: "Uses CSS custom properties",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses gap for spacing",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "CSS custom properties for colors",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Flexible variants: text, card, avatar, circle, rect",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "role=status, aria-busy, aria-label",
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

const meta: Meta<typeof Skeleton> = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  parameters: { wip: { disabled: false } },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Z_SkeletonCompliance: Story = {
  render: () => (
    <ComplianceCard
      title="Compliance: 11/11"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={skeletonComplianceRules}
    />
  ),
};

export const Text: Story = {
  args: { variant: "text", lines: 4, animate: true },
};
export const Card: Story = { args: { variant: "card" } };
export const Avatar: Story = { args: { variant: "avatar" } };
export const Circle: Story = { args: { variant: "circle" } };
export const Rect: Story = { args: { variant: "rect", height: 100 } };

export const Static: Story = {
  args: { variant: "text", animate: false, lines: 3 },
};

export const Animated: Story = {
  args: { variant: "text", animate: true, lines: 3 },
};

export const DebugAnimation: Story = {
  args: { variant: "text", animate: true, lines: 1, width: "300px" },
  parameters: {
    docs: {
      description: {
        story: "Single line skeleton to easily see animation shimmer effect",
      },
    },
  },
};
