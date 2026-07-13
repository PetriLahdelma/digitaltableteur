import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import ChatMessages from "@dt/ChatWidget/ChatMessages";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import type { UIMessage } from "ai";

expect.extend(toHaveNoViolations);

function withI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

const mockMessages: UIMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    parts: [{ type: "text", text: "Hello! How can I help you?" }],
  },
  {
    id: "msg-2",
    role: "user",
    parts: [{ type: "text", text: "Tell me about your services." }],
  },
  {
    id: "msg-3",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "We offer design, development, and content services.",
      },
    ],
  },
];

describe("ChatMessages", () => {
  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );
      expect(
        screen.getByText(/Hello! How can I help you?/),
      ).toBeInTheDocument();
    });

    it("renders all messages in correct order", () => {
      render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );

      const messages = screen.getAllByText(/Hello|Tell me|We offer/);
      expect(messages).toHaveLength(3);
    });

    it("applies correct role data attributes", () => {
      const { container } = render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );

      const assistantMsgs = container.querySelectorAll(
        "[data-role='assistant']",
      );
      const userMsgs = container.querySelectorAll("[data-role='user']");

      expect(assistantMsgs.length).toBeGreaterThan(0);
      expect(userMsgs.length).toBeGreaterThan(0);
    });
  });

  describe("Streaming State", () => {
    it("handles streaming state correctly", () => {
      const { container } = render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={true}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );

      // Component renders with streaming prop
      expect(
        container.querySelector("[class*='messages']"),
      ).toBeInTheDocument();
    });

    it("keeps completed assistant messages visible while only the latest reply streams", () => {
      render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );

      expect(screen.getByText("Hello! How can I help you?")).toBeInTheDocument();
      expect(
        screen.queryByText("We offer design, development, and content services."),
      ).not.toBeInTheDocument();
    });

    it("does not restart the previous assistant message while a user submission waits", () => {
      render(
        withI18n(
          <ChatMessages
            messages={mockMessages.slice(0, 2)}
            isStreaming
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );

      expect(screen.getByText("Hello! How can I help you?")).toBeInTheDocument();
      expect(screen.getByText("Tell me about your services.")).toBeInTheDocument();
    });

    it("does not show streaming indicator when isStreaming is false", () => {
      render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );

      expect(screen.queryByText("Thinking…")).not.toBeInTheDocument();
    });

    it("marks the live log busy until the response is complete", () => {
      const { rerender } = render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );

      expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "true");

      rerender(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );
      expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "false");
    });
  });

  describe("Empty States", () => {
    it("renders empty messages array without errors", () => {
      const { container } = render(
        withI18n(
          <ChatMessages
            messages={[]}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );

      // Component should render even with no messages
      expect(
        container.querySelector("[class*='messages']"),
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have role=log on messages container", () => {
      render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );
      const container = screen.getByRole("log");
      expect(container).toBeInTheDocument();
    });

    it("should have aria-live=polite for non-intrusive announcements", () => {
      render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );
      const container = screen.getByRole("log");
      expect(container).toHaveAttribute("aria-live", "polite");
    });

    it("should have aria-relevant=additions to announce only new messages", () => {
      render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );
      const container = screen.getByRole("log");
      expect(container).toHaveAttribute("aria-relevant", "additions");
    });

    it("should have accessible name via aria-label", () => {
      render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );
      const container = screen.getByRole("log");
      expect(container).toHaveAccessibleName();
    });

    it("should have role=log on empty state container", () => {
      render(
        withI18n(
          <ChatMessages
            messages={[]}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );
      const container = screen.getByRole("log");
      expect(container).toBeInTheDocument();
    });

    it("has no accessibility violations with default props", async () => {
      const { container } = render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations when streaming", async () => {
      const { container } = render(
        withI18n(
          <ChatMessages
            messages={mockMessages}
            isStreaming={true}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations with empty messages", async () => {
      const { container } = render(
        withI18n(
          <ChatMessages
            messages={[]}
            isStreaming={false}
            emailWorkflow={{ step: "idle" }}
          />,
        ),
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
