import contract from "./SecureCVDownload.contract.json";
import React from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import SecureCVDownload, { SecureCVDownloadProps } from "@dt/SecureCVDownload";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import { userEvent, waitFor, within } from "storybook/test";
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
  { id: "tests", rule: "Tests", status: "pass", details: "Test file exists" },
];

const meta: Meta<typeof SecureCVDownload> = {
  title: "Site/SecureCVDownload",
  component: SecureCVDownload,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=dt-secure-cvdownload",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
    buttonText: {
      control: "text",
      description: "Download button label override",
      table: { category: "Content" },
    },

    buttonVariant: {
      description: "Button Variant",
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

    inverse: {
      description: "Inverse",
      control: "boolean",
    },
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
Default.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  // Click the download button to open modal
  const downloadButton = canvas.getByRole("button", { name: /download/i });
  await userEvent.click(downloadButton);

  // Wait for modal to appear (modal renders in portal, so check document.body)
  const body = within(document.body);
  await waitFor(() => body.getByRole("dialog"), { timeout: 3000 });

  // Find password input and type into it (also in portal)
  const passwordInput = body.getByLabelText(/password/i);
  await userEvent.type(passwordInput, "testpassword");
};

export const CustomText = Template.bind({});
CustomText.args = { buttonText: "Download My CV" };
CustomText.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  // Click the custom text button
  const downloadButton = canvas.getByRole("button", {
    name: /download my cv/i,
  });
  await userEvent.click(downloadButton);

  // Wait for modal (modal renders in portal, so check document.body)
  const body = within(document.body);
  await waitFor(() => body.getByRole("dialog"), { timeout: 3000 });
};

export const Secondary = Template.bind({});
Secondary.args = { buttonVariant: "secondary" };
Secondary.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Test secondary variant button
  const downloadButton = canvas.getByRole("button", { name: /download/i });
  await userEvent.click(downloadButton);
};

export const Inverse = Template.bind({});
Inverse.args = { inverse: true };
Inverse.parameters = { backgrounds: { default: "dark" } };
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
Inverse.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Test inverse variant button
  const downloadButton = canvas.getByRole("button", { name: /download/i });
  await userEvent.click(downloadButton);
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
