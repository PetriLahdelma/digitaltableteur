import { NextRequest, NextResponse } from "next/server";
import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type ToolSet,
} from "ai";
import * as Sentry from "@sentry/nextjs";
import {
  GatewayAuthenticationError,
  GatewayInvalidRequestError,
  GatewayModelNotFoundError,
  GatewayRateLimitError,
} from "@ai-sdk/gateway";
import {
  ChatApiError,
  readChatBody,
  validateMessages,
  buildSystemPrompt,
  createCorsHeaders,
} from "../chat-shared";
import { getDonnyTools } from "../donny-tools";
import { checkPromptInjection } from "../../lib/promptGuardrails";
import {
  resolveChatBackendOrder,
  getChatProviderOptions,
  textOnlyFinalStep,
} from "../../lib/chat-model";
import {
  adaptToolRecordKeys,
  toOpenAiToolName,
} from "@/nextjs-app/shared/lib/donny-tool-names";
import {
  createChatStreamResponse,
  trimChatHistory,
} from "../../lib/chat-stream-fallback";
import { recentUserTexts, selectDonnyToolsForChat } from "../../lib/chat-tool-selection";
import { checkRateLimit } from "../../lib/rate-limit";
import { logChatFailure } from "../../lib/chat-errors";
import {
  createChatErrorRef,
  type ChatErrorCode,
} from "@/nextjs-app/shared/lib/chat-error-codes";
import { getClientIp } from "../../lib/security-logger";

const MAX_OUTPUT_TOKENS = 900;
/**
 * Alert thresholds, calibrated 2026-10-14. One step re-sends the system
 * prompt and tool schemas (~3.1k input tokens, ~2.9k of it cached), and the
 * step after a tool call adds the tool result, so ~6.5k input is a normal
 * tool turn. The old 3k/3.6k "max" thresholds fired on nearly every tool
 * turn at level "error". Now only real problems alert: a reply nearing the
 * output cap (risk of a cut-off answer), or one step's input far above
 * normal (chat-history trimming not working).
 */
const OUTPUT_TOKENS_ALERT = Math.floor(MAX_OUTPUT_TOKENS * 0.9);
const STEP_INPUT_TOKENS_ALERT = 16_000;
const CHAT_MAX_STEPS = 2;
const CHAT_RATE_LIMIT_WINDOW_MS = 60_000;
const CHAT_RATE_LIMIT_MAX = 12;

type IncomingUiMessages = Parameters<typeof convertToModelMessages>[0];

const normalizeError = (caught: unknown): ChatApiError => {
  if (caught instanceof ChatApiError) return caught;
  if (GatewayAuthenticationError.isInstance(caught)) {
    return new ChatApiError(
      502,
      "AI Gateway authentication failed. Confirm the API key or OIDC token.",
    );
  }
  if (GatewayRateLimitError.isInstance(caught)) {
    return new ChatApiError(
      429,
      "The AI Gateway rate limit has been reached. Please retry shortly.",
    );
  }
  if (
    GatewayInvalidRequestError.isInstance(caught) ||
    GatewayModelNotFoundError.isInstance(caught)
  ) {
    return new ChatApiError(
      400,
      "The chat request was rejected by the AI Gateway configuration.",
    );
  }
  if (caught instanceof Error) {
    console.error("Chat handler unexpected error:", caught);
    return new ChatApiError(
      500,
      "Donny ran into a snag. Please try again soon.",
    );
  }
  console.error("Chat handler non-error throw:", caught);
  return new ChatApiError(500, "Unknown error");
};

function trackChatUsage(
  result: Awaited<ReturnType<typeof streamText>>,
  context: { modelId: string },
): void {
  void (async () => {
    try {
      // usage = the final step; that is where a long reply gets cut off and
      // where the largest prompt (history + tool result) is sent.
      const usage = await result.usage;
      const inputCount = usage.inputTokens ?? 0;
      const outputCount = usage.outputTokens ?? 0;
      // Field names avoid "token": Sentry's scrubber nulls those keys.
      const extra = {
        inputCount,
        cachedInputCount: usage.inputTokenDetails?.cacheReadTokens ?? null,
        outputCount,
        outputCap: MAX_OUTPUT_TOKENS,
      };
      if (outputCount >= OUTPUT_TOKENS_ALERT) {
        Sentry.captureMessage("Chat reply near the output cap", {
          level: "warning",
          tags: { feature: "chat", model: context.modelId },
          extra,
        });
      }
      if (inputCount > STEP_INPUT_TOKENS_ALERT) {
        Sentry.captureMessage("Chat step input far above normal", {
          level: "warning",
          tags: { feature: "chat", model: context.modelId },
          extra: { ...extra, inputAlert: STEP_INPUT_TOKENS_ALERT },
        });
      }
    } catch (usageError) {
      console.warn("[chat] Could not retrieve token usage:", usageError);
    }
  })();
}

