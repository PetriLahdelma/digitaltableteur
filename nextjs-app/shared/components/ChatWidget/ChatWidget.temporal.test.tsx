/**
 * Proves the claims in ChatWidget.contract.json `temporal` and `consequence`
 * (RFC 0001). The open checker fails any automated claim whose id does not
 * appear in this file, so each `describe` is named after its claim id.
 */
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ChatWidget from "@dt/ChatWidget";
import contract from "./ChatWidget.contract.json";
import { emailWorkflowReducer } from "./emailWorkflow/reducer";
import { createInitialDraft } from "./emailWorkflow/types";
import { TEMPORAL_THRESHOLDS } from "../../lib/temporal";

const STORAGE_KEY = "dt-donny-chat-v2";

const mockSendMessage = vi.fn();
let mockStatus = "ready";
let mockError: Error | null = null;

vi.mock("@ai-sdk/react", async () => {
  const { useState } = await import("react");
  return {
    // Stateful like the real hook, so Clear and Undo change what renders.
    useChat: (options: { messages?: unknown[] }) => {
      const [messages, setMessages] = useState(options?.messages ?? []);
      return {
        messages,
        setMessages,
        sendMessage: mockSendMessage,
        stop: vi.fn(),
        status: mockStatus,
        error: mockError,
        clearError: vi.fn(),
      };
    },
  };
});

vi.mock("ai", () => ({
  DefaultChatTransport: class DefaultChatTransport {},
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

type Claim = { id: string; afterMs?: number; staleAfterMs?: number };
const temporal = contract.temporal as unknown as Record<string, Claim[]>;
const claim = (group: string, id: string) =>
  temporal[group].find((entry) => entry.id === id)!;

const seedTranscript = () =>
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      { id: "intro", role: "assistant", text: "Hi there" },
      { id: "u1", role: "user", text: "Remember the fjord trip" },
    ]),
  );

const clearButton = () =>
  document.querySelector<HTMLButtonElement>('[aria-label="Clear conversation"]')!;

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  mockSendMessage.mockReset();
  mockStatus = "ready";
  mockError = null;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("slow-response-acknowledged", () => {
  it("uses the shared acknowledge-delay threshold", () => {
    expect(claim("transitions", "slow-response-acknowledged").afterMs).toBe(
      TEMPORAL_THRESHOLDS.acknowledgeDelayMs,
    );
  });

  it("acknowledges a request with no first token only after the threshold", () => {
    vi.useFakeTimers();
    mockStatus = "submitted";
    const { rerender } = render(<ChatWidget />);
    act(() => vi.advanceTimersByTime(TEMPORAL_THRESHOLDS.acknowledgeDelayMs - 1));
    expect(document.querySelector('[data-temporal="slow-response-acknowledged"]')).toBeNull();

    act(() => vi.advanceTimersByTime(1));
    const notice = document.querySelector('[data-temporal="slow-response-acknowledged"]');
    expect(notice).toHaveAttribute("role", "status");
    expect(notice).toHaveTextContent(/taking longer than usual/i);

    // The reply starts: the acknowledgment has done its job and goes away.
    mockStatus = "streaming";
    rerender(<ChatWidget />);
    expect(document.querySelector('[data-temporal="slow-response-acknowledged"]')).toBeNull();
  });
});

