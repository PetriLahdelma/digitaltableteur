import * as Sentry from "@sentry/nextjs";
import { APICallError } from "ai";

import type { ChatErrorCode } from "@/nextjs-app/shared/lib/chat-error-codes";

/**
 * Server-side classification and logging for Donny chat failures. The
 * visitor-facing side only ever sees the code and the reference (see
 * chat-error-codes.ts); everything below stays in logs and Sentry.
 */

export type ChatFailureDetail = {
  code: ChatErrorCode;
  /** HTTP status the provider returned, when known. */
  providerStatus?: number;
  /** Provider error code or type, e.g. credit_balance_exhausted. */
  providerCode?: string;
  message: string;
};

function providerCodeFrom(body: string | undefined): string | undefined {
  if (!body) return undefined;
  const match = body.match(/"code"\s*:\s*"([^"]+)"/) ?? body.match(/"type"\s*:\s*"([^"]+)"/);
  return match?.[1];
}

export function classifyProviderError(error: unknown): ChatFailureDetail {
  if (APICallError.isInstance(error)) {
    const providerCode = providerCodeFrom(error.responseBody);
    const body = (error.responseBody ?? "").toLowerCase();
    const quota = /insufficient_quota|credit|billing|exceeded your current quota/.test(body);
    const status = error.statusCode;
    const code: ChatErrorCode =
      status === 429 && !quota ? "ai_busy" : "ai_unavailable";
    return { code, providerStatus: status, providerCode, message: error.message };
  }
  const message = error instanceof Error ? error.message : String(error);
  if (/rate.?limit|too many requests/i.test(message)) {
    return { code: "ai_busy", message };
  }
  return { code: "ai_unavailable", message };
}

/**
 * Record a failure under its reference. `level: "warning"` is for failures
 * the visitor never saw (the fallback backend answered), so the owner still
 * learns that the primary provider is down, e.g. out of credits.
 */
export function logChatFailure(options: {
  ref: string;
  detail: ChatFailureDetail;
  backend?: string;
  level: "error" | "warning";
  error?: unknown;
}): void {
  const { ref, detail, backend, level, error } = options;
  const line = `[chat] ref=${ref} code=${detail.code} backend=${backend ?? "-"} status=${detail.providerStatus ?? "-"} provider_code=${detail.providerCode ?? "-"} ${detail.message}`;
  if (level === "error") console.error(line);
  else console.warn(line);

  const context = {
    level,
    tags: {
      feature: "chat",
      chat_error_ref: ref,
      chat_error_code: detail.code,
      chat_backend: backend ?? "none",
      provider_code: detail.providerCode ?? "none",
    },
    extra: { providerStatus: detail.providerStatus, message: detail.message },
  } as const;
  if (error instanceof Error) Sentry.captureException(error, context);
  else Sentry.captureMessage(`Chat failure ${detail.code}`, context);
}
