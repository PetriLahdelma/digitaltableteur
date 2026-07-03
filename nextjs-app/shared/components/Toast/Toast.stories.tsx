import contract from "./Toast.contract.json";
import React, { useState } from "react";
import type { Meta, StoryFn } from "@storybook/react-vite";
import Toast, { ToastProps } from "@dt/Toast";
import Button from "@dt/Button";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import { expect, userEvent, waitFor, within } from "storybook/test";
import CodeSnippet from "@dt/CodeSnippet";
import schema from "./schema.json";

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
  { id: "tests", rule: "Tests", status: "pass", details: "Test file exists" },
];

const meta: Meta<typeof Toast> = {
  title: "Feedback/Toast",
  component: Toast,
  tags: ["beta", "!autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=393-35",
    },
    contractStatus: contract.status,
    a11y: { test: "error" },
    llm: { schema },
  },
  argTypes: {
    // Content

    message: {
      control: "text",
      description: "Message text displayed in the toast",
      table: { category: "Content", type: { summary: "string" } },
    },

    // State (v1.1.0)

    open: {
      control: "boolean",
      description: "Controls toast visibility.",
      table: { category: "State", type: { summary: "boolean" } },
    },

    tone: {
      control: { type: "select" },
      options: ["success", "error", "warning", "info"],
      description: "Semantic colour.",
      table: {
        category: "State",
        type: { summary: "\"success\" | \"error\" | \"warning\" | \"info\"" },
        defaultValue: { summary: "info" },
      },
    },

    // Appearance

    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
      description: "Size variant (v1.1.0+)",
      table: {
        category: "Appearance",
        type: { summary: "\"sm\" | \"md\" | \"lg\"" },
        defaultValue: { summary: "md" },
      },
    },

    position: {
      control: { type: "select" },
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
      description: "Position on screen (v1.1.0+)",
      table: {
        category: "Appearance",
        type: { summary: "ToastPosition" },
        defaultValue: { summary: "bottom-center" },
      },
    },

    // Behavior

    duration: {
      control: "number",
      description: "Auto-dismiss duration in milliseconds",
      table: {
        category: "Behavior",
        type: { summary: "number" },
        defaultValue: { summary: "3000" },
      },
    },
    onClose: {
      action: "closed",
      description: "Close callback",
      table: { category: "Behavior", type: { summary: "() => void" } },
    },
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
Z_ToastCompliance.parameters = { docs: { disable: true } };

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
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const showButton = canvas.getByRole("button", { name: /show toast/i });
  await userEvent.click(showButton);

  await waitFor(() => {
    expect(canvas.getByText(/toast notification/i)).toBeInTheDocument();
  });
  const toasts = canvas.getAllByRole("status");
  const toast = toasts.find((el) =>
    /toast notification/i.test(el.textContent ?? ""),
  );
  expect(toast).toBeDefined();
};

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
LongDuration.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const showButton = canvas.getByRole("button", { name: /show long toast/i });
  await userEvent.click(showButton);

  await waitFor(() => {
    expect(canvas.getByText(/6 seconds/i)).toBeInTheDocument();
  });
  const toasts = canvas.getAllByRole("status");
  const toast = toasts.find((el) => /6 seconds/i.test(el.textContent ?? ""));
  expect(toast).toBeDefined();
};

// v1.1.0 Showcase Stories
export const SeveritySuccess: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show Success (v1.1.0)</Button>
      <Toast
        message="Operation completed successfully!"
        open={open}
        tone="success"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const SeverityError: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show Error (v1.1.0)</Button>
      <Toast
        message="An error occurred. Please try again."
        open={open}
        tone="error"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const SeverityWarning: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show Warning (v1.1.0)</Button>
      <Toast
        message="Your session will expire soon."
        open={open}
        tone="warning"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const SeverityInfo: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show Info (v1.1.0)</Button>
      <Toast
        message="New features available! Check them out."
        open={open}
        tone="info"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const PositionTopLeft: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Top Left (v1.1.0)</Button>
      <Toast
        message="Top left toast"
        open={open}
        position="top-left"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const PositionTopCenter: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Top Center (v1.1.0)</Button>
      <Toast
        message="Top center toast"
        open={open}
        position="top-center"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const PositionTopRight: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Top Right (v1.1.0)</Button>
      <Toast
        message="Top right toast"
        open={open}
        position="top-right"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const SizeSmall: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Small Toast (v1.1.0)</Button>
      <Toast
        message="Small size toast"
        open={open}
        size="sm"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const SizeLarge: StoryFn = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Large Toast (v1.1.0)</Button>
      <Toast
        message="Large size toast"
        open={open}
        size="lg"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export const Playground: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
};

export const Example: Story = {
  globals: { forcedColors: "none" },
  tags: ["beta-matrix"],
  parameters: { a11y: { disable: true }, controls: { disable: true } },
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <Toast
        message="Saved successfully."
        open={open}
        tone="success"
        onClose={() => setOpen(false)}
      />
    );
  },
};

export const ForcedColors: Story = {
  parameters: { a11y: { disable: true, test: "off" } },
  tags: ["beta-matrix"],
  globals: { forcedColors: "active" },
};
