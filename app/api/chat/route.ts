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

    const tools = await getDonnyTools({ enableMcp: true, allowStdio: true });
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
    };

    const result = await streamText(streamParams);

    // Create streaming response with CORS headers
    return result.toTextStreamResponse({
      headers: {
        ...corsHeaders,
        "Cache-Control": "no-store, no-transform, max-age=0",
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
