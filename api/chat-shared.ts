import { digitaltableteurContext } from "./donny-context.js";

// Allowed origins single source of truth
export const allowedOrigins = [
  "https://digitaltableteur.com",
  "https://www.digitaltableteur.com",
  "http://localhost:5173",
  "http://localhost:5176",
  "http://localhost:3000",
  "http://localhost:3001",
];

export class ChatApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Defensive build of context summary (legacy string kept as-is)
const buildContextSummary = () => {
  if (typeof digitaltableteurContext === "string") {
    return digitaltableteurContext.slice(0, 3000);
  }
  try {
    return JSON.stringify(digitaltableteurContext).slice(0, 3000);
  } catch {
    return "Digitaltableteur design & technology portfolio.";
  }
};

export const systemPrompt = [
  "You are Donny, Digitaltableteur's sales & creative assistant. Be accurate, concise, and grounded in the provided context.",
  "Context:",
  buildContextSummary(),
].join("\n\n");

export const resolveModelId = () => {
  const env = process.env.OPENAI_MODEL?.trim();
  return env || "gpt-4o-mini";
};

export const createCorsHeaders = (origin: string | null | undefined) => {
  const chosen =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": chosen,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  } satisfies Record<string, string>;
};

export const validateMessages = (
  messages: unknown,
): asserts messages is any[] => {
  if (!Array.isArray(messages)) {
    throw new ChatApiError(400, "messages must be an array");
  }
};
