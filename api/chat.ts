import type { IncomingMessage, ServerResponse } from "http";
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
  createCorsHeaders,
  validateMessages,
  buildSystemPrompt,
  resolveGatewayModelId,
} from "./chat-shared";
import { getDonnyTools } from "./donny-tools";

type VercelRequest = IncomingMessage & {
  method?: string;
  headers: IncomingMessage["headers"] & { origin?: string };
  body?: unknown;
};

type VercelResponse = ServerResponse & {
  setHeader(name: string, value: number | string | readonly string[]): void;
};

type ChatRequestBody = {
  messages?: unknown;
};

const gatewayProvider: ReturnType<typeof createGateway> = createGateway({
  baseURL: process.env.AI_GATEWAY_URL?.trim(),
  apiKey: process.env.AI_GATEWAY_API_KEY?.trim(),
});

const readJsonBody = async (req: VercelRequest): Promise<ChatRequestBody> => {
  if (req.body !== undefined) {
    if (typeof req.body === "string") {
      try {
        return JSON.parse(req.body) as ChatRequestBody;
      } catch {
        throw new ChatApiError(400, "Invalid JSON payload");
      }
    }
    if (Buffer.isBuffer(req.body)) {
      try {
        return JSON.parse(req.body.toString("utf8")) as ChatRequestBody;
      } catch {
        throw new ChatApiError(400, "Invalid JSON payload");
      }
    }
    if (typeof req.body === "object" && req.body !== null) {
      return req.body as ChatRequestBody;
    }
  }

  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(
      typeof chunk === "string"
        ? Buffer.from(chunk, "utf8")
        : Buffer.from(chunk),
    );
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(
      Buffer.concat(chunks).toString("utf8"),
    ) as ChatRequestBody;
  } catch {
    throw new ChatApiError(400, "Invalid JSON payload");
  }
};

const sendJson = (
  res: VercelResponse,
  status: number,
  payload: Record<string, unknown>,
) => {
  if (!res.headersSent) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
  }
  res.end(JSON.stringify(payload));
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
    console.error("Chat handler unexpected error:", caught);
    return new ChatApiError(
      500,
      "Donny ran into a snag. Please try again soon.",
    );
  }
  console.error("Chat handler non-error throw:", caught);
  return new ChatApiError(500, "Unknown error");
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsHeaders = createCorsHeaders(req.headers?.origin || null);
  Object.entries(corsHeaders).forEach(([key, value]) =>
    res.setHeader(key, value),
  );

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const payload: unknown = body.messages;
    validateMessages(payload);
    const messages: unknown[] = payload as unknown[];

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

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Content-Type", "text/event-stream");

    await result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    const normalized = normalizeError(error);
    if (!res.headersSent) {
      sendJson(res, normalized.status, { error: normalized.message });
      return;
    }
    res.end();
  }
}

export const config = {
  runtime: "nodejs",
};
