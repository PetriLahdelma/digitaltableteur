import type { UIMessage } from "ai";

// Token constants (exported for tests and renderer awareness)
export const TOKEN_OPEN_HOURS = "[[openHours]]";
export const TOKEN_SERVICES_GRID = "[[servicesGrid]]";

// Heuristic regex for open hours mentions (case-insensitive; keep pure here)
const OPEN_HOURS_PATTERN =
  /open\s*hours|opening\s*hours|hours\s*of\s*operation|operating\s*times|business\s*hours|what\s+are\s+your\s+hours|what\s+time\s+are\s+you\s+open|when\s+are\s+you\s+open|are\s+you\s+open|availability|today['’]s?\s+hours|current\s+hours|closing\s*time|closing\s+time|opening\s*time/i;

// Heuristic regex for services / capabilities mentions
const SERVICES_PATTERN =
  /\bservices?\b|\bcapabilities\b|\bofferings?\b|what\s+do\s+you\s+offer|what\s+services\s+do\s+you\s+provide|your\s+services|studio\s+services/i;

export type ProcessedPart =
  | { kind: "text"; content: string }
  | { kind: "component"; name: "OpenHours"; props?: { compact?: boolean } }
  | { kind: "component"; name: "ServicesGrid" };

export interface ProcessedMessage {
  id: string;
  role: UIMessage["role"];
  parts: ProcessedPart[];
}

// Extract raw textual copy from UIMessage (mirrors previous getMessageText)
export const extractCopy = (message: UIMessage): string => {
  if (!Array.isArray(message.parts) || message.parts.length === 0) return "";
  return message.parts
    .map((part) => {
      if (
        (part.type === "text" || part.type === "reasoning") &&
        "text" in part
      ) {
        return typeof part.text === "string" ? part.text : "";
      }
      if (part.type === "tool-result" || part.type.startsWith("tool-")) {
        const toolPart = part as unknown as {
          toolName?: string;
          toolCallId: string;
        };
        const label = toolPart.toolName ?? toolPart.toolCallId ?? "tool";
        return `[${label} result available]`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
};

/**
 * processMessage
 * Converts a UIMessage into a presentation-agnostic sequence of parts.
 * Rules:
 *  - Only assistant messages may inject components.
 *  - Explicit token [[openHours]] splits the message into text + component parts (compact variant).
 *  - Heuristic mention of "open hours" triggers appending an OpenHours component (compact) after text.
 *  - Explicit token [[servicesGrid]] interleaves a single ServicesGrid component (dedup subsequent tokens).
 *  - Heuristic mention of services triggers a single ServicesGrid append (only if no token present).
 *  - User token usage is stripped (no component injection for either token).
 */
export const processMessage = (message: UIMessage): ProcessedMessage => {
  const copy = extractCopy(message);
  const role = message.role;
  const isAssistant = role === "assistant";

  // Empty copy -> just a text part (renderer will decide fallback)
  if (!copy) {
    return { id: message.id, role, parts: [{ kind: "text", content: "" }] };
  }

  // Assistant explicit token: split and interleave OpenHours component parts
  if (isAssistant && copy.includes(TOKEN_OPEN_HOURS)) {
    const segments = copy.split(TOKEN_OPEN_HOURS);
    const parts: ProcessedPart[] = [];
    segments.forEach((seg, idx) => {
      if (seg) parts.push({ kind: "text", content: seg });
      if (idx < segments.length - 1) {
        parts.push({
          kind: "component",
          name: "OpenHours",
          props: { compact: true },
        });
      }
    });
    return { id: message.id, role, parts };
  }

  // Assistant explicit servicesGrid token: render only first occurrence
  if (isAssistant && copy.includes(TOKEN_SERVICES_GRID)) {
    const segments = copy.split(TOKEN_SERVICES_GRID);
    const parts: ProcessedPart[] = [];
    segments.forEach((seg, idx) => {
      if (seg) parts.push({ kind: "text", content: seg });
      if (idx < segments.length - 1 && idx === 0) {
        parts.push({ kind: "component", name: "ServicesGrid" });
      }
    });
    return { id: message.id, role, parts };
  }

  // Assistant heuristic injection (OpenHours)
  if (isAssistant && OPEN_HOURS_PATTERN.test(copy)) {
    return {
      id: message.id,
      role,
      parts: [
        { kind: "text", content: copy },
        { kind: "component", name: "OpenHours", props: { compact: true } },
      ],
    };
  }

  // Assistant heuristic injection (ServicesGrid) only if no token present
  if (isAssistant && SERVICES_PATTERN.test(copy)) {
    return {
      id: message.id,
      role,
      parts: [
        { kind: "text", content: copy },
        { kind: "component", name: "ServicesGrid" },
      ],
    };
  }

  // User attempted token: strip both kinds, no component
  if (
    !isAssistant &&
    (copy.includes(TOKEN_OPEN_HOURS) || copy.includes(TOKEN_SERVICES_GRID))
  ) {
    const sanitized = copy
      .replaceAll(TOKEN_OPEN_HOURS, "")
      .replaceAll(TOKEN_SERVICES_GRID, "")
      .trim();
    return {
      id: message.id,
      role,
      parts: [{ kind: "text", content: sanitized }],
    };
  }

  // Default: single text part
  return { id: message.id, role, parts: [{ kind: "text", content: copy }] };
};

// Convenience bulk processor
export const processConversation = (
  messages: UIMessage[],
): ProcessedMessage[] =>
  messages
    .filter((m) => m.role === "assistant" || m.role === "user")
    .map(processMessage);

export default processMessage;
