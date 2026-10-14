import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { afterEach, describe, expect, it } from "vitest";
import {
  resolveGatewayModelId,
  resolveModelId,
} from "@/app/api/chat-shared";
import {
  getChatProviderOptions,
  resolvePrimaryChatBackend,
  resolveChatBackendOrder,
  hasOpenAiFallback,
} from "./chat-model";

describe("chat-model", () => {
  const env = process.env;

  afterEach(() => {
    process.env = { ...env };
  });

  it("prefers OpenAI when both keys are present", () => {
    process.env.NODE_ENV = "development";
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.AI_GATEWAY_API_KEY = "gw-test";
    delete process.env.CHAT_MODEL_PROVIDER;

    expect(resolvePrimaryChatBackend()).toBe("openai");
    expect(resolveChatBackendOrder()).toEqual(["openai", "gateway"]);
  });

  it("falls back to gateway when OpenAI is primary", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.AI_GATEWAY_API_KEY = "gw-test";
    delete process.env.CHAT_MODEL_PROVIDER;

    expect(resolveChatBackendOrder()[1]).toBe("gateway");
  });

  it("respects CHAT_MODEL_PROVIDER=gateway", () => {
    process.env.NODE_ENV = "development";
    process.env.CHAT_MODEL_PROVIDER = "gateway";
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.AI_GATEWAY_API_KEY = "gw-test";

    expect(resolvePrimaryChatBackend()).toBe("gateway");
  });

  it("detects OpenAI fallback availability", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    expect(hasOpenAiFallback()).toBe(true);
    delete process.env.OPENAI_API_KEY;
    expect(hasOpenAiFallback()).toBe(false);
  });

  it("defaults to gpt-6-luna direct and a free-tier model on the Gateway", () => {
    delete process.env.OPENAI_MODEL;
    delete process.env.AI_GATEWAY_MODEL;

    expect(resolveModelId()).toBe("gpt-6-luna");
    expect(resolveGatewayModelId()).toBe("openai/gpt-5.4-nano");
  });

  it("sends reasoning effort none and keeps temperature for gpt-6-luna", async () => {
    let body: Record<string, unknown> | undefined;
    const openai = createOpenAI({
      apiKey: "sk-test",
      fetch: async (_url, init) => {
        body = JSON.parse(String(init?.body));
        return new Response(
          JSON.stringify({
            id: "resp_test",
            created_at: 0,
            model: "gpt-6-luna",
            output: [
              {
                type: "message",
                id: "msg_test",
                role: "assistant",
                content: [{ type: "output_text", text: "ok", annotations: [] }],
              },
            ],
            usage: { input_tokens: 1, output_tokens: 1 },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
    });

    const result = await generateText({
      model: openai("gpt-6-luna"),
      prompt: "hi",
      temperature: 0.2,
      providerOptions: getChatProviderOptions(),
    });

    expect(body?.reasoning).toEqual({ effort: "none" });
    expect(body?.temperature).toBe(0.2);
    expect(body?.parallel_tool_calls).toBe(false);
    expect(result.warnings ?? []).toEqual([]);
  });
});
