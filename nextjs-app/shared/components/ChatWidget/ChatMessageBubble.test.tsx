import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import ChatMessageBubble, { withHardBreaks } from "@dt/ChatWidget/ChatMessageBubble";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import type { ProcessedMessage } from "@dt/ChatWidget/messageProcessor";
import { TranslationProvider, type Translate } from "../../lib/translation";

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
      expect(screen.getByRole("group", { name: "Donny, AI assistant" })).toHaveTextContent(
        "Hello! How can I help you?",
      );
      expect(screen.getByTestId("chat-message-assistant")).toHaveAttribute(
        "data-role",
        "assistant",
      );
      expect(screen.getByTestId("chat-message-assistant")).toHaveAttribute(
        "data-ai-generated",
        "true",
      );
      expect(screen.getByTestId("chat-message-assistant")).toHaveAttribute(
        "data-ai-output-type",
        "text",
      );
      expect(screen.getByTestId("chat-message-assistant")).toHaveAttribute(
        "data-ai-system",
        "donny",
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
      expect(screen.getByRole("group", { name: "You" })).toHaveTextContent(
        "Tell me about your services.",
      );
      expect(screen.getByTestId("chat-message-user")).toHaveAttribute(
        "data-role",
        "user",
      );
      expect(screen.getByTestId("chat-message-user")).not.toHaveAttribute(
        "data-ai-generated",
      );
    });

    it("keeps a user message's line breaks and still renders typed lists", () => {
      render(
        withI18n(
          <ChatMessageBubble
            message={{
              id: "msg-lines",
              role: "user",
              parts: [{ kind: "text", content: "Moi\naukioloajat?\n\nIn this order:\n1. Audit\n2. Roadmap" }],
            }}
            isStreaming={false}
          />,
        ),
      );

      const bubble = screen.getByTestId("chat-message-user");
      const firstParagraph = bubble.querySelector("p")!;
      expect(firstParagraph.querySelector("br")).not.toBeNull();
      expect(firstParagraph.textContent).toBe("Moi\naukioloajat?");
      expect(bubble.querySelectorAll("li")).toHaveLength(2);
    });

    it("marks only single newlines as hard breaks", () => {
      expect(withHardBreaks("a\nb\n\nc")).toBe("a  \nb\n\nc");
    });

    it("still renders assistant replies as Markdown", () => {
      render(
        withI18n(
          <ChatMessageBubble
            message={{
              id: "msg-md",
              role: "assistant",
              parts: [{ kind: "text", content: "1. First\n2. Second" }],
            }}
            isStreaming={false}
          />,
        ),
      );

      expect(screen.getByTestId("chat-message-assistant").querySelectorAll("li")).toHaveLength(2);
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

  describe("Tool result cards", () => {
    const packageMessage: ProcessedMessage = {
      id: "msg-pkg",
      role: "assistant",
      parts: [
        {
          kind: "component",
          name: "ServicePackageCards",
          props: {
            pricingUrl: "/pricing",
            packages: [
              {
                id: "design-system-lift-off",
                name: "Design System Lift-Off",
                priceRangeEur: "€14–20k",
                duration: "4 weeks",
                description: "Audit, tokens and core components.",
                recommended: true,
              },
            ],
          },
        },
      ],
    };

    it("links package results to the pricing calculator", () => {
      render(withI18n(<ChatMessageBubble message={packageMessage} />));
      const link = screen.getByRole("link", { name: /calculator/i });
      expect(link).toHaveAttribute("href", "/pricing#calculator");
    });

    it("does not use middle dots in package cards", () => {
      render(withI18n(<ChatMessageBubble message={packageMessage} />));
      const card = screen.getByRole("link", { name: /Design System Lift-Off/ });
      expect(card.textContent).not.toContain("·");
      expect(card.textContent).toContain("Recommended");
    });

    it("shows package copy in the visitor's language", () => {
      const fi = i18n.getFixedT("fi");
      const translate: Translate = (key, fallbackOrOptions, options) =>
        typeof fallbackOrOptions === "string"
          ? fi(key, { ...options, defaultValue: fallbackOrOptions })
          : fi(key, fallbackOrOptions);
      render(
        <TranslationProvider translate={translate} language="fi" resolvedLanguage="fi">
          <ChatMessageBubble message={packageMessage} />
        </TranslationProvider>,
      );
      const card = screen.getByRole("link", { name: /Design System Lift-Off/ });
      expect(card).toHaveTextContent("4 viikkoa");
      expect(card).toHaveTextContent("Suositeltu");
      expect(card).not.toHaveTextContent("4 weeks");
      expect(
        screen.getByRole("link", { name: /Arvioi oma toimeksianto laskurilla/ }),
      ).toHaveAttribute("href", "/pricing#calculator");
    });

    it("translates the navigate button", () => {
      const fi = i18n.getFixedT("fi");
      const translate: Translate = (key, fallbackOrOptions, options) =>
        typeof fallbackOrOptions === "string"
          ? fi(key, { ...options, defaultValue: fallbackOrOptions })
          : fi(key, fallbackOrOptions);
      render(
        <TranslationProvider translate={translate} language="fi" resolvedLanguage="fi">
          <ChatMessageBubble
            message={{
              id: "msg-nav",
              role: "assistant",
              parts: [
                {
                  kind: "component",
                  name: "NavigateLink",
                  props: { url: "/services", label: "Digitaltableteurin palvelut" },
                },
              ],
            }}
          />
        </TranslationProvider>,
      );
      expect(
        screen.getByRole("link", { name: /Siirry sivulle Digitaltableteurin palvelut/ }),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Go to/)).not.toBeInTheDocument();
    });
  });
});

