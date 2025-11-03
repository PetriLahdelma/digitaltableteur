import type { IncomingMessage, ServerResponse } from "http";
import { convertToCoreMessages, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { digitaltableteurContext } from "./donny-context.js";

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

class ChatApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ChatApiError";
  }
}

const allowedOrigins = [
  "https://digitaltableteur.com",
  "https://www.digitaltableteur.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5176",
  "http://localhost:3001",
];

const systemPrompt = [
  "You are Donny, Digitaltableteur's sales & creative assistant. Be accurate, concise, and grounded in the provided context.",
  "Context about Digitaltableteur:",
  digitaltableteurContext.trim(),
].join("\n\n");

const resolveModelId = () => {
  const explicitModel = process.env.OPENAI_CHAT_MODEL?.trim();
  if (explicitModel) return explicitModel;

  const gatewayModel = process.env.AI_GATEWAY_MODEL?.trim();
  if (gatewayModel?.startsWith("openai/")) {
    return gatewayModel.slice("openai/".length);
  }

  return gatewayModel || "gpt-4o-mini";
};

const resolveOrigin = (origin: unknown) => {
  if (typeof origin === "string" && allowedOrigins.includes(origin)) {
    return origin;
  }
  return allowedOrigins[0];
};

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
      typeof chunk === "string" ? Buffer.from(chunk, "utf8") : Buffer.from(chunk),
    );
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as ChatRequestBody;
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = resolveOrigin(req.headers?.origin);
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
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
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new ChatApiError(500, "Missing OpenAI API key");
    }

    const body = await readJsonBody(req);
    const messages = body.messages;

    if (!Array.isArray(messages)) {
      throw new ChatApiError(400, "messages must be an array");
    }

    const openai = createOpenAI({ apiKey });
    const modelId = resolveModelId();

    const result = await streamText({
      model: openai(modelId),
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
      temperature: 0.3,
      maxRetries: 1,
    });

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Content-Type", "text/event-stream");

    await result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("OpenAI chat error", error);

    const status =
      error instanceof ChatApiError ? error.status : 500;
    const message =
      error instanceof ChatApiError
        ? error.message
        : "Donny ran into a snag. Please try again soon.";

    if (!res.headersSent) {
      sendJson(res, status, { error: message });
      return;
    }

    res.end();
  }
}

export { allowedOrigins, ChatApiError, resolveModelId, systemPrompt };

export const config = {
  runtime: "nodejs",
};
