import { digitaltableteurContext } from "./donny-context.js";

// Allowed origins single source of truth
export const allowedOrigins = [
  "https://digitaltableteur.com",
  "https://www.digitaltableteur.com",
  "http://digitaltableteur.com",
  "http://www.digitaltableteur.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://192.168.1.108:5173",
  "http://localhost:6006",
  "http://192.168.1.108:6006",
];

// Private network IP patterns (RFC 1918):
// - 10.0.0.0/8: 10.x.x.x
// - 172.16.0.0/12: 172.16.x.x - 172.31.x.x
// - 192.168.0.0/16: 192.168.x.x
// Valid octet: 0-255 -> (25[0-5]|2[0-4]\d|[01]?\d\d?)
const octet = "(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)";
const privateNetworkPattern = new RegExp(
  `^(10(\\.${octet}){3}|172\\.(1[6-9]|2[0-9]|3[0-1])(\\.${octet}){2}|192\\.168(\\.${octet}){2})$`,
);

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

export const resolveAllowedOrigin = (
  origin: string | null | undefined,
): string => {
  if (origin && (allowedOrigins.includes(origin) || isDevOrigin(origin))) {
    return origin;
  }
  return allowedOrigins[0];
};

const ACCESS_CONTROL_ALLOW_METHODS = "GET, POST, OPTIONS";
const ACCESS_CONTROL_ALLOW_HEADERS =
  "Content-Type, Authorization, Accept, Origin, X-Requested-With";
const ACCESS_CONTROL_MAX_AGE = "86400";

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
    "You have specialized tools — use them instead of guessing.",
    `Available: ${toolNames.join(", ")}.`,
    "Guidelines:",
    "- ALWAYS use studio.projectShowcase when asked about ANY project, case study, portfolio work, or specific client work. NEVER claim you don't have info about a project without calling this tool first.",
    "- Use studio.navigateTo to take users to pages when they want to see something. It navigates their browser directly.",
    "- Use studio.openHours for availability questions, studio.services for capability questions, studio.contactCard for contact details.",
    "- You can chain tools: e.g., show a project then offer to navigate to it.",
    "- Summarize tool results in plain language. For projectShowcase, highlight what makes each project notable.",
  ].join("\n");
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
  const chosen = resolveAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": chosen,
    "Access-Control-Allow-Methods": ACCESS_CONTROL_ALLOW_METHODS,
    "Access-Control-Allow-Headers": ACCESS_CONTROL_ALLOW_HEADERS,
    "Access-Control-Max-Age": ACCESS_CONTROL_MAX_AGE,
    Vary: "Origin",
  } satisfies Record<string, string>;
};

/**
 * Validates that messages is an array of message objects.
 * Each message must have either content (string/array) or parts (array).
 * Uses Record<string, unknown>[] to remain compatible with downstream casts.
 */
export function validateMessages(
  messages: unknown,
): asserts messages is Record<string, unknown>[] {
  if (!Array.isArray(messages)) {
    throw new ChatApiError(400, "messages must be an array");
  }
  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) {
      throw new ChatApiError(400, "Invalid message format");
    }
    const record = msg as Record<string, unknown>;
    const hasContent =
      typeof record.content === "string" || Array.isArray(record.content);
    const hasParts = Array.isArray(record.parts);
    if (!hasContent && !hasParts) {
      throw new ChatApiError(400, "Invalid message format");
    }
  }
}
