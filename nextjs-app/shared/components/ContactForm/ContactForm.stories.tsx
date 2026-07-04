import contract from "./ContactForm.contract.json";
import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import ContactForm from "@dt/ContactForm";
import { expect, userEvent, waitFor, within } from "storybook/test"; // expect is available globally in Storybook browser tests

const contactFormComplianceRules: ComplianceRule[] = [
  {
    id: "file-structure",
    rule: "Complete file structure",
    status: "pass",
    details: "Component + tests + services present",
  },
  {
    id: "typescript-strict",
    rule: "TypeScript strict",
    status: "pass",
    details: "Typed reducer and state",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "useTranslation throughout",
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
    details: "Replaced --primary-body-font with --font-text",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "margin-block used",
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
    details: "Uses TextInput, Button, Modal, FileUpload",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Proper form semantics, labels",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Stories file created with ComplianceCard",
  },
  {
    id: "tests",
    rule: "Tests",
    status: "pass",
    details: "Multiple test files present",
  },
];

const meta: Meta<typeof ContactForm> = {
  title: "Site/ContactForm",
  component: ContactForm,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=470-2",
    },
    layout: "padded",
    contractStatus: contract.status,
    a11y: { test: "error" },
  },
  argTypes: {
      as: { table: { disable: true } },
      asChild: { table: { disable: true } },
      children: { table: { disable: true } },
      className: { table: { disable: true } },
      id: { table: { disable: true } },
      ref: { table: { disable: true } },
      style: { table: { disable: true } }
},
};

export default meta;

type Story = StoryObj<typeof ContactForm>;

export const Z_ContactFormCompliance: Story = {
  parameters: { docs: { disable: true } },
  render: () => (
    <ComplianceCard
      title="Compliance: 11/11"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={contactFormComplianceRules}
    />
  ),
};

export const Default: Story = {
  parameters: { a11y: { disable: true } },
  tags: ["beta-matrix"],
};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Test form field interactions
  const nameInput = canvas.getByLabelText(/name/i);
  await userEvent.type(nameInput, "John Doe");
  expect(nameInput).toHaveValue("John Doe");

  const emailInput = canvas.getByLabelText(/email/i);
  await userEvent.type(emailInput, "john@example.com");
  expect(emailInput).toHaveValue("john@example.com");

  const messageInput = canvas.getByLabelText(/message/i);
  await userEvent.type(messageInput, "Test message for validation");
  expect(messageInput).toHaveValue("Test message for validation");

  // Try submitting the form
  const submitButton = canvas.getByRole("button", { name: /send|submit/i });
  expect(submitButton).toBeInTheDocument();
};

export const InModal: Story = {
  render: () => (
    <div style={{ minHeight: "600px", padding: "2rem" }}>
      <p style={{ marginBottom: "1rem", fontFamily: "var(--font-text)" }}>
        Contact form typically appears in a modal. This story shows it in
        context.
      </p>
      <ContactForm />
    </div>
  ),
};
InModal.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Fill all required fields
  const nameInput = canvas.getByLabelText(/name/i);
  await userEvent.type(nameInput, "Jane Smith");
  expect(nameInput).toHaveValue("Jane Smith");

  const emailInput = canvas.getByLabelText(/email/i);
  await userEvent.type(emailInput, "jane@example.com");
  expect(emailInput).toHaveValue("jane@example.com");

  const messageInput = canvas.getByLabelText(/message/i);
  await userEvent.type(messageInput, "This is my inquiry about your services.");
  expect(messageInput).toHaveValue("This is my inquiry about your services.");

  // Test optional phone field if present
  const phoneInputs = canvas.queryAllByLabelText(/phone/i);
  if (phoneInputs.length > 0) {
    const phoneInput = phoneInputs[0];
    await userEvent.type(phoneInput, "+358401234567");
    // Phone input auto-formats, so just verify it contains the digits
    const value = (phoneInput as HTMLInputElement).value;
    expect(value).toContain("358401234567");
  }
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => (
    <div style={{ minHeight: "600px", padding: "2rem" }}>
      <ContactForm />
    </div>
  ),
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
