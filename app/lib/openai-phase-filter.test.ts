import { streamText, wrapLanguageModel } from "ai";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import { describe, expect, it } from "vitest";

import { openAiPhaseFilterMiddleware } from "./openai-phase-filter";

const finish = {
  type: "finish",
  finishReason: { unified: "stop", raw: "stop" },
  usage: {
    inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: undefined },
    outputTokens: { total: 1, text: 1, reasoning: 0 },
  },
};

const text = (id: string, phase: string | undefined, value: string) => {
  const meta = phase ? { providerMetadata: { openai: { phase } } } : {};
  return [
    { type: "text-start", id, ...meta },
    { type: "text-delta", id, delta: value },
    { type: "text-end", id, ...meta },
  ];
};

async function replyText(chunks: unknown[]) {
  const model = wrapLanguageModel({
    model: new MockLanguageModelV3({
      doStream: async () => ({
        stream: simulateReadableStream({
          chunks: [{ type: "stream-start", warnings: [] }, ...chunks, finish] as never,
        }),
      }),
    }),
    middleware: openAiPhaseFilterMiddleware,
  });
  const result = streamText({ model, prompt: "hi" });
  return result.text;
}

describe("openAiPhaseFilterMiddleware", () => {
  it("drops commentary when a final answer follows (gpt-6-luna duplicate)", async () => {
    const reply = await replyText([
      ...text("c", "commentary", "Are you a client or a recruiter?"),
      ...text("f", "final_answer", "Are you hiring for a project or a role?"),
    ]);
    expect(reply).toBe("Are you hiring for a project or a role?");
  });

  it("keeps commentary when it is the only text in the step", async () => {
    const reply = await replyText(text("c", "commentary", "Only answer."));
    expect(reply).toBe("Only answer.");
  });

  it("drops a preamble that precedes a tool call", async () => {
    const reply = await replyText([
      ...text("c", "commentary", "Let me look that up."),
      { type: "tool-call", toolCallId: "t1", toolName: "studio_services", input: "{}" },
    ]);
    expect(reply).toBe("");
  });

  it("passes text without a phase through unchanged", async () => {
    const reply = await replyText(text("x", undefined, "Plain gpt-4o-mini reply."));
    expect(reply).toBe("Plain gpt-4o-mini reply.");
  });
});
