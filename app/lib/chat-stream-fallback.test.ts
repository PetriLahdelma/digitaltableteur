import { describe, expect, it } from "vitest";
import {
  isRetryableChatStreamError,
  trimChatHistory,
} from "./chat-stream-fallback";

describe("chat-stream-fallback", () => {
  it("detects gateway free-tier rate limit errors", () => {
    expect(
      isRetryableChatStreamError(
        "Free tier requests on this model are rate-limited. Upgrade to paid credits",
      ),
    ).toBe(true);
  });

  it("detects OpenAI quota errors", () => {
    expect(
      isRetryableChatStreamError(
        '{"error":{"code":"insufficient_quota","message":"You exceeded your current quota"}}',
      ),
    ).toBe(true);
  });

  it("trims chat history to the latest messages", () => {
    const messages = Array.from({ length: 20 }, (_, index) => ({
      role: index % 2 === 0 ? "user" : "assistant",
      id: String(index),
    }));

    expect(trimChatHistory(messages, 14)).toHaveLength(14);
    expect(trimChatHistory(messages, 14)[0]?.id).toBe("6");
  });
});
