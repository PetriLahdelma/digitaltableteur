import { APICallError, type LanguageModel } from "ai";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import { describe, expect, it } from "vitest";
import {
  createChatStreamResponse,
  isRetryableChatStreamError,
  isRetryableProviderError,
  trimChatHistory,
} from "./chat-stream-fallback";

/** The exact error OpenAI returned during the 2026-09-25 outage. */
function creditExhaustedError() {
  return new APICallError({
    message:
      "You have no credits remaining. Add credits to continue using the API at https://platform.openai.com/settings/organization/billing/.",
    url: "https://api.openai.com/v1/responses",
    requestBodyValues: {},
    statusCode: 429,
    responseBody:
      '{"type":"error","error":{"type":"insufficient_quota","code":"credit_balance_exhausted"}}',
    isRetryable: false,
  });
}

const usage = {
  inputTokens: { total: 5, noCache: 5, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 2, text: 2, reasoning: 0 },
};

function replyingModel(text: string) {
  return new MockLanguageModelV3({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "stream-start", warnings: [] },
          { type: "text-start", id: "t1" },
          { type: "text-delta", id: "t1", delta: text },
          { type: "text-end", id: "t1" },
          { type: "finish", finishReason: { unified: "stop", raw: "stop" }, usage },
        ],
      }),
    }),
  });
}

function failingModel() {
  return new MockLanguageModelV3({
    doStream: async () => {
      throw creditExhaustedError();
    },
  });
}

async function runChat(models: Record<string, LanguageModel>) {
  const response = createChatStreamResponse({
    backends: ["openai", "gateway"],
    buildParams: async () => ({
      system: "test",
      tools: {},
      messages: [{ role: "user", content: "Hi Donny" }],
      stopWhen: undefined,
      temperature: 0,
      maxOutputTokens: 50,
    }),
    headers: {},
    getModel: (backend) => models[backend]!,
  });
  return response.text();
}

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

  it("classifies the provider error, which the UI stream masks", () => {
    expect(isRetryableProviderError(creditExhaustedError())).toBe(true);
    // What toUIMessageStream() hands the client: no quota detail left.
    expect(isRetryableChatStreamError("An error occurred.")).toBe(false);
  });

  it("falls back to the Gateway when OpenAI credits are exhausted", async () => {
    const body = await runChat({
      openai: failingModel(),
      gateway: replyingModel("Hello from the gateway"),
    });
    expect(body).toContain("Hello from the gateway");
    expect(body).not.toContain('"type":"error"');
    expect(body).not.toContain("credit");
  });

  it("surfaces a category and reference, never billing detail, when every backend fails", async () => {
    const body = await runChat({ openai: failingModel(), gateway: failingModel() });
    expect(body).toMatch(/"errorText":"DONNY_ERROR:ai_unavailable:[A-Z2-9]{6}"/);
    expect(body).not.toContain("credit");
    expect(body).not.toContain("quota");
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
