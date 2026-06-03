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
  validateMessages,
  buildSystemPrompt,
  createCorsHeaders,
} from "../chat-shared";
import { getDonnyTools } from "../donny-tools";
import { checkPromptInjection } from "../../lib/promptGuardrails";
import {
  resolveChatBackendOrder,
  type ChatModelBackend,
} from "../../lib/chat-model";
import {
  adaptToolRecordKeys,
  toOpenAiToolName,
} from "@/nextjs-app/shared/lib/donny-tool-names";
import {
  createChatStreamResponse,
  trimChatHistory,
} from "../../lib/chat-stream-fallback";
import { selectDonnyToolsForChat } from "../../lib/chat-tool-selection";

const MAX_TOKENS = 4000;
const MAX_OUTPUT_TOKENS = 900;
const TOKEN_USAGE_WARNING_THRESHOLD = 3000;
const CHAT_MAX_STEPS = 2;

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
  context: { modelId: string; ipAddress: string },
): void {
  void (async () => {
    try {
      const usage = await result.usage;
      const totalTokens = usage.totalTokens || 0;
      if (totalTokens > TOKEN_USAGE_WARNING_THRESHOLD) {
        Sentry.captureMessage("High token usage detected", {
          level: "warning",
          tags: { feature: "chat", model: context.modelId },
          extra: {
            totalTokens,
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            ipAddress: context.ipAddress,
            maxTokensLimit: MAX_TOKENS,
          },
        });
      }
      if (totalTokens > MAX_TOKENS * 0.9) {
        Sentry.captureMessage("Token usage approaching maximum", {
          level: "error",
          tags: { feature: "chat", model: context.modelId },
          extra: {
            totalTokens,
            maxTokens: MAX_TOKENS,
            utilizationPercent: (totalTokens / MAX_TOKENS) * 100,
            ipAddress: context.ipAddress,
          },
        });
      }
    } catch (usageError) {
      console.warn("[chat] Could not retrieve token usage:", usageError);
    }
  })();
}

async function buildChatStreamParams(
  messages: IncomingUiMessages,
  backend: ChatModelBackend,
  lastUserMessage: string,
) {
  const rawTools = await getDonnyTools({ enableMcp: false, allowStdio: false });
  const scopedTools = selectDonnyToolsForChat(rawTools, lastUserMessage);
  const tools =
    backend === "openai"
      ? adaptToolRecordKeys(scopedTools, toOpenAiToolName)
      : scopedTools;
  const toolNames = Object.keys(tools);
  const system = buildSystemPrompt(toolNames, {
    useOpenAiToolNames: backend === "openai",
  });
  const trimmedMessages = trimChatHistory(messages);
  const modelMessages = await convertToModelMessages(trimmedMessages);
  return {
    system,
    tools: tools as ToolSet,
    messages: modelMessages,
    stopWhen: stepCountIs(CHAT_MAX_STEPS),
    temperature: 0.2,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
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
    const body = await request.json();
    const messages = normalizeIncomingMessages(body.messages);

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

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const guardrailCheck = checkPromptInjection(lastContent, ipAddress);

    if (guardrailCheck.isBlocked) {
      console.warn("[chat] Prompt injection blocked:", guardrailCheck.reason);
      return NextResponse.json(
        {
          error:
            guardrailCheck.reason || "Your message could not be processed.",
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
      buildParams: (backend) =>
        buildChatStreamParams(messages, backend, lastContent),
      headers: {
        ...corsHeaders,
        "Cache-Control": "no-store, no-transform, max-age=0",
        "X-Chat-Model-Backend": primaryBackend,
      },
      onUsage: (result, context) => {
        trackChatUsage(result, { ...context, ipAddress });
      },
    });
  } catch (error) {
    const normalized = normalizeError(error);
    return NextResponse.json(
      { error: normalized.message },
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
