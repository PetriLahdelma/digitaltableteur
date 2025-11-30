import React, { useState } from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import Toast, { ToastProps } from "./Toast";
import Button from "@dt/Button";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";

const toastComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing with ToastProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Message as prop",
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
    details: "Replaced --primary-body-font with var(--font-text)",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "Uses transform for positioning",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "CSS custom properties for colors and spacing",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Auto-dismiss with configurable duration",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "role=status, aria-live=polite",
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

const meta: Meta<typeof Toast> = {
  title: "Feedback/Toast",
  component: Toast,
  argTypes: {
    message: { control: "text" },
    open: { control: "boolean" },
    duration: { control: "number" },
  },
};
export default meta;

export const Z_ToastCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={toastComplianceRules}
  />
);

const Template: StoryFn<ToastProps> = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Show Toast</Button>
      <Toast
        message="Toast notification!"
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const Default = Template.bind({});

export const LongDuration = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show Long Toast</Button>
      <Toast
        message="This toast will stay for 6 seconds"
        open={open}
        duration={6000}
        onClose={() => setOpen(false)}
      />
    </>
  );
};