async function buildChatStreamParams(
  messages: IncomingUiMessages,
  lastUserMessage: string,
) {
  const rawTools = await getDonnyTools({ enableMcp: false, allowStdio: false });
  const scopedTools = selectDonnyToolsForChat(
    rawTools,
    lastUserMessage,
    recentUserTexts(messages),
  );
  // Both backends get underscore names: OpenAI (direct or via the Gateway)
  // rejects "studio.x" with a pattern error, which broke the Gateway fallback.
  const tools = adaptToolRecordKeys(scopedTools, toOpenAiToolName);
  const toolNames = Object.keys(tools);
  const system = buildSystemPrompt(toolNames, { useOpenAiToolNames: true });
  const trimmedMessages = trimChatHistory(messages);
  const modelMessages = await convertToModelMessages(trimmedMessages);
  return {
    system,
    tools: tools as ToolSet,
    messages: modelMessages,
    stopWhen: stepCountIs(CHAT_MAX_STEPS),
    temperature: 0.2,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: getChatProviderOptions(),
    prepareStep: textOnlyFinalStep(CHAT_MAX_STEPS),
  };
}

function normalizeIncomingMessages(rawPayload: unknown): IncomingUiMessages {
  validateMessages(rawPayload);
  return (rawPayload as IncomingUiMessages).map((message) => {
    const record = message as {
      content?: unknown;
      parts?: unknown;
    };
    const content =
      record.content ?? (Array.isArray(record.parts) ? record.parts : []);
    return { ...message, content };
  });
}

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");
  const corsHeaders = createCorsHeaders(requestOrigin);

  try {
    const body = (await readChatBody(request)) as { messages?: unknown } | null;
    const messages = normalizeIncomingMessages(body?.messages);

    const lastMessage = messages[messages.length - 1] as {
      content?: string | Array<string | { text?: string }>;
    };
    const lastContent =
      typeof lastMessage?.content === "string"
        ? lastMessage.content
        : Array.isArray(lastMessage?.content)
          ? lastMessage.content
              .map((p) => (typeof p === "string" ? p : p.text || ""))
              .join(" ")
          : "";

    const ipAddress = getClientIp(request);

    const guardrailCheck = checkPromptInjection(lastContent, ipAddress);

    const rateLimitResult = await checkRateLimit({
      scope: "chat",
      key: ipAddress,
      windowMs: CHAT_RATE_LIMIT_WINDOW_MS,
      max: CHAT_RATE_LIMIT_MAX,
      failureMode: "block",
    });

    if (rateLimitResult.limited) {
      return NextResponse.json(
        {
          error: "Too many chat requests. Please retry shortly.",
          code: "visitor_rate_limited" satisfies ChatErrorCode,
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": String(rateLimitResult.retryAfterSeconds),
          },
        },
      );
    }

    if (guardrailCheck.isBlocked) {
      console.warn("[chat] Prompt injection blocked:", guardrailCheck.reason);
      return NextResponse.json(
        {
          error:
            guardrailCheck.reason || "Your message could not be processed.",
          code: "message_blocked" satisfies ChatErrorCode,
        },
        { status: 400, headers: corsHeaders },
      );
    }

    if (guardrailCheck.suspicionLevel !== "none") {
      console.warn(
        "[chat] Suspicious prompt detected (level: ",
        guardrailCheck.suspicionLevel,
        ")",
      );
    }

    const backends = resolveChatBackendOrder();
    const primaryBackend = backends[0] ?? "gateway";

    return createChatStreamResponse({
      backends,
      buildParams: () => buildChatStreamParams(messages, lastContent),
      headers: {
        ...corsHeaders,
        "Cache-Control": "no-store, no-transform, max-age=0",
        "X-Chat-Model-Backend": primaryBackend,
      },
      onUsage: (result, context) => {
        trackChatUsage(result, context);
      },
    });
  } catch (error) {
    const normalized = normalizeError(error);
    const code: ChatErrorCode =
      normalized.status === 429
        ? "ai_busy"
        : normalized.status === 400 || normalized.status === 413
          ? "bad_request"
          : normalized.status >= 500
            ? "ai_unavailable"
            : "unknown";
    const ref = createChatErrorRef();
    logChatFailure({
      ref,
      detail: { code, providerStatus: normalized.status, message: normalized.message },
      level: "error",
      error,
    });
    // The body is visible in devtools: send a neutral text, keep the
    // specific cause (auth, config, provider) in the log under `ref`.
    const publicMessage: Record<ChatErrorCode, string> = {
      ai_unavailable: "The assistant is temporarily unavailable.",
      ai_busy: "The assistant is busy. Please retry shortly.",
      visitor_rate_limited: "Too many chat requests. Please retry shortly.",
      message_blocked: "Your message could not be processed.",
      bad_request: "The chat request could not be processed.",
      unknown: "Something went wrong.",
    };
    return NextResponse.json(
      { error: publicMessage[code], code, ref },
      {
        status: normalized.status,
        headers: corsHeaders,
      },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const corsHeaders = createCorsHeaders(request.headers.get("origin"));
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
