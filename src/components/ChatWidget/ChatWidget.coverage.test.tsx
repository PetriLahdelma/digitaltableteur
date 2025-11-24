import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import ChatWidget from "./ChatWidget";

const STORAGE_KEY = "dt-donny-chat-v2";

const mockSetMessages = vi.fn();
const mockClearError = vi.fn();
const mockStop = vi.fn();

vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(() => ({
    messages: [
      {
        id: "intro",
        role: "assistant",
        parts: [{ type: "text", text: "Hello" }],
      },
    ],
    sendMessage: vi.fn(),
    stop: mockStop,
    status: "idle",
    error: null,
    clearError: mockClearError,
    setMessages: mockSetMessages,
  })),
}));

vi.mock("ai", () => ({
  DefaultChatTransport: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

describe("ChatWidget coverage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders toggle and opens panel", async () => {
    render(<ChatWidget />);

    const toggle = screen.getByRole("button", { name: /chat/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    // Local storage should capture intro greeting
    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      expect(stored).toContain("Hi!");
    });
  });
});
