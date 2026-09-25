import { jsonSchema, stepCountIs, streamText, tool, wrapLanguageModel } from "ai";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import { describe, expect, it } from "vitest";

import {
  gatewayFinishCompatMiddleware,
  normalizeFinishReason,
  normalizeUsage,
} from "./gateway-finish-compat";

/** The legacy finish part the AI Gateway sent on 2026-09-25. */
const legacyFinish = {
  type: "finish",
  finishReason: "tool-calls",
  usage: { inputTokens: 40, outputTokens: 11, totalTokens: 51, reasoningTokens: 0, cachedInputTokens: 0 },
};

function gatewayLikeModel() {
  let call = 0;
  const model = new MockLanguageModelV3({
    doStream: async () => {
      call += 1;
      const chunks =
        call === 1
          ? [
              { type: "stream-start", warnings: [] },
              { type: "tool-call", toolCallId: "c1", toolName: "studio.services", input: "{}" },
              legacyFinish,
            ]
          : [
              { type: "stream-start", warnings: [] },
              { type: "text-start", id: "t" },
              { type: "text-delta", id: "t", delta: "Four service areas." },
              { type: "text-end", id: "t" },
              { ...legacyFinish, finishReason: "stop" },
            ];
      return { stream: simulateReadableStream({ chunks: chunks as never }) };
    },
  });
  return { model, calls: () => call };
}

const tools = {
  "studio.services": tool({
    inputSchema: jsonSchema({ type: "object", properties: {} }),
    execute: async () => ({ categories: ["design"] }),
  }),
};

async function run(wrap: boolean) {
  const { model, calls } = gatewayLikeModel();
  const result = streamText({
    model: wrap ? wrapLanguageModel({ model, middleware: gatewayFinishCompatMiddleware }) : model,
    tools,
    prompt: "What services?",
    stopWhen: stepCountIs(2),
  });
  return { text: await result.text, finishReason: await result.finishReason, calls: calls() };
}

describe("gateway finish compat", () => {
  it("reproduces the outage without the middleware: the tool call ends the turn", async () => {
    const outcome = await run(false);
    expect(outcome.calls).toBe(1);
    expect(outcome.text).toBe("");
  });

  it("executes the tool and continues once finish data is normalized", async () => {
    const outcome = await run(true);
    expect(outcome.calls).toBe(2);
    expect(outcome.text).toBe("Four service areas.");
    expect(outcome.finishReason).toBe("stop");
  });

  it("normalizes legacy reasons and usage, and leaves the current shape alone", () => {
    expect(normalizeFinishReason("tool-calls")).toEqual({ unified: "tool-calls", raw: "tool-calls" });
    expect(normalizeFinishReason("weird")).toEqual({ unified: "other", raw: "weird" });
    const current = { unified: "stop", raw: "stop" };
    expect(normalizeFinishReason(current)).toBe(current);
    expect(normalizeUsage(legacyFinish.usage)).toEqual({
      inputTokens: { total: 40, noCache: 40, cacheRead: 0, cacheWrite: undefined },
      outputTokens: { total: 11, text: 11, reasoning: 0 },
    });
    const nested = { inputTokens: { total: 1 }, outputTokens: { total: 1 } };
    expect(normalizeUsage(nested)).toBe(nested);
  });
});