describe("clear-undo-window", () => {
  it("uses the shared undo-window threshold", () => {
    expect(claim("validity", "clear-undo-window").staleAfterMs).toBe(
      TEMPORAL_THRESHOLDS.undoWindowMs,
    );
  });

  it("restores the cleared transcript on Undo", () => {
    seedTranscript();
    render(<ChatWidget />);
    expect(screen.getByText("Remember the fjord trip")).toBeInTheDocument();

    fireEvent.click(clearButton());
    expect(screen.queryByText("Remember the fjord trip")).toBeNull();
    expect(screen.getByText("Conversation cleared.")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Undo"));
    expect(screen.getByText("Remember the fjord trip")).toBeInTheDocument();
    expect(screen.queryByText("Conversation cleared.")).toBeNull();
  });

  it("finalizes the clear when the window ends", () => {
    vi.useFakeTimers();
    seedTranscript();
    render(<ChatWidget />);
    fireEvent.click(clearButton());
    act(() => vi.advanceTimersByTime(TEMPORAL_THRESHOLDS.undoWindowMs));
    expect(screen.queryByText("Undo")).toBeNull();
    expect(screen.queryByText("Remember the fjord trip")).toBeNull();
  });

  it("finalizes the clear when a new message is sent", () => {
    seedTranscript();
    render(<ChatWidget />);
    fireEvent.click(clearButton());
    const textarea = document.getElementById("donny-input") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "A new question" } });
    fireEvent.submit(textarea.closest("form")!);
    expect(mockSendMessage).toHaveBeenCalledWith({ text: "A new question" });
    expect(screen.queryByText("Undo")).toBeNull();
  });

  it("offers no undo when there was nothing to clear", () => {
    render(<ChatWidget />);
    fireEvent.click(clearButton());
    expect(screen.queryByText("Undo")).toBeNull();
  });
});

describe("transcript-survives-navigation", () => {
  it("restores the transcript when the widget mounts again in the same tab", () => {
    seedTranscript();
    const first = render(<ChatWidget />);
    first.unmount();
    render(<ChatWidget />);
    expect(screen.getByText("Remember the fjord trip")).toBeInTheDocument();
  });

  it("survives a reload under Strict Mode's double effect run", () => {
    // Reproduces the browser bug: the persist effect wrote the bare greeting
    // over the stored transcript before the restore effect could read it.
    seedTranscript();
    render(
      <React.StrictMode>
        <ChatWidget />
      </React.StrictMode>,
    );
    expect(screen.getByText("Remember the fjord trip")).toBeInTheDocument();
    expect(sessionStorage.getItem(STORAGE_KEY)).toContain("Remember the fjord trip");
  });
});

describe("unreachable-endpoint-retries-once", () => {
  const submit = (text: string) => {
    const textarea = document.getElementById("donny-input") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: text } });
    fireEvent.submit(textarea.closest("form")!);
  };

  it("resends once when the request never reached a server", () => {
    const { rerender } = render(<ChatWidget />);
    submit("Hello");
    mockError = new Error("Failed to fetch");
    rerender(<ChatWidget />);
    rerender(<ChatWidget />);
    rerender(<ChatWidget />);
    expect(mockSendMessage).toHaveBeenCalledTimes(2);
    expect(mockSendMessage).toHaveBeenLastCalledWith({ text: "Hello" });
  });

  it("never resends a request that reached a server", () => {
    const { rerender } = render(<ChatWidget />);
    submit("Hello");
    mockError = new Error("500 Internal Server Error");
    rerender(<ChatWidget />);
    rerender(<ChatWidget />);
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
  });
});

describe("email-draft-kept-on-send-error", () => {
  it("keeps the draft when sending fails", () => {
    const draft = { ...createInitialDraft(), fullName: "Aino", message: "Hello" };
    const failed = emailWorkflowReducer(
      { step: "sending", draft },
      { type: "SEND_ERROR", errorCode: "E1" },
    );
    expect(failed).toEqual({ step: "error", draft, errorCode: "E1" });
  });
});

describe("email-send-reviewed", () => {
  it("only sends from the review step, and a repeated Send while sending does nothing", () => {
    const draft = { ...createInitialDraft(), fullName: "Aino" };
    expect(
      emailWorkflowReducer({ step: "collectingMessage", draft }, { type: "SEND_REQUEST" }),
    ).toEqual({ step: "collectingMessage", draft });
    const sending = emailWorkflowReducer({ step: "review", draft }, { type: "SEND_REQUEST" });
    expect(sending).toEqual({ step: "sending", draft });
    expect(emailWorkflowReducer(sending, { type: "SEND_REQUEST" })).toBe(sending);
  });
});
