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

const privateNetworkPattern =
  /^(19[2]\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))(\.\d{1,3}){2}$/;

const isDevOrigin = (origin: string | null | undefined) => {
  if (!origin) return false;

  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".local")
    ) {
      return true;
    }
    if (privateNetworkPattern.test(hostname)) {
      return true;
    }
  } catch (error) {
    console.warn("Failed to parse origin", origin, error);
  }
  return false;
};

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

const baseSystemPrompt = [
  "You are Donny, Digitaltableteur's sales & creative assistant. Be accurate, concise, and grounded in the provided context.",
  "Context:",
  buildContextSummary(),
].join("\n\n");

export const buildSystemPrompt = (toolNames: string[]) => {
  if (!toolNames.length) return baseSystemPrompt;
  const toolInstruction = [
    "You can call specialized tools when you need factual answers or curated data.",
    `Available tools: ${toolNames.join(", ")}.`,
    "Prefer tool outputs over guessing. Summarize what you learned in plain language and cite the relevant capability.",
  ].join(" ");
  return `${baseSystemPrompt}\n\n${toolInstruction}`;
};

export const resolveModelId = () => {
  const env = process.env.OPENAI_MODEL?.trim();
  return env || "gpt-4o-mini";
};

export const resolveGatewayModelId = () => {
  const gatewayModel = process.env.AI_GATEWAY_MODEL?.trim();
  if (gatewayModel) return gatewayModel;
  const openAiModel = process.env.OPENAI_MODEL?.trim();
  if (!openAiModel) return "openai/gpt-4o-mini";
  return openAiModel.includes("/") ? openAiModel : `openai/${openAiModel}`;
};

export const createCorsHeaders = (origin: string | null | undefined) => {
  const chosen =
    origin && (allowedOrigins.includes(origin) || isDevOrigin(origin))
      ? origin
      : allowedOrigins[0];
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
