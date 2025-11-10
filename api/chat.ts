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

type IncomingUiMessages = Parameters<typeof convertToModelMessages>[0];

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
  corsHeaders?: Record<string, string>,
) => {
  if (!res.headersSent) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    // Ensure CORS headers are included in JSON responses
    if (corsHeaders) {
      Object.entries(corsHeaders).forEach(([key, value]) =>
        res.setHeader(key, value),
      );
    }
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
  // Dynamic CORS configuration following Vercel best practices
  // Reference: https://vercel.com/guides/how-to-enable-cors
  
  const origin = req.headers.origin;
  
  // Define allowed origins based on environment
  const isProduction = process.env.NODE_ENV === "production";
  const allowedOrigins = isProduction
    ? ["https://digitaltableteur.com", "https://www.digitaltableteur.com"]
    : [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
      ];
  
  // Check if origin is from local development network (192.168.x.x or 10.x.x.x)
  const isLocalNetwork =
    !isProduction &&
    origin &&
    (origin.startsWith("http://192.168.") ||
      origin.startsWith("http://10.") ||
      origin.startsWith("http://172.") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1"));
  
  // Determine allowed origin
  let allowedOrigin = "https://digitaltableteur.com"; // Default fallback
  if (origin && (allowedOrigins.includes(origin) || isLocalNetwork)) {
    allowedOrigin = origin;
  }
  
  // Set CORS headers immediately, before any other processing
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept, Origin, X-Requested-With",
  );
  res.setHeader("Access-Control-Allow-Credentials", "false");
  res.setHeader("Access-Control-Max-Age", "86400");
  res.setHeader("Vary", "Origin");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Create corsHeaders object for sendJson calls
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Accept, Origin, X-Requested-With",
    "Access-Control-Allow-Credentials": "false",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" }, corsHeaders);
    return;
  }

  try {
    const body = await readJsonBody(req);
    const rawPayload: unknown = body.messages;
    validateMessages(rawPayload);
    // After validation, we know rawPayload is an array, safe to cast to IncomingUiMessages
    const messages = rawPayload as IncomingUiMessages;

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

    // Set streaming headers including CORS headers for cross-origin streaming
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "false");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Content-Type", "text/event-stream");

    await result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    const normalized = normalizeError(error);
    if (!res.headersSent) {
      sendJson(
        res,
        normalized.status,
        { error: normalized.message },
        corsHeaders,
      );
      return;
    }
    res.end();
  }
}

export const config = {
  runtime: "nodejs",
};
