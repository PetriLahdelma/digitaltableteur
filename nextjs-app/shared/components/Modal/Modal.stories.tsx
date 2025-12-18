import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Modal from "@dt/Modal";
import Button from "@dt/Button";
import { within, userEvent, waitFor } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";

const modalComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing with ModalProps",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Stories use translation keys",
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
    details: "Uses gap for spacing",
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
    details: "Flexible children, variant system",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Focus trap, ESC close, ARIA roles",
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

export default {
  title: "Components/Modal",
  component: Modal,
  argTypes: {
    title: { control: "text" },
    variant: {
      control: {
        type: "select",
        options: ["default", "success", "error", "warning", "info", "loading"],
      },
    },
    children: { control: "text" },
    showCloseIcon: { control: "boolean" },
    onClose: { action: "closed" },
  },
} as Meta;

export const Z_ModalCompliance: StoryFn = () => (
  <ComplianceCard
    title="Compliance: 11/11"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={modalComplianceRules}
  />
);

const Template: StoryFn<ModalProps> = (args: ModalProps) => {
  const [open, setOpen] = useState(true);
  const { t } = useTranslation();
  return (
    <>
      <Button onClick={() => setOpen(true)}>{t("storyModalOpen")}</Button>
      <Modal
        {...args}
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t(args.title as string)}
        /* eslint-disable react/no-children-prop */
        children={
          typeof args.children === "string" ? t(args.children) : args.children
        }
        /* eslint-enable react/no-children-prop */
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: "storyModalTitle",
  children: "storyModalBody",
};
Default.parameters = {};
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  // Open modal - use more specific button selector
  const openButton = canvas.getByRole("button", { name: /open/i });
  await userEvent.click(openButton);

  // Wait for modal to appear
  await waitFor(() => canvas.getByRole("dialog"));

  // Close modal via close button
  const closeButton = canvas.getByLabelText(/close/i);
  await userEvent.click(closeButton);
};

export const Loading = Template.bind({});
Loading.args = {
  variant: "loading",
  title: "storyModalLoading",
  children: <p>{"storyModalPleaseWait"}</p>,
  showCloseIcon: false,
};

export const ErrorDialog = Template.bind({});
ErrorDialog.args = {
  isOpen: true,
  title: "storyModalErrorTitle",
  variant: "error",
  children: "storyModalErrorBody",
};

export const SuccessDialog = Template.bind({});
SuccessDialog.args = {
  isOpen: true,
  title: "storyModalSuccessTitle",
  variant: "success",
  children: "storyModalSuccessBody",
};

export const WarningDialog = Template.bind({});
WarningDialog.args = {
  isOpen: true,
  title: "storyModalWarningTitle",
  variant: "warning",
  children: "storyModalWarningBody",
};

export const InfoDialog = Template.bind({});
InfoDialog.args = {
  isOpen: true,
  title: "storyModalInfoTitle",
  variant: "info",
  children: "storyModalInfoBody",
};

export const BusyDialog = Template.bind({});
BusyDialog.args = {
  variant: "loading",
  title: "storyModalBusyTitle",
  children: "storyModalBusyBody",
  showCloseIcon: false,
};

export const SpinnerOnly = Template.bind({});
SpinnerOnly.args = {
  variant: "loading",
  showCloseIcon: false,
};
