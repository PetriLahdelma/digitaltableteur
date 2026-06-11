import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ChatWidget from "@dt/ChatWidget";

const STORAGE_KEY = "dt-donny-chat-v2";
const LEGACY_STORAGE_KEY = "dt-donny-chat";

const mockSendMessage = vi.fn();
const mockStop = vi.fn();
const mockClearError = vi.fn();
const mockSetMessages = vi.fn((updater: any) => {
  if (typeof updater === "function") {
    return updater([]);
  }
  return updater;
});

let mockError: Error | null = null;

vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn((options: any) => ({
    messages: options?.messages ?? [],
    sendMessage: mockSendMessage,
    stop: mockStop,
    status: "idle",
    error: mockError,
    clearError: mockClearError,
    setMessages: mockSetMessages,
  })),
}));

vi.mock("ai", () => ({
  DefaultChatTransport: class DefaultChatTransport {
    constructor() {
      return {};
    }
  },
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: { language: "en" },
  }),
}));

describe("ChatWidget behaviors", () => {
  beforeEach(() => {
    localStorage.clear();
    mockError = null;
    vi.clearAllMocks();
  });

  it("hydrates from stored transcripts (including legacy) and clears legacy storage", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "intro", role: "assistant", text: "Persisted hello" },
        { id: "u1", role: "user", text: "Hi" },
      ]),
    );
    localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify([{ id: "legacy", role: "assistant", content: "Old" }]),
    );

    render(<ChatWidget />);

    await waitFor(() => expect(mockSetMessages).toHaveBeenCalled());
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
  });

  it("shows recoverable error banner and reset clears stored messages", async () => {
    mockError = new Error("Failed to fetch");

    render(<ChatWidget />);

    await screen.findByText(/lost the connection/i);

    fireEvent.click(screen.getByRole("button", { name: /Chat with Donny/i }));
    fireEvent.click(screen.getByRole("button", { name: /Clear/i }));

    expect(mockClearError).toHaveBeenCalled();
    expect(mockSetMessages).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "intro", role: "assistant" }),
      ]),
    );

    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      expect(stored).toContain("Digitaltableteur");
    });
  });

  it("sends and closes via escape", async () => {
    render(<ChatWidget />);

    const toggle = screen.getByRole("button", { name: /Chat with Donny/i });
    fireEvent.click(toggle);

    const textarea = await screen.findByLabelText(/ask donny a question/i);
    fireEvent.change(textarea, { target: { value: "Hello Donny" } });
    fireEvent.submit(textarea.closest("form")!);

    expect(mockSendMessage).toHaveBeenCalledWith({ text: "Hello Donny" });

    fireEvent.keyDown(window, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("opts the open panel out of Lenis wheel capture for nested chat scrolling", async () => {
    render(<ChatWidget />);

    fireEvent.click(screen.getByRole("button", { name: /Chat with Donny/i }));

    const panel = document.getElementById("donny-panel");
    expect(panel).toHaveAttribute("data-lenis-prevent-wheel");
  });
});
