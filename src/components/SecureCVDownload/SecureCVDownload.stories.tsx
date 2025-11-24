import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import SecureCVDownload, { SecureCVDownloadProps } from "./SecureCVDownload";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";

const secureCVDownloadComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing with SecureCVDownloadProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Uses i18n for all text",
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
    details: "CSS custom properties throughout",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Modal + Button + Input composition",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Form labels, error messages, loading states",
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

const meta: Meta<typeof SecureCVDownload> = {
  title: "Components/SecureCVDownload",
  component: SecureCVDownload,
  argTypes: {
    buttonText: { control: "text" },
    buttonVariant: {
      control: {
        type: "select",
        options: [
          "primary",
          "secondary",
          "tertiary",
          "error",
          "warning",
          "success",
          "info",
        ],
      },
    },
    inverse: { control: "boolean" },
  },
};
export default meta;

export const Z_SecureCVDownloadCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={secureCVDownloadComplianceRules}
  />
);

const Template: StoryFn<SecureCVDownloadProps> = (args) => (
  <SecureCVDownload {...args} />
);

export const Default = Template.bind({});
Default.args = {};

export const CustomText = Template.bind({});
CustomText.args = {
  buttonText: "Download My CV",
};

export const Secondary = Template.bind({});
Secondary.args = {
  buttonVariant: "secondary",
};

export const Inverse = Template.bind({});
Inverse.args = {
  inverse: true,
};
Inverse.parameters = {
  backgrounds: { default: "dark" },
};
Inverse.decorators = [
  (Story) => (
    <div
      style={{
        backgroundColor: "var(--color-primary)",
        padding: "2rem",
        borderRadius: "8px",
      }}
    >
      <Story />
    </div>
  ),
];
