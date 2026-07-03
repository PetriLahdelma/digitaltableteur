import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatMessageBubble from "./ChatMessageBubble";
import type { ProcessedMessage } from "@dt/ChatWidget/messageProcessor";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";

const assistantMessage: ProcessedMessage = {
  id: "assistant-1",
  role: "assistant",
  parts: [
    {
      kind: "text",
      content:
        "Hello! I'm Donny, your guide to Digitaltableteur. How can I help you today?",
    },
  ],
};

const userMessage: ProcessedMessage = {
  id: "user-1",
  role: "user",
  parts: [
    { kind: "text", content: "Can you tell me about the services you offer?" },
  ],
};

const longAssistantMessage: ProcessedMessage = {
  id: "assistant-2",
  role: "assistant",
  parts: [
    {
      kind: "text",
      content:
        "We offer a comprehensive range of services including **design**, **development**, and **content strategy**. Our approach blends strategic thinking with hands-on execution to deliver end-to-end digital experiences.\n\nWe specialize in:\n- Brand identity and visual design\n- Web and mobile development\n- Content architecture and editorial strategy\n- AI-powered innovation",
    },
  ],
};

const thinkingMessage: ProcessedMessage = {
  id: "assistant-3",
  role: "assistant",
  parts: [{ kind: "text", content: "" }],
};

const meta: Meta<typeof ChatMessageBubble> = {
  title: "Site/Chat/ChatMessageBubble",
  component: ChatMessageBubble,
  tags: ["autodocs"],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/PC2UPdYwm8qGt6ZTg0AakF/DT-Site-stuff?node-id=473-25",
    },
    layout: "padded",
  },
  args: { isStreaming: false },
};

export default meta;

type Story = StoryObj<typeof ChatMessageBubble>;

export const AssistantMessage: Story = {
  tags: ["beta-matrix"],
  args: { message: assistantMessage },
  parameters: {},
};

export const UserMessage: Story = { args: { message: userMessage } };

export const AssistantStreaming: Story = {
  args: { message: assistantMessage, isStreaming: true },
};

export const LongAssistantMessage: Story = {
  args: { message: longAssistantMessage },
};

export const WithWorkflowUI: Story = {
  args: {
    message: assistantMessage,
    workflowUI: (
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          border: "1px dashed #ccc",
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
          Email workflow UI would appear here
        </p>
      </div>
    ),
  },
};

export const KitchenSink: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ChatMessageBubble message={assistantMessage} isStreaming={false} />
      <ChatMessageBubble message={userMessage} isStreaming={false} />
      <ChatMessageBubble message={longAssistantMessage} isStreaming={false} />
      <ChatMessageBubble message={thinkingMessage} isStreaming={true} />
    </div>
  ),
};

const chatMessageBubbleComplianceRules: ComplianceRule[] = [
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
    details: "Proper typing with ProcessedMessage",
  },
  {
    id: "translation-support",
    rule: "Translation support",
    status: "pass",
    details: "Uses i18n for thinking state",
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
    details: "Uses gap and logical spacing",
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
    details: "Uses MarkdownMessage component",
  },
  {
    id: "accessibility",
    rule: "Accessibility",
    status: "pass",
    details: "Semantic HTML with role attributes",
  },
  {
    id: "storybook-stories",
    rule: "Storybook stories",
    status: "pass",
    details: "Multiple variants",
  },
  { id: "tests", rule: "Tests", status: "pass", details: "Test file exists" },
];

export const Z_ChatMessageBubbleCompliance: import("@storybook/react-vite").StoryFn =
  () => (
    <ComplianceCard
      title="Compliance: 11/11"
      titleIcon={
        <Icon name="check-fat" color="var(--color-success)" weight="fill" />
      }
      rules={chatMessageBubbleComplianceRules}
    />
  );
