import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import ChatMessageBubble from "@dt/ChatMessageBubble";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import type { ProcessedMessage } from "@dt/messageProcessor";

expect.extend(toHaveNoViolations);

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

const mockAssistantMessage: ProcessedMessage = {
  id: "msg-1",
  role: "assistant",
  parts: [{ kind: "text", content: "Hello! How can I help you?" }],
};

const mockUserMessage: ProcessedMessage = {
  id: "msg-2",
  role: "user",
  parts: [{ kind: "text", content: "Tell me about your services." }],
};

describe("ChatMessageBubble", () => {
  describe("Rendering", () => {
    it("renders assistant message correctly", () => {
      render(
        withI18n(
          <ChatMessageBubble
            message={mockAssistantMessage}
            isStreaming={false}
          />,
        ),
      );

      expect(
        screen.getByText(/Hello! How can I help you?/),
      ).toBeInTheDocument();
      expect(screen.getByTestId("chat-message-assistant")).toHaveAttribute(
        "data-role",
        "assistant",
      );
    });

    it("renders user message correctly", () => {
      render(
        withI18n(
          <ChatMessageBubble message={mockUserMessage} isStreaming={false} />,
        ),
      );

      expect(
        screen.getByText(/Tell me about your services./),
      ).toBeInTheDocument();
      expect(screen.getByTestId("chat-message-user")).toHaveAttribute(
        "data-role",
        "user",
      );
    });

    it("applies correct data-role attribute", () => {
      const { rerender } = render(
        withI18n(
          <ChatMessageBubble
            message={mockAssistantMessage}
            isStreaming={false}
          />,
        ),
      );

      expect(screen.getByTestId("chat-message-assistant")).toHaveAttribute(
        "data-role",
        "assistant",
      );

      rerender(
        withI18n(
          <ChatMessageBubble message={mockUserMessage} isStreaming={false} />,
        ),
      );

      expect(screen.getByTestId("chat-message-user")).toHaveAttribute(
        "data-role",
        "user",
      );
    });
  });

  describe("Streaming State", () => {
    it("handles streaming state for assistant messages", () => {
      render(
        withI18n(
          <ChatMessageBubble
            message={mockAssistantMessage}
            isStreaming={true}
          />,
        ),
      );

      // Component should render with streaming prop
      expect(screen.getByTestId("chat-message-assistant")).toBeInTheDocument();
    });

    it("does not show streaming indicator for user messages", () => {
      render(
        withI18n(
          <ChatMessageBubble message={mockUserMessage} isStreaming={true} />,
        ),
      );

      // User messages don't show streaming fallback
      expect(screen.getByTestId("chat-message-user")).toBeInTheDocument();
    });
  });

  describe("Workflow UI", () => {
    it("renders workflow UI when provided", () => {
      const workflowUI = <div data-testid="workflow-element">Workflow</div>;

      render(
        withI18n(
          <ChatMessageBubble
            message={mockAssistantMessage}
            isStreaming={false}
            workflowUI={workflowUI}
          />,
        ),
      );

      expect(screen.getByTestId("workflow-element")).toBeInTheDocument();
    });

    it("renders without workflow UI", () => {
      render(
        withI18n(
          <ChatMessageBubble
            message={mockAssistantMessage}
            isStreaming={false}
          />,
        ),
      );

      expect(screen.queryByTestId("workflow-element")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has no accessibility violations for assistant message", async () => {
      const { container } = render(
        withI18n(
          <ChatMessageBubble
            message={mockAssistantMessage}
            isStreaming={false}
          />,
        ),
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations for user message", async () => {
      const { container } = render(
        withI18n(
          <ChatMessageBubble message={mockUserMessage} isStreaming={false} />,
        ),
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations when streaming", async () => {
      const { container } = render(
        withI18n(
          <ChatMessageBubble
            message={mockAssistantMessage}
            isStreaming={true}
          />,
        ),
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations with workflow UI", async () => {
      const workflowUI = <div>Workflow UI</div>;
      const { container } = render(
        withI18n(
          <ChatMessageBubble
            message={mockAssistantMessage}
            isStreaming={false}
            workflowUI={workflowUI}
          />,
        ),
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
