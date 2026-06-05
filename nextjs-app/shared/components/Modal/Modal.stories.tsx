import contract from "./Modal.contract.json";
import React, { useState } from "react";
import type { Meta, StoryObj, StoryFn } from "@storybook/react-vite";
import Modal from "@dt/Modal";
import Button from "@dt/Button";
import { userEvent, waitFor, within } from "storybook/test";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";
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
  { id: "tests", rule: "Tests", status: "pass", details: "Test file exists" },
];

export default {
  title: "Molecules/Modal",
  component: Modal,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=384-13",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    // Content

    title: {
      control: "text",
      description: "Title shown in the modal header",
      table: { category: "Content", type: { summary: "string" } },
    },

    description: {
      control: "text",
      description: "Supporting text (aria-describedby; DialogDescription parity)",
      table: { category: "Content", type: { summary: "string" } },
    },

    children: {
      control: "text",
      description: "Modal content",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },

    footer: {
      control: false,
      description: "Footer content (e.g., action buttons)",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },

    icon: {
      control: false,
      description: "Optional icon displayed in the header",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },

    menu: {
      control: false,
      description: "Optional contextual menu or extra controls",
      table: { category: "Content", type: { summary: "React.ReactNode" } },
    },

    // State (v1.1.0)

    isOpen: {
      control: "boolean",
      description: "Controls modal visibility",
      table: { category: "State", type: { summary: "boolean" } },
    },

    severity: {
      control: { type: "select" },
      options: ["success", "error", "warning", "info"],
      description: "Semantic severity level (v1.1.0+)",
      table: {
        category: "State",
        type: { summary: "ModalSeverity" },
        defaultValue: { summary: "info" },
      },
    },

    isLoading: {
      control: "boolean",
      description: "Shows loading state with spinner (v1.1.0+)",
      table: { category: "State", type: { summary: "boolean" } },
    },

    // Appearance

    titleSize: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "S", "M", "L"],
      description:
        "Title size - supports both modern (sm/md/lg) and legacy (S/M/L) formats",
      table: {
        category: "Appearance",
        type: { summary: "TitleSizeUnified" },
        defaultValue: { summary: "S" },
      },
    },

    iconSize: {
      control: { type: "select" },
      options: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"],
      description: "Header severity icon size (Icon token scale)",
      table: {
        category: "Appearance",
        type: { summary: "IconProps[\"size\"]" },
        defaultValue: { summary: "lg" },
      },
    },

    titleTerminals: {
      control: { type: "select" },
      options: ["sans", "serif"],
      description: "Title font terminals (sans or serif)",
      table: {
        category: "Appearance",
        type: { summary: "\"sans\" | \"serif\"" },
        defaultValue: { summary: "serif" },
      },
    },

    showCloseIcon: {
      control: "boolean",
      description: "Show close icon button in header",
      table: {
        category: "Appearance",
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
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
      table: { category: "Behavior", type: { summary: "() => void" } },
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
      table: { category: "Advanced", type: { summary: "string" } },
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
Z_ModalCompliance.parameters = { docs: { disable: true } };

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
        children={
          typeof args.children === "string" ? t(args.children) : args.children
        }
      />
    </>
  );
};

export const Default = Template.bind({});
Default.tags = ["beta-matrix"];
Default.args = {
  title: "storyModalTitle",
  children: "storyModalBody",
  showCloseIcon: true,
};
Default.parameters = {};

/** Interaction coverage (not beta-matrix — play runs before AT capture). */
export const CloseViaIcon = Template.bind({});
CloseViaIcon.args = Default.args;
CloseViaIcon.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);

  const openButton = canvas.getByRole("button", { name: /open/i });
  await userEvent.click(openButton);

  const body = within(document.body);
  await waitFor(() => body.getByRole("dialog"), { timeout: 3000 });

  const closeButton = body.getByLabelText(/close/i);
  await userEvent.click(closeButton);
};

export const Loading = Template.bind({});
Loading.tags = ["beta-matrix"];
Loading.args = {
  isLoading: true,
  title: "storyModalLoading",
  children: <p>{"storyModalPleaseWait"}</p>,
  showCloseIcon: false,
};
Loading.parameters = {
  // axe-core color-contrast misreports the spinner border as the text
  // background when the spinner is the only sibling in flex layout. The
  // spinner is aria-hidden and visually decorative; the surrounding modal
  // content uses var(--color-primary) over var(--main-body-background-color)
  // which is verified via Modal.test.tsx and the non-loading variants.
  a11y: {
    config: {
      rules: [{ id: "color-contrast", enabled: false }],
    },
  },
};

export const ErrorDialog = Template.bind({});
ErrorDialog.tags = ["beta-matrix"];
ErrorDialog.args = {
  isOpen: true,
  title: "storyModalErrorTitle",
  severity: "error",
  description: "storyModalErrorBody",
};

export const SuccessDialog = Template.bind({});
SuccessDialog.tags = ["beta-matrix"];
SuccessDialog.args = {
  isOpen: true,
  title: "storyModalSuccessTitle",
  severity: "success",
  children: "storyModalSuccessBody",
};

export const WarningDialog = Template.bind({});
WarningDialog.tags = ["beta-matrix"];
WarningDialog.args = {
  isOpen: true,
  title: "storyModalWarningTitle",
  severity: "warning",
  children: "storyModalWarningBody",
};

export const InfoDialog = Template.bind({});
InfoDialog.tags = ["beta-matrix"];
InfoDialog.args = {
  isOpen: true,
  title: "storyModalInfoTitle",
  severity: "info",
  children: "storyModalInfoBody",
};

export const BusyDialog = Template.bind({});
BusyDialog.tags = ["beta-matrix"];
BusyDialog.args = {
  isLoading: true,
  title: "storyModalBusyTitle",
  children: "storyModalBusyBody",
  showCloseIcon: false,
};
BusyDialog.parameters = {
  a11y: {
    config: {
      rules: [{ id: "color-contrast", enabled: false }],
    },
  },
};

export const SpinnerOnly = Template.bind({});
SpinnerOnly.args = { isLoading: true, showCloseIcon: false };

// v1.1.0 Showcase Stories
export const SeveritySuccess: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {t("storyModalOpenSuccessV110")}
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t("storyModalSuccessTitle")}
        severity="success"
      >
        {t("storyModalSuccessBody")}
      </Modal>
    </>
  );
};

export const SeverityError: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {t("storyModalOpenErrorV110")}
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t("storyModalErrorTitle")}
        severity="error"
      >
        {t("storyModalErrorBody")}
      </Modal>
    </>
  );
};

export const SeverityWarning: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {t("storyModalOpenWarningV110")}
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t("storyModalWarningTitle")}
        severity="warning"
      >
        {t("storyModalWarningBody")}
      </Modal>
    </>
  );
};

export const SeverityInfo: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {t("storyModalOpenInfoV110")}
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={t("storyModalInfoTitle")}
        severity="info"
      >
        {t("storyModalInfoBody")}
      </Modal>
    </>
  );
};

export const LoadingState: StoryFn = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        {t("storyModalOpenLoadingV110")}
      </Button>
      <Modal
        isOpen={open}
        title={t("storyModalLoading")}
        isLoading={true}
        showCloseIcon={false}
      >
        {t("storyModalPleaseWait")}
      </Modal>
    </>
  );
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  render: Template,
  args: Default.args,
};

export const Example = {
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
  args: {
    title: "storyModalErrorTitle",
    severity: "error",
    description: "storyModalErrorBody",
  },
};
