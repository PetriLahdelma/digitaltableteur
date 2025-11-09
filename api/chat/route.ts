import { convertToCoreMessages, streamText } from "ai";
import {
  createGateway,
  GatewayAuthenticationError,
  GatewayInvalidRequestError,
  GatewayModelNotFoundError,
  GatewayRateLimitError,
} from "@ai-sdk/gateway";
import {
  ChatApiError,
  resolveGatewayModelId,
  buildSystemPrompt,
  createCorsHeaders,
  validateMessages,
} from "../chat-shared"; // shared chat utilities
import { getDonnyTools } from "../donny-tools";

type ChatRequestBody = { messages?: unknown };

const gatewayProvider = createGateway({
  baseURL: process.env.AI_GATEWAY_URL?.trim(),
  apiKey: process.env.AI_GATEWAY_API_KEY?.trim(),
});

const readRequestBody = async (request: Request): Promise<ChatRequestBody> => {
  try {
    return (await request.json()) as ChatRequestBody;
  } catch {
    throw new ChatApiError(400, "Invalid JSON payload");
  }
};

const jsonResponse = (
  status: number,
  headers: Record<string, string>,
  payload: Record<string, unknown>,
) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });

export const OPTIONS = async (request: Request) => {
  const headers = createCorsHeaders(request.headers.get("origin"));
  return new Response(null, {
    status: 204,
    headers,
  });
};

export const POST = async (request: Request) => {
  const headers = createCorsHeaders(request.headers.get("origin"));

  try {
    const body = await readRequestBody(request);
    const messagesUnknown = body.messages;
    const runValidate: (m: unknown) => asserts m is any[] = validateMessages;
    runValidate(messagesUnknown);
    const messages = messagesUnknown as any[];

    const tools = await getDonnyTools({
      enableMcp: true,
      allowStdio: false,
    });
    const system = buildSystemPrompt(Object.keys(tools));

    const result = await streamText({
      model: gatewayProvider(resolveGatewayModelId()),
      system,
      tools,
      messages: convertToCoreMessages(messages),
      temperature: 0.2,
      maxRetries: 2,
    });

    return result.toUIMessageStreamResponse({
      headers,
    });
  } catch (error) {
    const normalized = normalizeError(error);
    return jsonResponse(normalized.status, headers, {
      error: normalized.message,
    });
  }
};

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
    console.error("Chat route unexpected error", caught.message, caught.stack);
    return new ChatApiError(
      500,
      "Donny ran into a snag. Please try again soon.",
    );
  }
  console.error("Chat route non-error throw", caught);
  return new ChatApiError(500, "Unknown error");
};
