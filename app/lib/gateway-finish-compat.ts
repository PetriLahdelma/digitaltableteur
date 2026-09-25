import type { LanguageModelMiddleware } from "ai";

/**
 * Compatibility shim for AI Gateway responses in the legacy (V2) result shape.
 *
 * Observed 2026-09-25 with @ai-sdk/gateway 4.0.85 and 4.0.92 (model spec v4):
 * the Gateway's `finish` part carries `finishReason: "tool-calls"` as a plain
 * string and `usage` as flat numbers. The `ai` core reads
 * `finishReason.unified`, gets undefined, treats the step as terminal, and
 * never executes the requested tool, so Donny answered with an empty turn.
 * This middleware rewrites legacy finish data into the V3/V4 shape and leaves
 * already-correct parts untouched, so it becomes a no-op once the Gateway
 * sends the current format.
 */

type UnifiedFinishReason =
  | "stop"
  | "length"
  | "content-filter"
  | "tool-calls"
  | "error"
  | "other";

const KNOWN_REASONS = new Set<UnifiedFinishReason>([
  "stop",
  "length",
  "content-filter",
  "tool-calls",
  "error",
  "other",
]);

export function normalizeFinishReason(reason: unknown): {
  unified: UnifiedFinishReason;
  raw: string | undefined;
} {
  if (reason && typeof reason === "object" && "unified" in reason) {
    return reason as { unified: UnifiedFinishReason; raw: string | undefined };
  }
  if (typeof reason === "string") {
    return {
      unified: KNOWN_REASONS.has(reason as UnifiedFinishReason)
        ? (reason as UnifiedFinishReason)
        : "other",
      raw: reason,
    };
  }
  return { unified: "other", raw: undefined };
}

type FlatUsage = {
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
};

export function normalizeUsage(usage: unknown): unknown {
  if (!usage || typeof usage !== "object") return usage;
  const flat = usage as FlatUsage & Record<string, unknown>;
  if (typeof flat.inputTokens === "object" || typeof flat.outputTokens === "object") {
    return usage;
  }
  const input = flat.inputTokens;
  const output = flat.outputTokens;
  const cached = flat.cachedInputTokens;
  const reasoning = flat.reasoningTokens;
  return {
    inputTokens: {
      total: input,
      noCache: input !== undefined && cached !== undefined ? input - cached : input,
      cacheRead: cached,
      cacheWrite: undefined,
    },
    outputTokens: {
      total: output,
      text: output !== undefined && reasoning !== undefined ? output - reasoning : output,
      reasoning,
    },
  };
}

function normalizeFinishPart<T extends { type?: string }>(part: T): T {
  if (part.type !== "finish") return part;
  const finish = part as T & { finishReason?: unknown; usage?: unknown };
  return {
    ...finish,
    finishReason: normalizeFinishReason(finish.finishReason),
    usage: normalizeUsage(finish.usage),
  };
}

export const gatewayFinishCompatMiddleware: LanguageModelMiddleware = {
  wrapStream: async ({ doStream }) => {
    const { stream, ...rest } = await doStream();
    return {
      ...rest,
      stream: stream.pipeThrough(
        new TransformStream({
          transform(part, controller) {
            controller.enqueue(normalizeFinishPart(part));
          },
        }),
      ),
    };
  },
  wrapGenerate: async ({ doGenerate }) => {
    const result = await doGenerate();
    return {
      ...result,
      finishReason: normalizeFinishReason(result.finishReason) as typeof result.finishReason,
      usage: normalizeUsage(result.usage) as typeof result.usage,
    };
  },
};
