import type { IncomingMessage, ServerResponse } from "http";
import { convertToCoreMessages, streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";
import { digitaltableteurContext } from "./donny-context";

const systemPrompt = [
  "You are Donny, Digitaltableteur's sales & creative assistant. Be accurate, concise, and grounded in the provided context.",
  "Context about Digitaltableteur:",
  digitaltableteurContext.trim(),
].join("\n\n");

type RequestBody = {
  id?: string;
  messages?: unknown;
  data?: unknown;
  [key: string]: unknown;
};

const allowedOrigins = [
  "https://digitaltableteur.com",
  "https://www.digitaltableteur.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

const resolveOrigin = (origin: string | undefined) => {
  if (!origin) return allowedOrigins[0];
  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
};

const modelId =
  process.env.AI_GATEWAY_MODEL?.trim() || "openai/gpt-4o-mini-2024-07-18";

async function parseRequestBody(req: IncomingMessage): Promise<RequestBody> {
  if ((req as { body?: unknown }).body !== undefined) {
    const existingBody = (req as { body?: unknown }).body;
    if (typeof existingBody === "string") {
      try {
        return JSON.parse(existingBody) as RequestBody;
      } catch {
        throw new Error("Invalid JSON payload");
      }
    }
    return (existingBody ?? {}) as RequestBody;
  }

  const chunks: Uint8Array[] = [];

  for await (const chunk of req) {
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk),
    );
  }

  if (!chunks.length) return {};

  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw) as RequestBody;
  } catch {
    throw new Error("Invalid JSON payload");
  }
}

export default async function handler(
  req: IncomingMessage & { method?: string; headers?: Record<string, string> },
  res: ServerResponse,
) {
  const origin = resolveOrigin(req.headers?.origin);
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  let requestBody: RequestBody;
  try {
    requestBody = await parseRequestBody(req);
  } catch (error) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Invalid request body",
      }),
    );
    return;
  }

  const rawMessages = requestBody.messages;
  if (!Array.isArray(rawMessages)) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "messages must be an array" }));
    return;
  }

  try {
    const result = await streamText({
      model: gateway(modelId),
      system: systemPrompt,
      messages: convertToCoreMessages(rawMessages),
      maxRetries: 1,
      temperature: 0.3,
    });

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Transfer-Encoding", "chunked");

    result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("AI Gateway chat error", error);
    const message =
      error instanceof Error ? error.message : "Unknown server error occurred.";
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
    }
    res.end(
      JSON.stringify({
        error: "Donny ran into a snag. Please try again soon.",
        details: message,
      }),
    );
  }
}
