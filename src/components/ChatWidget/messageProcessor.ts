import type { UIMessage } from "ai";

// Token constants (exported for possible future explicit user prompts)
export const TOKEN_OPEN_HOURS = "[[openHours]]";
export const TOKEN_SERVICES_GRID = "[[servicesGrid]]";

// User prompt heuristics (EN + FI + SV) – only user messages may trigger subsequent assistant injection
const USER_OPEN_HOURS_PATTERN =
  /open\s*hours|business\s*hours|closing\s*time|opening\s*time|hours\s*of\s*operation|operating\s*times|aukioloajat?|aukioloaika|sulkemisaika|avaamisaika|tänään\s+auki|öppettider|öppet|stängningstid|öppningstid|dagens\s+öppettider/i;
const USER_SERVICES_PATTERN =
  /\bservices?\b|\bcapabilities\b|\bofferings?\b|what\s+do\s+you\s+offer|what\s+services\s+do\s+you\s+provide|palvelut|palveluja|palveluita|mitä\s+tarjoatte|palvelunne|tjänster|era\s+tjänster|vad\s+erbjuder\s+ni|erbjudanden/i;

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
  return {
    id: message.id,
    role: message.role,
    parts: [{ kind: "text", content: copy }],
  };
};

// Convenience bulk processor
export const processConversation = (
  messages: UIMessage[],
): ProcessedMessage[] => {
  const processed: ProcessedMessage[] = [];
  let pendingOpenHours = false;
  let pendingServices = false;

  for (const m of messages) {
    if (m.role !== "assistant" && m.role !== "user") continue;
    const copy = extractCopy(m);
    if (m.role === "user") {
      // Detect triggers in user message; tokens or heuristic phrases
      const normalized = copy;
      pendingOpenHours =
        normalized.includes(TOKEN_OPEN_HOURS) ||
        USER_OPEN_HOURS_PATTERN.test(normalized);
      pendingServices =
        normalized.includes(TOKEN_SERVICES_GRID) ||
        USER_SERVICES_PATTERN.test(normalized);
      // For user messages we sanitize explicit tokens from displayed copy
      const displayCopy = normalized
        .split(TOKEN_OPEN_HOURS)
        .join("")
        .split(TOKEN_SERVICES_GRID)
        .join("")
        .trim();
      processed.push({
        id: m.id,
        role: m.role,
        parts: [{ kind: "text", content: displayCopy }],
      });
      continue;
    }

    // Assistant message: inject components only if user previously triggered.
    // When injecting, sanitize any explicit tokens or leading keyword echoes (basic stripping).
    let assistantDisplay = copy;
    if (pendingOpenHours) {
      assistantDisplay = assistantDisplay
        .split(TOKEN_OPEN_HOURS)
        .join("")
        // Remove first occurrence of any leading keyword variant including optional trailing colon or punctuation
        .replace(/\b(aukioloajat?|öppettider|open\s*hours)\b[:\-–]*\s*/i, "")
        .trim();
    }
    if (pendingServices) {
      assistantDisplay = assistantDisplay
        .split(TOKEN_SERVICES_GRID)
        .join("")
        .replace(/\b(palvelut|tjänster|services)\b/i, "")
        .trim();
    }
    const parts: ProcessedPart[] = [
      { kind: "text", content: assistantDisplay },
    ];
    if (pendingOpenHours) {
      parts.push({
        kind: "component",
        name: "OpenHours",
        props: { compact: true },
      });
    }
    if (pendingServices) {
      parts.push({ kind: "component", name: "ServicesGrid" });
    }
    processed.push({ id: m.id, role: m.role, parts });
    // Reset after first assistant response
    pendingOpenHours = false;
    pendingServices = false;
  }
  return processed;
};

export default processMessage;
