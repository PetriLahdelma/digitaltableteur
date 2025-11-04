import { convertToCoreMessages, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import {
  ChatApiError,
  resolveModelId,
  systemPrompt,
  createCorsHeaders,
  validateMessages,
} from "../chat-shared.ts"; // shared chat utilities

type ChatRequestBody = { messages?: unknown };

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
    const messagesUnknown = body.messages;
    const runValidate: (m: unknown) => asserts m is any[] = validateMessages;
    runValidate(messagesUnknown);
    const messages = messagesUnknown as any[];

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
  } catch (caught: unknown) {
    const error = caught;
    if (error instanceof ChatApiError) {
      const typed = error as ChatApiError;
      return jsonResponse(typed.status, headers, { error: typed.message });
    }
    if (error instanceof Error) {
      console.error("Chat route unexpected error", error.message, error.stack);
    } else {
      console.error("Chat route non-error throw", error);
    }
    return jsonResponse(500, headers, {
      error: "Donny ran into a snag. Please try again soon.",
    });
  }
};
