import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type ToolSet,
} from "ai";
import type { ChatModelBackend } from "./chat-model";
import { describeChatBackend, getChatLanguageModel } from "./chat-model";

type StreamTextParams = {
  system: string;
  tools: ToolSet;
  messages: Awaited<ReturnType<typeof import("ai").convertToModelMessages>>;
  stopWhen: Parameters<typeof streamText>[0]["stopWhen"];
  temperature: number;
  maxOutputTokens: number;
};

const STREAM_META_TYPES = new Set([
  "start",
  "start-step",
  "finish-step",
  "finish",
]);

export function isRetryableChatStreamError(errorText: unknown): boolean {
  if (typeof errorText !== "string") return false;
  const normalized = errorText.toLowerCase();
  return /rate.?limit|429|too many requests|free tier|insufficient_quota|exceeded your current quota|quota/.test(
    normalized,
  );
}

function isSubstantiveStreamChunk(chunk: { type?: string }): boolean {
  if (!chunk.type || STREAM_META_TYPES.has(chunk.type)) return false;
  if (chunk.type === "error") return false;
  return true;
}

function readStreamErrorText(chunk: {
  type?: string;
  errorText?: unknown;
}): unknown {
  if (chunk.type !== "error") return undefined;
  return chunk.errorText;
}

async function pumpStreamWithFallback(
  uiStream: AsyncIterable<{ type?: string; errorText?: unknown }>,
  writer: { write: (part: never) => void },
  options: { canRetry: boolean },
): Promise<"complete" | "retry"> {
  let hasSubstantiveContent = false;
  const pendingMeta: Array<{ type?: string; errorText?: unknown }> = [];

  const flushPendingMeta = () => {
    for (const chunk of pendingMeta) {
      writer.write(chunk as never);
    }
    pendingMeta.length = 0;
  };

  for await (const chunk of uiStream) {
    if (chunk.type === "error") {
      const errorText = readStreamErrorText(chunk);
      if (
        !hasSubstantiveContent &&
        options.canRetry &&
        isRetryableChatStreamError(errorText)
      ) {
        pendingMeta.length = 0;
        return "retry";
      }
      flushPendingMeta();
      writer.write(chunk as never);
      return "complete";
    }

    if (isSubstantiveStreamChunk(chunk)) {
      hasSubstantiveContent = true;
      flushPendingMeta();
      writer.write(chunk as never);
      continue;
    }

    pendingMeta.push(chunk);
  }

  flushPendingMeta();
  return "complete";
}

export function createChatStreamResponse(options: {
  backends: ChatModelBackend[];
  buildParams: (backend: ChatModelBackend) => Promise<StreamTextParams>;
  headers: Record<string, string>;
  onUsage?: (
    result: Awaited<ReturnType<typeof streamText>>,
    context: { modelId: string },
  ) => void;
}): Response {
  const { backends, buildParams, headers, onUsage } = options;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      for (let index = 0; index < backends.length; index += 1) {
        const backend = backends[index]!;
        const canRetry = index < backends.length - 1;
        const params = await buildParams(backend);
        const result = streamText({
          ...params,
          model: getChatLanguageModel(backend),
          maxRetries: 0,
        });

        onUsage?.(result, { modelId: describeChatBackend(backend) });

        const outcome = await pumpStreamWithFallback(
          result.toUIMessageStream(),
          writer,
          { canRetry },
        );

        if (outcome === "retry") {
          console.warn(
            `[chat] ${backend} rate limited in stream — trying ${backends[index + 1]}`,
          );
          continue;
        }

        return;
      }
    },
  });

  return createUIMessageStreamResponse({
    stream,
    headers,
  });
}

export const CHAT_HISTORY_MESSAGE_LIMIT = 14;

export function trimChatHistory<T extends { role?: string }>(
  messages: T[],
  limit = CHAT_HISTORY_MESSAGE_LIMIT,
): T[] {
  if (messages.length <= limit) return messages;
  return messages.slice(-limit);
}
