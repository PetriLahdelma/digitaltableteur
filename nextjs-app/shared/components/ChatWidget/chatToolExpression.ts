import type { UIMessage } from "ai";
import type { DonnyState } from "@dt/DonnyAvatar";
import {
  clampDonnyExpressionDurationMs,
  resolveDonnyShowcaseExpression,
  type DonnyShowcaseExpression,
} from "../../data/donny-expressions";
import { isDonnyToolPart, normalizeDonnyToolName } from "../../lib/donny-tool-names";

export const SHOW_EXPRESSION_TOOL_NAME = "studio.showExpression";

export interface ShowExpressionToolResult {
  toolCallId: string;
  expression: DonnyShowcaseExpression;
  label: string;
  durationMs: number;
}

function readExpressionPayload(value: unknown): {
  expression?: string;
  label?: string;
  durationMs?: number;
} {
  if (!value || typeof value !== "object") return {};
  const record = value as {
    expression?: unknown;
    label?: unknown;
    durationMs?: unknown;
  };
  return {
    expression:
      typeof record.expression === "string" ? record.expression : undefined,
    label: typeof record.label === "string" ? record.label : undefined,
    durationMs:
      typeof record.durationMs === "number" ? record.durationMs : undefined,
  };
}

function isShowExpressionPart(typed: {
  type?: string;
  toolName?: string;
}): boolean {
  return isDonnyToolPart(typed, SHOW_EXPRESSION_TOOL_NAME);
}

function toShowExpressionResult(
  toolCallId: string | undefined,
  payload: ReturnType<typeof readExpressionPayload>,
): ShowExpressionToolResult | null {
  if (!toolCallId || !payload.expression) return null;
  const expression = resolveDonnyShowcaseExpression(payload.expression);
  return {
    toolCallId,
    expression,
    label: payload.label ?? expression,
    durationMs: clampDonnyExpressionDurationMs(payload.durationMs),
  };
}

/** Extract completed studio.showExpression tool results from AI SDK UI messages. */
export function extractShowExpressionResults(
  message: UIMessage,
): ShowExpressionToolResult[] {
  if (message.role !== "assistant" || !Array.isArray(message.parts)) {
    return [];
  }

  const results: ShowExpressionToolResult[] = [];

  for (const part of message.parts) {
    if (!part || typeof part !== "object") continue;

    const typed = part as {
      type?: string;
      toolCallId?: string;
      toolName?: string;
      state?: string;
      input?: unknown;
      output?: unknown;
      toolInvocation?: {
        toolCallId?: string;
        toolName?: string;
        state?: string;
        args?: unknown;
        result?: unknown;
      };
    };

    if (typed.type === "tool-invocation" && typed.toolInvocation) {
      const inv = typed.toolInvocation;
      if (normalizeDonnyToolName(inv.toolName) !== SHOW_EXPRESSION_TOOL_NAME) continue;
      if (inv.state !== "result") continue;
      const payload = readExpressionPayload(inv.result);
      const result = toShowExpressionResult(inv.toolCallId, payload);
      if (result) results.push(result);
      continue;
    }

    if (!isShowExpressionPart(typed)) continue;

    if (typed.state === "output-available") {
      const payload = readExpressionPayload(typed.output);
      const result = toShowExpressionResult(typed.toolCallId, payload);
      if (result) results.push(result);
      continue;
    }

    if (
      typed.state === "input-available" ||
      typed.state === "input-streaming"
    ) {
      const payload = readExpressionPayload(typed.input);
      const result = toShowExpressionResult(typed.toolCallId, payload);
      if (result) results.push(result);
    }
  }

  return results;
}

/** Read the latest requested expression from in-flight or completed tool parts. */
export function extractShowExpressionFromMessage(
  message: UIMessage | null | undefined,
): DonnyState | null {
  if (!message) return null;
  const results = extractShowExpressionResults(message);
  if (results.length === 0) return null;
  return results[results.length - 1]?.expression ?? null;
}

export function findLatestShowExpressionResult(
  messages: UIMessage[],
): ShowExpressionToolResult | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "assistant") continue;
    const results = extractShowExpressionResults(message);
    if (results.length > 0) {
      return results[results.length - 1];
    }
  }
  return null;
}
