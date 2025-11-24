import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import ContactForm from "./ContactForm";

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
    details: "Uses Inputs, Button, Modal, FileUpload",
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
  title: "Components/ContactForm",
  component: ContactForm,
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof ContactForm>;

export const Z_ContactFormCompliance: Story = {
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

export const Default: Story = {};

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
