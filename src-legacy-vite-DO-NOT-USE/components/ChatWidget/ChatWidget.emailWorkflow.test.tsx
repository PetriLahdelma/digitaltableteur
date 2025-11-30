import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

import ChatWidget from "./ChatWidget";

const mockSetMessages = vi.fn((updater: any) => updater([]));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_k: string, fallback?: string) => fallback || _k,
    i18n: { language: "en" },
  }),
}));

vi.mock("@ai-sdk/react", () => {
  const messages = [
    { id: "intro", role: "assistant", parts: [{ type: "text", text: "Hi" }] },
    {
      id: "u1",
      role: "user",
      parts: [{ type: "text", text: "help me send email" }],
    },
  ];
  return {
    useChat: vi.fn(() => ({
      messages,
      sendMessage: vi.fn(),
      stop: vi.fn(),
      status: "idle",
      error: null,
      clearError: vi.fn(),
      setMessages: mockSetMessages,
    })),
  };
});

vi.mock("ai", () => ({
  DefaultChatTransport: vi.fn(),
}));

describe("ChatWidget email workflow trigger", () => {
  beforeEach(() => {
    mockSetMessages.mockClear();
    localStorage.clear();
  });

  it("injects synthetic email workflow message when user asks to send email", async () => {
    render(<ChatWidget />);

    await waitFor(() => expect(mockSetMessages).toHaveBeenCalled());
  });
});
