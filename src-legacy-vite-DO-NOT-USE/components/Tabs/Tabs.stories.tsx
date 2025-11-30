import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import Tabs, { TabsProps } from "./Tabs";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";

const tabsComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing with TabsProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Uses i18n for labels",
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
    details: "Replaced --font-sans with var(--font-text)",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses gap for layout",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "CSS custom properties",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Variant system (default, pills, underline), size options",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "role=tablist, aria-selected, keyboard navigation",
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

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "pills", "underline"],
    },
    size: {
      control: { type: "select" },
      options: ["s", "m", "l"],
    },
  },
};
export default meta;

export const Z_TabsCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={tabsComplianceRules}
  />
);

const Template: StoryFn<TabsProps> = (args) => <Tabs {...args} />;

export const Default = Template.bind({});
Default.args = {
  tabs: [
    { key: "tab1", label: "Tab 1" },
    { key: "tab2", label: "Tab 2" },
    { key: "tab3", label: "Tab 3" },
  ],
  variant: "default",
  size: "m",
};

export const Pills = Template.bind({});
Pills.args = {
  tabs: [
    { key: "tab1", label: "Overview" },
    { key: "tab2", label: "Details" },
    { key: "tab3", label: "Settings" },
  ],
  variant: "pills",
};

export const Underline = Template.bind({});
Underline.args = {
  tabs: [
    { key: "tab1", label: "Home" },
    { key: "tab2", label: "Profile" },
    { key: "tab3", label: "Messages" },
  ],
  variant: "underline",
};

export const WithDisabled = Template.bind({});
WithDisabled.args = {
  tabs: [
    { key: "tab1", label: "Active" },
    { key: "tab2", label: "Disabled", disabled: true },
    { key: "tab3", label: "Active" },
  ],
};
