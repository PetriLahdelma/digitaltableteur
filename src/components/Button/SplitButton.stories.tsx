import React from "react";
import { type Meta, type StoryObj, type StoryFn } from "@storybook/react-vite";
import { SplitButton } from "@dt/Button";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";

const meta: Meta<typeof SplitButton> = {
  title: "Components/SplitButton",
  component: SplitButton,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "error", "warning", "success", "info"],
    },
    size: { control: "select", options: ["s", "m", "l"] },
    inverse: { control: "boolean" },
    rounded: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SplitButton>;

export const Default: Story = {
  args: {
    label: "Save",
    variant: "primary",
    options: [
      {
        id: "save-as",
        label: "Save as",
        title: "Choose a new name for this draft",
        icon: <Icon name="pencil" ariaLabel="edit" />,
      },
      {
        id: "save-cloud",
        label: "Save to cloud",
        title: "Sync to shared workspace",
        icon: "cloud-arrow-up",
      },
      {
        id: "save-copy",
        label: "Save a copy",
        title: "Duplicate and keep editing",
        icon: "copy",
      },
    ],
  },
};

export const Secondary: Story = {
  args: {
    ...Default.args,
    variant: "secondary",
    label: "Export",
    options: [
      { id: "pdf", label: "Export as PDF", trailingIcon: "file-pdf" },
      { id: "csv", label: "Export CSV", trailingIcon: "file-csv" },
      { id: "xlsx", label: "Export Excel", disabled: true, trailingIcon: "file-xls" },
    ],
  },
};

export const Nested: Story = {
  args: {
    label: "Publish",
    options: [
      {
        id: "environment",
        label: "Environment",
        children: [
          { id: "prod", label: "Production", trailingIcon: "check" },
          { id: "staging", label: "Staging" },
        ],
      },
      {
        id: "notify",
        label: "Notify",
        children: [
          { id: "slack", label: "Slack channel", trailingIcon: "bell" },
          { id: "email", label: "Email subscribers" },
        ],
      },
    ],
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const Tertiary: Story = {
  args: {
    label: "Ghost",
    variant: "tertiary",
    options: [
      { id: "undo", label: "Undo", trailingIcon: "arrow-u-up-left" },
      { id: "redo", label: "Redo", trailingIcon: "arrow-u-up-right" },
      {
        id: "more",
        label: "More",
        children: [
          { id: "settings", label: "Settings" },
          { id: "help", label: "Help" },
        ],
      },
    ],
  },
};

export const IconOnly: Story = {
  args: {
    label: <Icon name="heart" ariaLabel="Like" />,
    options: [
      { id: "like", label: "Like", icon: "heart", trailingIcon: "check" },
      { id: "star", label: "Star", icon: "star" },
      { id: "bookmark", label: "Bookmark", icon: "bookmark-simple" },
    ],
  },
};

const splitButtonComplianceRules: ComplianceRule[] = [
  {
    id: "i18n",
    rule: "4.1 i18n Requirements",
    status: "fail",
    details: "❌ CRITICAL: Hardcoded 'More options' and 'Open submenu' strings. Zero translation coverage in EN/FI/SV locales.",
  },
  {
    id: "test-coverage",
    rule: "7.1 Test Structure",
    status: "fail",
    details: "❌ CRITICAL: Only 2 basic tests. Missing: a11y tests, nested menu tests, focus management, disabled states, edge cases.",
  },
  {
    id: "focus-trap",
    rule: "6.3 Keyboard Navigation",
    status: "fail",
    details: "❌ CRITICAL: No focus trap in nested submenus. Tab key escapes instead of cycling within menu.",
  },
  {
    id: "typescript-types",
    rule: "1.3 TypeScript Strictness",
    status: "warning",
    details: "⚠️ No type discrimination for nested options. Options with children shouldn't have onSelect.",
  },
  {
    id: "state-management",
    rule: "5.1 React Best Practices",
    status: "warning",
    details: "⚠️ 8 useState + 4 useRef = cognitive overload. Should use useReducer for complex menu state.",
  },
  {
    id: "aria-submenus",
    rule: "6.2 ARIA Attributes",
    status: "warning",
    details: "⚠️ Missing aria-haspopup='menu' and aria-expanded on submenu triggers.",
  },
  {
    id: "icon-accessibility",
    rule: "6.1 Semantic HTML",
    status: "warning",
    details: "⚠️ String icons get ariaLabel=iconName (e.g. 'cloud-arrow-up') instead of empty/meaningful label.",
  },
  {
    id: "css-tokens",
    rule: "2.2 Design Token Usage",
    status: "warning",
    details: "⚠️ Magic numbers: -0.55 offset, hardcoded shadows, no dark mode support (always white background).",
  },
  {
    id: "extensibility",
    rule: "10.3 Extensibility",
    status: "warning",
    details: "⚠️ No portal support, no collision detection, fixed positioning. Can be clipped by overflow:hidden.",
  },
  {
    id: "error-handling",
    rule: "8.2 Error Boundaries",
    status: "fail",
    details: "❌ No error handling if option.onSelect throws. No loading states for async actions.",
  },
  {
    id: "component-structure",
    rule: "1.2 Component Structure",
    status: "pass",
    details: "✅ Complete file structure: tsx/css/stories/test/index",
  },
  {
    id: "css-modules",
    rule: "2.1 CSS Modules",
    status: "pass",
    details: "✅ CSS Modules with logical properties (inset-inline, padding-block)",
  },
  {
    id: "keyboard-basics",
    rule: "6.3 Keyboard Navigation",
    status: "pass",
    details: "✅ Arrow keys, Home/End, roving tabindex, Enter/Space activation",
  },
  {
    id: "aria-basics",
    rule: "6.2 ARIA Attributes",
    status: "pass",
    details: "✅ role='menu/menuitem', aria-haspopup, aria-expanded, aria-controls",
  },
  {
    id: "nested-menus",
    rule: "3.2 Advanced Props",
    status: "pass",
    details: "✅ Nested menu support with children prop (rare feature in design systems)",
  },
  {
    id: "icon-flexibility",
    rule: "3.1 Props Interface",
    status: "pass",
    details: "✅ Icons support both string names and ReactNode",
  },
];

export const Z_SplitButtonCompliance: StoryFn = () => (
  <ComplianceCard
    title="SplitButton Compliance: 6/16 (C+)"
    titleIcon={
      <Icon name="warning" color="var(--color-warning)" weight="fill" />
    }
    rules={splitButtonComplianceRules}
    lastReviewed="2025-11-25"
    summary="Functionally ambitious with nested menus and keyboard navigation, but critically lacking i18n, comprehensive tests, and focus management. Needs 20-30 hours of work before production-ready. See docs/compliance/SplitButton-compliance.md for detailed recommendations."
  />
);
