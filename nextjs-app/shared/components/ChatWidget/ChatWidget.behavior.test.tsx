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

vi.mock("../../lib/translation", () => {
  const t = (key: string, fallback?: string) => fallback || key;
  return {
    useTranslate: () => t,
    useLocalization: () => ({
      translate: t,
      language: "en",
      resolvedLanguage: "en",
      changeLanguage: vi.fn(),
      getResourceBundle: vi.fn(),
    }),
  };
});

describe("ChatWidget behaviors", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockError = null;
    vi.clearAllMocks();
  });

  it("hydrates session transcripts and clears persistent legacy storage", async () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "intro", role: "assistant", text: "Persisted hello" },
        { id: "u1", role: "user", text: "Hi" },
      ]),
    );
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "persistent", role: "user", text: "Remove me" }]),
    );
    localStorage.setItem(
      LEGACY_STORAGE_KEY,
      JSON.stringify([{ id: "legacy", role: "assistant", content: "Old" }]),
    );

    render(<ChatWidget />);

    await waitFor(() => expect(mockSetMessages).toHaveBeenCalled());
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeTruthy();
  });

  it("lets the notice be dismissed while identity, limits and policy stay reachable", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByRole("button", { name: /AI assistant/i }));

    fireEvent.click(screen.getByRole("button", { name: /dismiss notice/i }));

    expect(
      screen.queryByRole("complementary", { name: /AI assistant information/i }),
    ).not.toBeInTheDocument();
    expect(sessionStorage.getItem("dt-donny-notice-dismissed")).toBe("1");
    expect(
      screen.getByRole("heading", { name: /AI assistant/i }),
    ).toBeVisible();
    expect(screen.getAllByText(/may be wrong/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /about this AI/i }),
    ).toHaveAttribute("href", "/ai-use");
  });

  it("shows AI identity, limitations, policy, and reporting before input", () => {
    render(<ChatWidget />);

    fireEvent.click(screen.getByRole("button", { name: /AI assistant/i }));

    expect(
      screen.getByRole("heading", { name: /AI assistant/i }),
    ).toBeVisible();
    expect(screen.getAllByText(/may be wrong/i).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByRole("link", { name: /AI use and data details/i }),
    ).toHaveAttribute("href", "/ai-use");
    expect(
      screen.getByRole("link", { name: /report a problem/i }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:mail@digitaltableteur.com"),
    );
  });

  it("shows recoverable error banner and reset clears stored messages", async () => {
    mockError = new Error("Failed to fetch");

    render(<ChatWidget />);

    await screen.findByText(/lost the connection/i);

    fireEvent.click(screen.getByRole("button", { name: /AI assistant/i }));
    fireEvent.click(screen.getByRole("button", { name: /Clear/i }));

    expect(mockClearError).toHaveBeenCalled();
    expect(mockSetMessages).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "intro", role: "assistant" }),
      ]),
    );

    await waitFor(() => {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      expect(stored).toBeTruthy();
      expect(stored).toContain("Digitaltableteur");
    });
  });

  it("sends and closes via escape", async () => {
    render(<ChatWidget />);

    const toggle = screen.getByRole("button", { name: /AI assistant/i });
    fireEvent.click(toggle);

    const textarea = await screen.findByLabelText(
      /ask the AI assistant a question/i,
    );
    fireEvent.change(textarea, { target: { value: "Hello Donny" } });
    fireEvent.submit(textarea.closest("form")!);

    expect(mockSendMessage).toHaveBeenCalledWith({ text: "Hello Donny" });

    fireEvent.keyDown(window, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("opts the open panel out of Lenis wheel capture for nested chat scrolling", async () => {
    render(<ChatWidget />);

    fireEvent.click(screen.getByRole("button", { name: /AI assistant/i }));

    const panel = document.getElementById("donny-panel");
    expect(panel).toHaveAttribute("data-lenis-prevent-wheel");
  });
});
