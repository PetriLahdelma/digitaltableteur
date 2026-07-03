import React, { useState } from "react";
import type { Meta, StoryObj, StoryFn } from "@storybook/react-vite";
import ChatComposer from "./ChatComposer";
import ComplianceCard, { type ComplianceRule } from "@dt/ComplianceCard";
import Icon from "@dt/Icon";
import { expect, userEvent, waitFor, within } from "storybook/test";

const noop = () => {};

const meta: Meta<typeof ChatComposer> = {
  title: "Site/Chat/ChatComposer",
  component: ChatComposer,
  tags: ["autodocs"],
  args: {
    inputId: "donny-input",
    placeholder: "Ask about open hours, service, or approach…",
    isSending: false,
    onSubmit: noop,
    maxLength: 1_000,
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=473-25",
    },
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj<typeof ChatComposer>;

const InteractiveRender: React.FC<React.ComponentProps<typeof ChatComposer>> = (
  args,
) => {
  const [value, setValue] = useState("");
  return (
    <ChatComposer
      {...args}
      value={value}
      onValueChange={setValue}
      onSubmit={(event) => {
        event.preventDefault();
        args.onSubmit?.(event);
      }}
    />
  );
};

export const Interactive: Story = {
  tags: ["beta-matrix"],
  render: (args) => <InteractiveRender {...args} />,
  parameters: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByRole("textbox");
    await userEvent.type(textarea, "Hello, how can I help?");
    expect(textarea).toHaveValue("Hello, how can I help?");

    const sendButton = canvas.getByRole("button", { name: /send/i });
    await userEvent.click(sendButton);
  },
};

export const SendingState: Story = {
  render: (args) => (
    <ChatComposer {...args} value="" onValueChange={() => {}} />
  ),
  args: { isSending: true },
};

const chatComposerComplianceRules: ComplianceRule[] = [
  {
    id: "1.2",
    rule: "1.2 Component Structure",
    status: "pass",
    details:
      "All files present: .tsx, .test.tsx, .stories.tsx, index.ts (shared CSS)",
  },
  {
    id: "1.3",
    rule: "1.3 TypeScript Strictness",
    status: "pass",
    details:
      "Exported ChatComposerProps & ChatComposerHandle interfaces with JSDoc",
  },
  {
    id: "2.1",
    rule: "2.1 CSS Modules",
    status: "pass",
    details:
      "Uses shared ChatWidget.module.css (acceptable for sub-components)",
  },
  {
    id: "2.2",
    rule: "2.2 Design Tokens",
    status: "pass",
    details: "All CSS uses design tokens without forbidden fallbacks",
  },
  {
    id: "3",
    rule: "3 Component API",
    status: "pass",
    details: "Clean controlled component API with imperative handle for focus",
  },
  {
    id: "4",
    rule: "4 Internationalization",
    status: "pass",
    details: "Uses useTranslation() for all user-facing text (EN/FI/SV)",
  },
  {
    id: "5",
    rule: "5 React Best Practices",
    status: "pass",
    details: "forwardRef + useImperativeHandle pattern, minimal re-renders",
  },
  {
    id: "6",
    rule: "6 Accessibility",
    status: "pass",
    details:
      "Proper labels, ARIA attributes, keyboard navigation (Cmd/Ctrl+Enter), jest-axe tests",
  },
  {
    id: "7",
    rule: "7 Testing",
    status: "pass",
    details: "8 unit tests + 3 accessibility tests with jest-axe",
  },
  {
    id: "8",
    rule: "8 Code Quality",
    status: "pass",
    details: "Clean TypeScript, no linting issues",
  },
  {
    id: "9",
    rule: "9 Storybook",
    status: "pass",
    details: "Interactive & SendingState stories with ComplianceCard",
  },
  {
    id: "10",
    rule: "10 Production Ready",
    status: "pass",
    details: "Keyboard shortcuts, disabled states, max length validation",
  },
];

export const Z_ChatComposerCompliance: StoryFn = () => (
  <ComplianceCard
    title="ChatComposer Compliance: 12/12"
    titleIcon={
      <Icon name="check-fat" color="var(--color-success)" weight="fill" />
    }
    rules={chatComposerComplianceRules}
    lastReviewed="2025-11-24"
  />
);
