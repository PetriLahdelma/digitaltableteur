import { NextRequest, NextResponse } from "next/server";
import { convertToModelMessages, streamText } from "ai";
import {
  createGateway,
  GatewayAuthenticationError,
  GatewayInvalidRequestError,
  GatewayModelNotFoundError,
  GatewayRateLimitError,
} from "@ai-sdk/gateway";
import {
  ChatApiError,
  validateMessages,
  buildSystemPrompt,
  resolveGatewayModelId,
  createCorsHeaders,
} from "../chat-shared";
import { getDonnyTools } from "../donny-tools";
import {
  checkPromptInjection,
  sanitizeAiOutput,
  stripSecretsFromResponse,
} from "../../lib/promptGuardrails";
import * as Sentry from "@sentry/nextjs";

// Server-side token limits (don't trust client input)
const MAX_TOKENS = 4000; // Maximum tokens per request
const MAX_OUTPUT_TOKENS = 1500; // Maximum output tokens
const TOKEN_USAGE_WARNING_THRESHOLD = 3000; // Alert when approaching limit

// IncomingUiMessages type - represents UI messages array before conversion
type IncomingUiMessages = Parameters<typeof convertToModelMessages>[0];

const gatewayProvider: ReturnType<typeof createGateway> = createGateway({
  baseURL: process.env.AI_GATEWAY_URL?.trim(),
  apiKey: process.env.AI_GATEWAY_API_KEY?.trim(),
});

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

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");
  const corsHeaders = createCorsHeaders(requestOrigin);

  try {
    const body = await request.json();
    const rawPayload: unknown = body.messages;
    validateMessages(rawPayload);
    const messages = (rawPayload as IncomingUiMessages).map((message) => {
      const content =
        (message as any).content ??
        (Array.isArray((message as any).parts) ? (message as any).parts : []);
      return { ...message, content };
    });

    // Security: Check for prompt injection attempts
    const lastMessage = messages[messages.length - 1];
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

    // Disable MCP/stdio tools in the serverless runtime to avoid spawn/network flakiness
    const tools = await getDonnyTools({ enableMcp: false, allowStdio: false });
    const system = buildSystemPrompt(Object.keys(tools));

    const modelId: string = resolveGatewayModelId();
    const model = gatewayProvider(modelId);

    const streamParams: Parameters<typeof streamText>[0] = {
      model,
      system,
      tools,
      messages: convertToModelMessages(messages),
      temperature: 0.2,
      maxRetries: 2,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      // Note: maxTokens deprecated in AI SDK, use model-specific settings
    };

    const result = await streamText(streamParams);

    // Monitor token usage for cost control
    try {
      const usage = await result.usage;
      const totalTokens = usage.totalTokens || 0;

      // Alert on high token usage
      if (totalTokens > TOKEN_USAGE_WARNING_THRESHOLD) {
        Sentry.captureMessage("High token usage detected", {
          level: "warning",
          tags: {
            feature: "chat",
            model: modelId,
          },
          extra: {
            totalTokens,
            promptTokens: usage.inputTokens,
            completionTokens: usage.outputTokens,
            ipAddress,
            maxTokensLimit: MAX_TOKENS,
          },
        });
      }

      // Alert if approaching maximum
      if (totalTokens > MAX_TOKENS * 0.9) {
        Sentry.captureMessage("Token usage approaching maximum", {
          level: "error",
          tags: {
            feature: "chat",
            model: modelId,
          },
          extra: {
            totalTokens,
            maxTokens: MAX_TOKENS,
            utilizationPercent: (totalTokens / MAX_TOKENS) * 100,
            ipAddress,
          },
        });
      }
    } catch (usageError) {
      console.warn("[chat] Could not retrieve token usage:", usageError);
    }

    const responseHeaders = {
      ...corsHeaders,
      "Cache-Control": "no-store, no-transform, max-age=0",
    };

    // Use toUIMessageStreamResponse for @ai-sdk/react useChat hook
    return result.toUIMessageStreamResponse({ headers: responseHeaders });
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
