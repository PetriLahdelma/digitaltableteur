import { convertToCoreMessages, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  allowedOrigins,
  ChatApiError,
  resolveModelId,
  systemPrompt,
} from "../chat";

type ChatRequestBody = {
  messages?: unknown;
};

const resolveOrigin = (origin: string | null) => {
  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }
  return allowedOrigins[0];
};

const createCorsHeaders = (origin: string | null) => {
  const resolved = resolveOrigin(origin);
  return {
    "Access-Control-Allow-Origin": resolved,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  } satisfies Record<string, string>;
};

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
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new ChatApiError(500, "Missing OpenAI API key");
    }

    const body = await readRequestBody(request);
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

    return result.toUIMessageStreamResponse({
      headers,
    });
  } catch (error) {
    const status = error instanceof ChatApiError ? error.status : 500;
    const message =
      error instanceof ChatApiError
        ? error.message
        : "Donny ran into a snag. Please try again soon.";

    return jsonResponse(status, headers, { error: message });
  }
};
