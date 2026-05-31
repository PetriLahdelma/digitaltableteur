import { afterEach, describe, expect, it } from "vitest";
import {
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
});
