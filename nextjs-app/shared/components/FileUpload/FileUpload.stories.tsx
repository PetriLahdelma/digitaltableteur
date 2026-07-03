import contract from "./FileUpload.contract.json";
import React, { useState } from "react";
import { Meta, StoryFn } from "@storybook/react-vite";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import FileUpload from "@dt/FileUpload";
import { userEvent, waitFor, within } from "storybook/test";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
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
  { id: "tests", rule: "Tests", status: "pass", details: "Test file exists" },
];

export default {
  title: "Forms/FileUpload",
  component: FileUpload,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=384-26",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    label: { control: "text", description: "Field label" },

    placeholder: {
      control: "text",
      description: "Placeholder when no file selected",
    },

    helperText: {
      control: "text",
      description: "Helper copy below the control",
    },

    uploadButtonLabel: { control: "text", description: "Upload button label" },

    clearButtonLabel: {
      control: "text",
      description: "Clear/remove button label",
    },

    accept: { control: "text", description: "Accepted file extensions/MIME" },

    maxSizeInBytes: {
      control: "number",
      description: "Maximum file size in bytes",
    },

    sizeErrorMessage: {
      control: "text",
      description: "Error when file exceeds max size",
    },

    error: { control: "text", description: "External error message" },

    disabled: { control: "boolean", description: "Disables the control" },

    required: { control: "boolean", description: "Marks field as required" },

    appearance: {
      control: "select",
      options: ["default", "editorial"],
      description:
        "Visual variant — editorial matches FormFieldEditorial / Combobox",
    },
    value: {
      table: { disable: true },
      description: "Controlled File value (managed in stories)",
    },
    onFileChange: {
      action: "file change",
      description: "Called when a file is selected or cleared",
    },
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

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  render: Template,
  args: Default.args,
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: Template,
  args: Default.args,
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
  render: Template,
  args: Default.args,
};
