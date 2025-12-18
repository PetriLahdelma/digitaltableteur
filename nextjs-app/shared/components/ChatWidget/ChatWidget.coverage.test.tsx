import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import ChatWidget from "@dt/ChatWidget";

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

  it("closes panel when toggle clicked again", () => {
    render(<ChatWidget />);

    const toggle = screen.getByRole("button", { name: /chat/i });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("renders header with title and close button", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /chat/i }));

    expect(screen.getByText(/chat\.title/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("closes panel via header close button", () => {
    render(<ChatWidget />);
    const toggle = screen.getByRole("button", { name: /chat/i });
    fireEvent.click(toggle);

    const closeBtn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeBtn);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("renders message composer with input and send button", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /chat/i }));

    const input = screen.getByPlaceholderText(/type.*message/i);
    expect(input).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("renders intro message on mount", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /chat/i }));

    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("displays stop button when status is streaming", () => {
    const mockUseChat = vi.fn(() => ({
      messages: [],
      sendMessage: vi.fn(),
      stop: mockStop,
      status: "streaming",
      error: null,
      clearError: mockClearError,
      setMessages: mockSetMessages,
    }));

    vi.mocked(require("@ai-sdk/react").useChat).mockImplementation(mockUseChat);

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /chat/i }));

    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
  });

  it("calls stop when stop button clicked", () => {
    const mockUseChat = vi.fn(() => ({
      messages: [],
      sendMessage: vi.fn(),
      stop: mockStop,
      status: "streaming",
      error: null,
      clearError: mockClearError,
      setMessages: mockSetMessages,
    }));

    vi.mocked(require("@ai-sdk/react").useChat).mockImplementation(mockUseChat);

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /chat/i }));

    const stopBtn = screen.getByRole("button", { name: /stop/i });
    fireEvent.click(stopBtn);

    expect(mockStop).toHaveBeenCalled();
  });

  it("displays error message when error exists", () => {
    const mockUseChat = vi.fn(() => ({
      messages: [],
      sendMessage: vi.fn(),
      stop: mockStop,
      status: "idle",
      error: new Error("Network error"),
      clearError: mockClearError,
      setMessages: mockSetMessages,
    }));

    vi.mocked(require("@ai-sdk/react").useChat).mockImplementation(mockUseChat);

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /chat/i }));

    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  it("clears error when clear button clicked", () => {
    const mockUseChat = vi.fn(() => ({
      messages: [],
      sendMessage: vi.fn(),
      stop: mockStop,
      status: "idle",
      error: new Error("Network error"),
      clearError: mockClearError,
      setMessages: mockSetMessages,
    }));

    vi.mocked(require("@ai-sdk/react").useChat).mockImplementation(mockUseChat);

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /chat/i }));

    const clearBtn = screen.getByRole("button", { name: /clear/i });
    fireEvent.click(clearBtn);

    expect(mockClearError).toHaveBeenCalled();
  });

  it("persists messages to localStorage on change", async () => {
    const messages = [
      { id: "1", role: "user", parts: [{ type: "text", text: "Hello" }] },
      { id: "2", role: "assistant", parts: [{ type: "text", text: "Hi!" }] },
    ];

    const mockUseChat = vi.fn(() => ({
      messages,
      sendMessage: vi.fn(),
      stop: mockStop,
      status: "idle",
      error: null,
      clearError: mockClearError,
      setMessages: mockSetMessages,
    }));

    vi.mocked(require("@ai-sdk/react").useChat).mockImplementation(mockUseChat);

    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /chat/i }));

    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      expect(stored).toContain("Hello");
      expect(stored).toContain("Hi!");
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

    render(<ChatWidget />);

    expect(mockSetMessages).toHaveBeenCalledWith(storedMessages);
  });
});
