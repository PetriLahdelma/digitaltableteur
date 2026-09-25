/**
 * Donny chat error protocol, shared by the /api/chat route and ChatWidget.
 *
 * Visitors get a category and an opaque reference code, never provider
 * names, billing or quota state, model ids, or stack traces. Announcing
 * "out of credits" publicly would tell an abuser their traffic is costing
 * money and when it has worked. The owner looks the reference up in the
 * server logs or Sentry (tag chat_error_ref), where the full provider error
 * is recorded.
 *
 * Wire format: stream errors carry `DONNY_ERROR:<code>:<ref>` as their
 * error text; JSON error responses carry `{ error, code, ref }`.
 */

export const CHAT_ERROR_CODES = [
  /** Every AI backend failed (provider outage, credits, auth, config). */
  "ai_unavailable",
  /** The AI provider is throttling requests (not this visitor). */
  "ai_busy",
  /** This visitor sent too many messages in the rate-limit window. */
  "visitor_rate_limited",
  /** The prompt guardrail refused the message. */
  "message_blocked",
  /** The request itself was malformed. */
  "bad_request",
  /** Anything unclassified. */
  "unknown",
] as const;

export type ChatErrorCode = (typeof CHAT_ERROR_CODES)[number];

const STREAM_PREFIX = "DONNY_ERROR";
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Short, unambiguous reference (no 0/O/1/I) for a visitor to quote. */
export function createChatErrorRef(random: () => number = Math.random): string {
  let ref = "";
  for (let i = 0; i < 6; i += 1) {
    ref += REF_ALPHABET[Math.floor(random() * REF_ALPHABET.length)];
  }
  return ref;
}

export function formatStreamErrorText(code: ChatErrorCode, ref: string): string {
  return `${STREAM_PREFIX}:${code}:${ref}`;
}

function isChatErrorCode(value: unknown): value is ChatErrorCode {
  return typeof value === "string" && (CHAT_ERROR_CODES as readonly string[]).includes(value);
}

/**
 * Read a code and reference out of whatever the chat client surfaced: a
 * stream error text, or a JSON error body (the transport throws the body
 * text for non-2xx responses).
 */
export function parseChatError(
  message: string | undefined | null,
): { code: ChatErrorCode; ref: string | null; detail: string | null } | null {
  if (!message) return null;
  const stream = message.match(/DONNY_ERROR:([a-z_]+):([A-Z0-9]{4,12})/);
  if (stream && isChatErrorCode(stream[1])) {
    return { code: stream[1], ref: stream[2], detail: null };
  }
  const jsonStart = message.indexOf("{");
  if (jsonStart !== -1) {
    try {
      const body = JSON.parse(message.slice(jsonStart)) as {
        code?: unknown;
        ref?: unknown;
        error?: unknown;
      };
      if (isChatErrorCode(body.code)) {
        return {
          code: body.code,
          ref: typeof body.ref === "string" ? body.ref : null,
          detail: typeof body.error === "string" ? body.error : null,
        };
      }
    } catch {
      // Not a JSON body; fall through.
    }
  }
  return null;
}
