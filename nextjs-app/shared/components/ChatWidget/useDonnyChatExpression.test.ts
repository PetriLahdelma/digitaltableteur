import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { UIMessage } from "ai";
import { useDonnyChatExpression } from "./useDonnyChatExpression";

const expressionMessage: UIMessage = {
  id: "assistant-expr",
  role: "assistant",
  parts: [
    {
      type: "tool-studio.showExpression",
      toolCallId: "call-expr",
      state: "output-available",
      output: {
        expression: "playful",
        label: "Playful",
        durationMs: 1500,
      },
    } as never,
  ],
};

describe("useDonnyChatExpression", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("forces an expression after streaming completes", () => {
    const { result, rerender } = renderHook(
      ({ messages, status }) => useDonnyChatExpression(messages, status),
      {
        initialProps: {
          messages: [] as UIMessage[],
          status: "streaming" as const,
        },
      },
    );

    expect(result.current).toBeNull();

    rerender({
      messages: [expressionMessage],
      status: "ready",
    });

    expect(result.current).toBe("playful");
  });

  it("clears forced expression when the user submits a new message", () => {
    const { result, rerender } = renderHook(
      ({ messages, status }) => useDonnyChatExpression(messages, status),
      {
        initialProps: {
          messages: [] as UIMessage[],
          status: "streaming" as const,
        },
      },
    );

    rerender({
      messages: [expressionMessage],
      status: "ready",
    });

    expect(result.current).toBe("playful");

    rerender({
      messages: [expressionMessage],
      status: "submitted",
    });

    expect(result.current).toBeNull();
  });

  it("expires forced expression after durationMs", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ messages, status }) => useDonnyChatExpression(messages, status),
      {
        initialProps: {
          messages: [] as UIMessage[],
          status: "streaming" as const,
        },
      },
    );

    rerender({
      messages: [expressionMessage],
      status: "ready",
    });

    expect(result.current).toBe("playful");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current).toBeNull();
  });
});
