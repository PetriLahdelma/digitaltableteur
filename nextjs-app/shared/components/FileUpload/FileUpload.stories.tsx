import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import FileUpload from "@dt/FileUpload";
import { within, userEvent, waitFor } from "@storybook/testing-library";

const fileUploadComplianceRules: ComplianceRule[] = [
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
    details: "Props accept localized strings",
  },
  {
    id: "css-modules",
    rule: "CSS Modules",
    status: "pass",
    details: "No inline styles in component",
  },
  {
    id: "design-tokens",
    rule: "Design tokens",
    status: "pass",
    details: "Uses CSS variables",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "CSS uses logical properties",
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
    details: "Uses Button, HelperText",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Proper file input semantics",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Stories with ComplianceCard",
  },
  {
    id: "tests",
    rule: "Tests",
    status: "pass",
    details: "Test file exists",
  },
];

export default {
  title: "Components/FileUpload",
  component: FileUpload,
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    helperText: { control: "text" },
    uploadButtonLabel: { control: "text" },
    clearButtonLabel: { control: "text" },
    accept: { control: "text" },
    maxSizeInBytes: { control: "number" },
    sizeErrorMessage: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    value: { control: false, table: { disable: true } },
    onFileChange: { action: "file change" },
  },
} as Meta<typeof FileUpload>;

const Template: StoryFn<typeof FileUpload> = (
  args: React.ComponentProps<typeof FileUpload>,
) => {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div style={{ maxWidth: "28rem" }}>
      <FileUpload {...args} value={file} onFileChange={setFile} />
    </div>
  );
};

export const Z_FileUploadCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={fileUploadComplianceRules}
  />
);

export const Default = Template.bind({});
Default.args = {
  label: "Attachment (optional)",
  placeholder: "No file selected",
  helperText: "Optional. Max 5 MB. Accepted formats: PDF, PNG, JPG.",
  uploadButtonLabel: "Choose file",
  clearButtonLabel: "Remove file",
  accept: ".pdf,.png,.jpg,.jpeg",
  maxSizeInBytes: 5 * 1024 * 1024,
  sizeErrorMessage: "File exceeds the 5 MB limit.",
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Test that upload button is present and clickable
  const uploadButton = canvas.getByRole("button", { name: /choose file/i });
  await userEvent.click(uploadButton);
};
