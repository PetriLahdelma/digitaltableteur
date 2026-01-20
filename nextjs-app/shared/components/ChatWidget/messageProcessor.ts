import type { UIMessage } from "ai";

// Token constants (exported for possible future explicit user prompts)
export const TOKEN_OPEN_HOURS = "[[openHours]]";
export const TOKEN_SERVICES_GRID = "[[servicesGrid]]";
export const TOKEN_STUDIO_MAP = "[[studioMap]]";

// User prompt heuristics (EN + FI + SV) – only user messages may trigger subsequent assistant injection
const USER_OPEN_HOURS_PATTERN =
  /open\s*hours|business\s*hours|closing\s*time|opening\s*time|hours\s*of\s*operation|operating\s*times|aukioloajat?|aukioloaika|sulkemisaika|avaamisaika|tänään\s+auki|öppettider|öppet|stängningstid|öppningstid|dagens\s+öppettider/i;
const USER_SERVICES_PATTERN =
  /\bservices?\b|\bcapabilities\b|\bofferings?\b|what\s+do\s+you\s+offer|what\s+services\s+do\s+you\s+provide|palvelut|palveluja|palveluita|mitä\s+tarjoatte|palvelunne|tjänster|era\s+tjänster|vad\s+erbjuder\s+ni|erbjudanden/i;
const USER_STUDIO_MAP_PATTERN =
  /\baddress\b|\blocation\b|\bwhere\s+(?:are\s+you|is\s+(?:the|your)\s+(?:office|studio))\b|\bdirections?\b|\bhow\s+(?:to\s+find|do\s+I\s+(?:find|get\s+to))\b|\bfind\s+(?:the|your)\s+(?:office|studio)\b|\boffice\s+location\b|\bstudio\s+(?:address|location)\b|\bvisit(?:\s+you)?\b|\bcome\s+to\b|\bmap\b|\bshow\s+(?:me\s+)?(?:on\s+(?:a\s+)?)?map\b|\bosoite\b|\bsijainti\b|\bmissä\s+(?:olette|on\s+(?:toimisto|studio))\b|\breittiohjeet?\b|\bmiten\s+(?:löydän|pääsen)\b|\btoimisto(?:n\s+sijainti)?\b|\bkäynti\b|\bkartta\b|\bnäytä\s+kartalla\b|\badress\b|\bplats\b|\bvar\s+(?:finns|ligger|är)\b|\bvägbeskrivning\b|\bhitta\b|\bbesök\b|\bkontor(?:et)?\b|\bkarta\b|\bvisa\s+(?:på\s+)?karta/i;

// Email workflow trigger patterns (EN/FI/SV)
// General send intent: phrases implying composing/sending an email
const USER_EMAIL_WORKFLOW_GENERAL_PATTERN =
  /send(?:\s+(?:an|a))?\s+email|compose(?:\s+(?:an|a))?\s+email|help\s+me\s+send\s+an?\s+email|write\s+an?\s+email|skicka\s+epost|skicka\s+email|lähettää\s+sähköpostia|lähetä\s+email|auta\s+minua\s+lähettämään\s+sähköposti|kirjoita\s+sähköposti|maila/i;
// Simple keyword: user just types 'email' or asks for the company email address;
// we treat this differently to show the address then offer workflow.
const USER_EMAIL_WORKFLOW_SIMPLE_PATTERN = /^(?:email|sähköposti|epost)\s*$/i;

export type ProcessedPart =
  | { kind: "text"; content: string }
  | { kind: "component"; name: "OpenHours"; props?: { compact?: boolean } }
  | { kind: "component"; name: "ServicesGrid" }
  | { kind: "component"; name: "StudioMap"; props?: { compact?: boolean } };
// Future: email workflow will introduce a pseudo-component or control parts.

export interface ProcessedMessage {
  id: string;
  role: UIMessage["role"];
  parts: ProcessedPart[];
}

