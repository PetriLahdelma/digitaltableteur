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
import { checkPromptInjection, sanitizeAiOutput, stripSecretsFromResponse } from "../../lib/promptGuardrails";

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
  console.log("[chat] ===== POST HANDLER CALLED =====");
  console.log(
    "[chat] AI_GATEWAY_URL:",
    process.env.AI_GATEWAY_URL ? "SET" : "NOT SET",
  );
  console.log(
    "[chat] AI_GATEWAY_API_KEY:",
    process.env.AI_GATEWAY_API_KEY
      ? "SET (length: " + process.env.AI_GATEWAY_API_KEY?.length + ")"
      : "NOT SET",
  );
  const requestOrigin = request.headers.get("origin");
  const corsHeaders = createCorsHeaders(requestOrigin);

  try {
    const body = await request.json();
    console.log(
      "[chat] Received request body:",
      JSON.stringify(body).slice(0, 200),
    );
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
    const lastContent = typeof lastMessage?.content === "string" 
      ? lastMessage.content 
      : Array.isArray(lastMessage?.content) 
        ? lastMessage.content.map(p => typeof p === "string" ? p : p.text || "").join(" ")
        : "";
    
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    
    const guardrailCheck = checkPromptInjection(lastContent, ipAddress);
    
    if (guardrailCheck.isBlocked) {
      console.warn("[chat] Prompt injection blocked:", guardrailCheck.reason);
      return NextResponse.json(
        { error: guardrailCheck.reason || "Your message could not be processed." },
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (guardrailCheck.suspicionLevel !== "none") {
      console.warn("[chat] Suspicious prompt detected (level: ", guardrailCheck.suspicionLevel, ")");
    }

    // Disable MCP/stdio tools in the serverless runtime to avoid spawn/network flakiness
    const tools = await getDonnyTools({ enableMcp: false, allowStdio: false });
    const system = buildSystemPrompt(Object.keys(tools));

    const modelId: string = resolveGatewayModelId();
    const model = gatewayProvider(modelId);

    console.log("[chat] Model ID:", modelId);
    console.log("[chat] System prompt length:", system.length);
    console.log("[chat] Tools count:", Object.keys(tools).length);
    console.log("[chat] Messages count:", messages.length);

    const streamParams: Parameters<typeof streamText>[0] = {
      model,
      system,
      tools,
      messages: convertToModelMessages(messages),
      temperature: 0.2,
      maxRetries: 2,
    };

    console.log("[chat] About to call streamText with model:", modelId);
    const result = await streamText(streamParams);
    console.log("[chat] streamText completed");

    console.log("[chat] Stream created, result type:", typeof result);
    console.log(
      "[chat] Has toAIStreamResponse:",
      typeof (result as any).toAIStreamResponse === "function",
    );

    // Log if there's a textStream to consume
    console.log("[chat] Has textStream:", !!result.textStream);

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
