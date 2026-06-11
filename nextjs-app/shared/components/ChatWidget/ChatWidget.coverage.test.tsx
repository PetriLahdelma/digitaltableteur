import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils/render";

import ChatWidget from "@dt/ChatWidget";

const STORAGE_KEY = "dt-donny-chat-v2";

const mockSendMessage = vi.fn();
const mockSetMessages = vi.fn((updater: unknown) => {
  if (typeof updater === "function") {
    return (updater as (prev: unknown[]) => unknown)([]);
  }
  return updater;
});
const mockClearError = vi.fn();
const mockStop = vi.fn();

let mockError: Error | null = null;
let mockStatus = "idle";
let mockMessagesOverride: unknown[] | null = null;

const mockUseChat = vi.fn((options: { messages?: unknown[] } = {}) => ({
  messages: mockMessagesOverride ?? options.messages ?? [],
  sendMessage: mockSendMessage,
  stop: mockStop,
  status: mockStatus,
  error: mockError,
  clearError: mockClearError,
  setMessages: mockSetMessages,
}));

vi.mock("@ai-sdk/react", () => ({
  useChat: (...args: unknown[]) => mockUseChat(...args),
}));

vi.mock("ai", () => ({
  DefaultChatTransport: class DefaultChatTransport {
    constructor() {
      return {};
    }
  },
}));

describe("ChatWidget coverage", () => {
  beforeEach(() => {
    localStorage.clear();
    mockError = null;
    mockStatus = "idle";
    mockMessagesOverride = null;
    vi.clearAllMocks();
    mockUseChat.mockClear();
  });

  it("renders toggle and opens panel", async () => {
    renderWithProviders(<ChatWidget />);

    const toggle = screen.getByRole("button", { name: /Chat with Donny/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      expect(stored).toContain("Donny");
    });
  });

  it("closes panel when toggle clicked again", () => {
    renderWithProviders(<ChatWidget />);

    const toggle = screen.getByRole("button", { name: /Chat with Donny/i });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("renders header with title and minimize button", () => {
    renderWithProviders(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Chat with Donny/i }));

    expect(screen.getByText(/Chat with Donny/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Minimize chat/i }),
    ).toBeInTheDocument();
  });

  it("closes panel via header minimize button", () => {
    renderWithProviders(<ChatWidget />);
    const toggle = screen.getByRole("button", { name: /Chat with Donny/i });
    fireEvent.click(toggle);

    fireEvent.click(screen.getByRole("button", { name: /Minimize chat/i }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("renders message composer with input and send button", () => {
    renderWithProviders(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Chat with Donny/i }));

    expect(
      screen.getByLabelText(/Ask Donny a question/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send message/i }),
    ).toBeInTheDocument();
  });

  it("renders intro message on mount", () => {
    renderWithProviders(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Chat with Donny/i }));

    expect(
      screen.getByText(/design system challenge/i),
    ).toBeInTheDocument();
  });

  it("disables send while streaming", () => {
    mockStatus = "streaming";

    renderWithProviders(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Chat with Donny/i }));

    expect(
      screen.getByRole("button", { name: /Send message/i }),
    ).toBeDisabled();
  });

  it("displays error message when error exists", async () => {
    mockError = new Error("Failed to fetch");

    renderWithProviders(<ChatWidget />);
    expect(await screen.findByText(/lost the connection/i)).toBeInTheDocument();
  });

  it("clears error when conversation is reset", async () => {
    mockError = new Error("Failed to fetch");

    renderWithProviders(<ChatWidget />);
    await screen.findByText(/lost the connection/i);

    fireEvent.click(screen.getByRole("button", { name: /Chat with Donny/i }));
    fireEvent.click(screen.getByRole("button", { name: /Clear/i }));
    expect(mockClearError).toHaveBeenCalled();
  });

  it("persists messages to localStorage on change", async () => {
    mockMessagesOverride = [
      { id: "1", role: "user", parts: [{ type: "text", text: "Hello" }] },
      { id: "2", role: "assistant", parts: [{ type: "text", text: "Hi!" }] },
    ];

    renderWithProviders(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /Chat with Donny/i }));

    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      expect(stored).toContain("Hello");
    });
  });

  it("loads messages from localStorage on mount", () => {
    const storedMessages = [
      {
        id: "1",
        role: "user",
        parts: [{ type: "text", text: "Loaded message" }],
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedMessages));

    renderWithProviders(<ChatWidget />);

    expect(mockSetMessages).toHaveBeenCalled();
  });
});
