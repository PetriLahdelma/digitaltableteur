import React from "react";
import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import ChatMessageBubble from "./ChatMessageBubble";
import type { ProcessedMessage } from "@dt/ChatWidget/messageProcessor";
import Icon from "@dt/Icon";
import ComplianceCard from "@dt/ComplianceCard";
import type { ComplianceRule } from "@dt/ComplianceCard";
import Text from "@dt/Text";
import styles from "./ChatMessageBubble.stories.module.css";

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

const userListMessage: ProcessedMessage = {
  id: "user-2",
  role: "user",
  parts: [
    {
      kind: "text",
      content:
        "I need help with:\n- a design system audit\n- token naming\n\nIn this order:\n1. Audit\n2. Roadmap",
    },
  ],
};

const channels = (rgb: string) =>
  (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
const luminance = (rgb: string) => {
  const [r, g, b] = channels(rgb).map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrastRatio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * A list typed by the user. Markers once took --color-primary, the user
 * bubble's own background, and vanished. axe does not check ::marker colour,
 * so the play function measures it against the bubble. Numbered markers are
 * text, so the bar is WCAG 1.4.3's 4.5:1, not the 3:1 for non-text graphics.
 */
export const UserMessageWithList: Story = {
  tags: ["beta-matrix"],
  args: { message: userListMessage },
  play: async ({ canvasElement }) => {
    const items = within(canvasElement).getAllByRole("listitem");
    const bubble = canvasElement.querySelector<HTMLElement>("[data-role=user]");
    expect(bubble).not.toBeNull();
    const background = getComputedStyle(bubble as HTMLElement).backgroundColor;
    for (const item of items) {
      const marker = getComputedStyle(item, "::marker").color;
      expect(contrastRatio(marker, background)).toBeGreaterThanOrEqual(4.5);
    }
  },
};

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
      <div className={styles.workflowPlaceholder}>
        <Text as="p" size="s" className={styles.workflowPlaceholderText}>
          Email workflow UI would appear here
        </Text>
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
        <Icon name="check-fat" color="var(--color-success-contrast)" weight="fill" />
      }
      rules={chatMessageBubbleComplianceRules}
    />
  );
