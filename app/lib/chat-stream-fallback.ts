import {
  APICallError,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type LanguageModel,
  type ToolSet,
} from "ai";
import type { ChatModelBackend } from "./chat-model";
import { describeChatBackend, getChatLanguageModel } from "./chat-model";

type StreamTextParams = {
  system: string;
  tools: ToolSet;
  messages: Awaited<
    ReturnType<typeof import("ai").convertToModelMessages>
  >;
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
  return (
    /rate.?limit|429|too many requests|free tier|insufficient_quota|exceeded your current quota|quota/.test(
      normalized,
    )
  );
}

/**
 * Classify the provider's own error, not the stream text. toUIMessageStream()
 * masks every error as "An error occurred." by default, so a text-only check
 * never saw "insufficient_quota" and an exhausted OpenAI balance never fell
 * back to the Gateway (2026-09-25 outage).
 */
export function isRetryableProviderError(error: unknown): boolean {
  if (APICallError.isInstance(error)) {
    if (error.statusCode === 429 || error.statusCode === 402) return true;
    if (isRetryableChatStreamError(error.responseBody)) return true;
  }
  if (error instanceof Error) {
    return isRetryableChatStreamError(error.message);
  }
  return false;
}

function isSubstantiveStreamChunk(chunk: { type?: string }): boolean {
  if (!chunk.type || STREAM_META_TYPES.has(chunk.type)) return false;
  if (chunk.type === "error") return false;
  return true;
}

function readStreamErrorText(chunk: { type?: string; errorText?: unknown }): unknown {
  if (chunk.type !== "error") return undefined;
  return chunk.errorText;
}

async function pumpStreamWithFallback(
  uiStream: AsyncIterable<{ type?: string; errorText?: unknown }>,
  writer: { write: (part: never) => void },
  options: { canRetry: boolean; lastProviderError: () => unknown },
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
        (isRetryableChatStreamError(errorText) ||
          isRetryableProviderError(options.lastProviderError()))
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
  /** Injectable for tests; defaults to the configured provider model. */
  getModel?: (backend: ChatModelBackend) => LanguageModel;
  onUsage?: (
    result: Awaited<ReturnType<typeof streamText>>,
    context: { modelId: string },
  ) => void;
}): Response {
  const { backends, buildParams, headers, onUsage } = options;
  const getModel = options.getModel ?? getChatLanguageModel;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      for (let index = 0; index < backends.length; index += 1) {
        const backend = backends[index]!;
        const canRetry = index < backends.length - 1;
        const params = await buildParams(backend);
        const result = streamText({
          ...params,
          model: getModel(backend),
          maxRetries: 0,
        });

        onUsage?.(result, { modelId: describeChatBackend(backend) });

        let providerError: unknown;
        const outcome = await pumpStreamWithFallback(
          result.toUIMessageStream({
            // Keep the raw error for classification; the client still only
            // sees a generic message (no provider or billing detail leaks).
            onError: (error) => {
              providerError = error;
              return "An error occurred.";
            },
          }),
          writer,
          { canRetry, lastProviderError: () => providerError },
        );

        if (outcome === "retry") {
          console.warn(
            `[chat] ${backend} unavailable in stream (rate limit or quota), trying ${backends[index + 1]}`,
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
