import { describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import {
  executeChatNavigation,
  extractNavigateToolResults,
} from "./chatToolNavigation";

describe("chatToolNavigation", () => {
  it("extracts legacy tool-invocation navigate results", () => {
    const message: UIMessage = {
      id: "assistant-1",
      role: "assistant",
      parts: [
        {
          type: "tool-invocation",
          toolInvocation: {
            toolCallId: "call-1",
            toolName: "studio.navigateTo",
            state: "result",
            result: { navigated: true, url: "/work" },
          },
        } as never,
      ],
    };

    expect(extractNavigateToolResults(message)).toEqual([
      {
        toolCallId: "call-1",
        url: "/work",
        navigated: true,
      },
    ]);
  });

  it("extracts AI SDK tool-studio.navigateTo output", () => {
    const message: UIMessage = {
      id: "assistant-2",
      role: "assistant",
      parts: [
        {
          type: "tool-studio.navigateTo",
          toolCallId: "call-2",
          state: "output-available",
          input: { destination: "/work" },
          output: { navigated: true, url: "/work" },
        } as never,
      ],
    };

    expect(extractNavigateToolResults(message)).toEqual([
      {
        toolCallId: "call-2",
        url: "/work",
        navigated: true,
      },
    ]);
  });

  it("executes registry navigation for /work", async () => {
    const showPageTarget = vi.fn().mockResolvedValue({ ok: true });
    const push = vi.fn();

    await executeChatNavigation(
      "/work",
      { showPageTarget },
      { push },
      "call-work",
    );

    expect(showPageTarget).toHaveBeenCalledWith({
      targetId: "work.index",
      mode: "navigate",
      highlightMode: "spotlight",
      toolCallId: "call-work",
    });
    expect(push).not.toHaveBeenCalled();
  });

  it("falls back to router.push for unmapped internal paths", async () => {
    const showPageTarget = vi.fn();
    const push = vi.fn();

    await executeChatNavigation(
      "/about",
      { showPageTarget },
      { push },
      "call-about",
    );

    expect(showPageTarget).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/about");
  });
});
