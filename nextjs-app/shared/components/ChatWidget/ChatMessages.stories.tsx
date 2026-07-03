import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { UIMessage } from "ai";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import ChatMessages from "./ChatMessages";
import { expect, waitFor, within } from "storybook/test";

const SAMPLE_MESSAGES: UIMessage[] = [
  {
    id: "intro",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Hi! I'm Donny, the Digitaltableteur studio guide. Feel free to ask about our work or anything you notice on the site.",
      },
    ],
  },
  {
    id: "user-1",
    role: "user",
    parts: [{ type: "text", text: "What services do you offer?" }],
  },
  {
    id: "assistant-1",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "We blend strategic design, development, and content craft to ship end-to-end brand and digital experiences.",
      },
    ],
  },
];

const LONG_CONVERSATION: UIMessage[] = [
  ...SAMPLE_MESSAGES,
  {
    id: "user-2",
    role: "user",
    parts: [
      { type: "text", text: "Can you tell me more about your design process?" },
    ],
  },
  {
    id: "assistant-2",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Our design process is collaborative and iterative. We start with discovery workshops to understand your goals, then move through wireframing, prototyping, and user testing before final implementation.",
      },
    ],
  },
  {
    id: "user-3",
    role: "user",
    parts: [{ type: "text", text: "What technologies do you work with?" }],
  },
  {
    id: "assistant-3",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "We specialize in modern web technologies including React, TypeScript, Next.js, and cutting-edge CSS. We also work with headless CMS solutions and serverless architectures.",
      },
    ],
  },
];

const chatMessagesComplianceRules: ComplianceRule[] = [
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
    details: "Exported interface, forwardRef",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "useTranslation hook implemented",
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
    details: "100% - replaced Moderat with var(--font-text)",
  },
  {
    id: "logical-properties",
    rule: "Logical properties",
    status: "pass",
    details: "margin-inline, padding-inline used",
  },
  {
    id: "theme-support",
    rule: "Theme support",
    status: "pass",
    details: "Uses CSS custom properties",
  },
  {
    id: "composition",
    rule: "Component composition",
    status: "pass",
    details: "Uses ChatMessageBubble, workflow components",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Semantic HTML structure",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Multiple variants with ComplianceCard",
  },
  { id: "tests", rule: "Tests", status: "pass", details: "Test files exist" },
];

const meta: Meta<typeof ChatMessages> = {
  title: "Site/Chat/ChatMessages",
  component: ChatMessages,
  tags: ["autodocs"],
  args: { messages: SAMPLE_MESSAGES },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=473-25",
    },
  },
};

export default meta;

type Story = StoryObj<typeof ChatMessages>;

export const Z_ChatMessagesCompliance: Story = {
  parameters: { docs: { disable: true } },
  render: () => (
    <ComplianceCard
      title="Compliance: 11/11"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={chatMessagesComplianceRules}
    />
  ),
};

export const Default: Story = {
  tags: ["beta-matrix"],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getByText(/Donny/i)).toBeInTheDocument();
      expect(
        canvas.getByText(/What services do you offer/i),
      ).toBeInTheDocument();
    });
  },
};

export const LongConversation: Story = {
  args: { messages: LONG_CONVERSATION },
};

export const Streaming: Story = {
  args: { messages: SAMPLE_MESSAGES, isStreaming: true },
};

export const EmptyState: Story = {
  args: { messages: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const messages = canvas.queryAllByRole("article");
      expect(messages.length).toBe(0);
    });
  },
};
