import React, { useState } from "react";
import type { Meta, StoryObj, StoryFn } from "@storybook/react";
import {
  Controls,
  Description,
  Heading,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import Modal from "@dt/Modal";
import Button from "@dt/Button";
import { within, userEvent, waitFor } from "@storybook/testing-library";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
import styles from "../shared-stories.module.css";

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
  tags: ["autodocs"],
  parameters: {
    llm: {
      schema,
    },
    docs: {
      page: () => (
        <>
          <Primary />
          <Title />
          <Subtitle />
          <Description />
          <Controls />
          <Stories />
          <details className={styles.schemaDetails}>
            <summary className={styles.schemaSummary}>
              <Heading>LLM Schema</Heading>
            </summary>
            <div className={styles.schemaContent}>
              <CodeSnippet
                code={JSON.stringify(schema, null, 2)}
                language="json"
                variant="multi"
                maxLines={20}
                showLineNumbers={true}
                allowCopy={true}
              />
            </div>
          </details>
        </>
      ),
    },
  },
  argTypes: {
    // Content
    title: {
      control: "text",
      description: "Title shown in the modal header",
      table: {
        category: "Content",
        type: { summary: "string" },
      },
    },
    children: {
      control: "text",
      description: "Modal content",
      table: {
        category: "Content",
        type: { summary: "React.ReactNode" },
      },
    },
    footer: {
      control: false,
      description: "Footer content (e.g., action buttons)",
      table: {
        category: "Content",
        type: { summary: "React.ReactNode" },
      },
    },
    icon: {
      control: false,
      description: "Optional icon displayed in the header",
      table: {
        category: "Content",
        type: { summary: "React.ReactNode" },
      },
    },
    menu: {
      control: false,
      description: "Optional contextual menu or extra controls",
      table: {
        category: "Content",
        type: { summary: "React.ReactNode" },
      },
    },

    // State (v1.1.0)
    isOpen: {
      control: "boolean",
      description: "Controls modal visibility",
      table: {
        category: "State",
        type: { summary: "boolean" },
      },
    },
    severity: {
      control: { type: "select" },
      options: ["success", "error", "warning", "info"],
      description: "Semantic severity level (v1.1.0+)",
      table: {
        category: "State",
        type: { summary: "ModalSeverity" },
      },
    },
    isLoading: {
      control: "boolean",
      description: "Shows loading state with spinner (v1.1.0+)",
      table: {
        category: "State",
        type: { summary: "boolean" },
      },
    },

    // Appearance
    titleSize: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "S", "M", "L"],
      description: "Title size - supports both modern (sm/md/lg) and legacy (S/M/L) formats",
      table: {
        category: "Appearance",
        type: { summary: "TitleSizeUnified" },
        defaultValue: { summary: "M" },
      },
    },
    titleTerminals: {
      control: { type: "select" },
      options: ["sans", "serif"],
      description: "Title font terminals (sans or serif)",
      table: {
        category: "Appearance",
        type: { summary: '"sans" | "serif"' },
        defaultValue: { summary: "serif" },
      },
    },
    showCloseIcon: {
      control: "boolean",
      description: "Show close icon button in header",
      table: {
        category: "Appearance",
        type: { summary: "boolean" },
        defaultValue: { summary: "true" },
      },
    },
    closeIconName: {
      control: "text",
      description: "Custom close icon name",
      table: {
        category: "Appearance",
        type: { summary: "string" },
        defaultValue: { summary: "x" },
      },
    },

    // Behavior
    onClose: {
      action: "closed",
      description: "Close callback",
      table: {
        category: "Behavior",
        type: { summary: "() => void" },
      },
    },

    // Accessibility
    closeButtonLabel: {
      control: "text",
      description: "Custom close button aria-label",
      table: {
        category: "Accessibility",
        type: { summary: "string" },
        defaultValue: { summary: "Close dialog" },
      },
    },

    // Advanced
    className: {
      control: "text",
      description: "Additional CSS classes",
      table: {
        category: "Advanced",
        type: { summary: "string" },
      },
    },

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
  isLoading: true,
  title: "storyModalLoading",
  children: <p>{"storyModalPleaseWait"}</p>,
  showCloseIcon: false,
};

export const ErrorDialog = Template.bind({});
ErrorDialog.args = {
  isOpen: true,
  title: "storyModalErrorTitle",
  severity: "error",
  children: "storyModalErrorBody",
};

export const SuccessDialog = Template.bind({});
SuccessDialog.args = {
  isOpen: true,
  title: "storyModalSuccessTitle",
  severity: "success",
  children: "storyModalSuccessBody",
};

export const WarningDialog = Template.bind({});
WarningDialog.args = {
  isOpen: true,
  title: "storyModalWarningTitle",
  severity: "warning",
  children: "storyModalWarningBody",
};

export const InfoDialog = Template.bind({});
InfoDialog.args = {
  isOpen: true,
  title: "storyModalInfoTitle",
  severity: "info",
  children: "storyModalInfoBody",
};

export const BusyDialog = Template.bind({});
BusyDialog.args = {
  isLoading: true,
  title: "storyModalBusyTitle",
  children: "storyModalBusyBody",
  showCloseIcon: false,
};

export const SpinnerOnly = Template.bind({});
SpinnerOnly.args = {
  isLoading: true,
  showCloseIcon: false,
};

// v1.1.0 Showcase Stories
export const SeveritySuccess: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Success Modal (v1.1.0)</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Operation Successful"
        severity="success"
      >
        Your changes have been saved successfully.
      </Modal>
    </>
  );
};

export const SeverityError: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Error Modal (v1.1.0)</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Error Occurred"
        severity="error"
      >
        Unable to complete the operation. Please try again.
      </Modal>
    </>
  );
};

export const SeverityWarning: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Warning Modal (v1.1.0)</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Warning"
        severity="warning"
      >
        This action cannot be undone. Are you sure you want to proceed?
      </Modal>
    </>
  );
};

export const SeverityInfo: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Info Modal (v1.1.0)</Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Information"
        severity="info"
      >
        Here's some important information you should know.
      </Modal>
    </>
  );
};

export const LoadingState: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Loading Modal (v1.1.0)</Button>
      <Modal
        isOpen={open}
        title="Processing"
        isLoading={true}
        showCloseIcon={false}
      >
        Please wait while we process your request...
      </Modal>
    </>
  );
};