// Extract raw textual copy from UIMessage (mirrors previous getMessageText)
const coerceToDisplayText = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (Array.isArray(value)) {
    const combined = value
      .map((entry) => coerceToDisplayText(entry))
      .filter((entry): entry is string => Boolean(entry))
      .join("\n")
      .trim();
    return combined.length ? combined : null;
  }
  if (value && typeof value === "object") {
    const candidate = value as { text?: unknown; content?: unknown };
    return (
      coerceToDisplayText(candidate.text) ??
      coerceToDisplayText(candidate.content) ??
      null
    );
  }
  return null;
};

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
          text?: unknown;
          result?: unknown;
          content?: unknown;
        };
        return (
          coerceToDisplayText(toolPart.text) ??
          coerceToDisplayText(toolPart.result) ??
          coerceToDisplayText(toolPart.content) ??
          ""
        );
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
// Original array-returning conversation processor (used by ChatMessages rendering)
export const processConversation = (
  messages: UIMessage[],
): ProcessedMessage[] => {
  const { parts } = processConversationWithFlags(messages);
  return parts;
};

// Extended variant exposing pendingEmailWorkflow flag for ChatWidget trigger logic
export const processConversationWithFlags = (
  messages: UIMessage[],
): {
  parts: ProcessedMessage[];
  pendingEmailWorkflowGeneral: boolean;
  pendingEmailWorkflowSimple: boolean;
} => {
  const processed: ProcessedMessage[] = [];
  let pendingOpenHours = false;
  let pendingServices = false;
  let pendingStudioMap = false;
  let pendingEmailWorkflowGeneral = false;
  let pendingEmailWorkflowSimple = false;

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
      pendingStudioMap =
        normalized.includes(TOKEN_STUDIO_MAP) ||
        USER_STUDIO_MAP_PATTERN.test(normalized);
      pendingEmailWorkflowGeneral =
        USER_EMAIL_WORKFLOW_GENERAL_PATTERN.test(normalized);
      pendingEmailWorkflowSimple =
        USER_EMAIL_WORKFLOW_SIMPLE_PATTERN.test(normalized);
      // For user messages we sanitize explicit tokens from displayed copy
      const displayCopy = normalized
        .split(TOKEN_OPEN_HOURS)
        .join("")
        .split(TOKEN_SERVICES_GRID)
        .join("")
        .split(TOKEN_STUDIO_MAP)
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
    const assistantHasOpenHoursToken = copy.includes(TOKEN_OPEN_HOURS);
    const assistantHasServicesToken = copy.includes(TOKEN_SERVICES_GRID);
    const assistantHasStudioMapToken = copy.includes(TOKEN_STUDIO_MAP);
    let assistantDisplay = copy;

    // If assistant echoes the token explicitly, treat it as a trigger + sanitize
    if (assistantHasOpenHoursToken) {
      pendingOpenHours = true;
    }
    if (assistantHasServicesToken) {
      pendingServices = true;
    }
    if (assistantHasStudioMapToken) {
      pendingStudioMap = true;
    }

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
    if (pendingStudioMap) {
      assistantDisplay = assistantDisplay
        .split(TOKEN_STUDIO_MAP)
        .join("")
        .replace(
          /\b(osoite|adress|address|sijainti|location|plats)\b[:\-–]*\s*/i,
          "",
        )
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
    if (pendingStudioMap) {
      parts.push({
        kind: "component",
        name: "StudioMap",
        props: { compact: true },
      });
    }
    // Note: pendingEmailWorkflow* flags consumed outside rendering layer (ChatWidget)
    processed.push({ id: m.id, role: m.role, parts });
    // Reset after first assistant response
    pendingOpenHours = false;
    pendingServices = false;
    pendingStudioMap = false;
    pendingEmailWorkflowGeneral = false;
    pendingEmailWorkflowSimple = false;
  }
  return {
    parts: processed,
    pendingEmailWorkflowGeneral,
    pendingEmailWorkflowSimple,
  };
};

export default processMessage;
