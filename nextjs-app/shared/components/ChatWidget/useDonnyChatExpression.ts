"use client";

import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";
import type { DonnyState } from "@dt/DonnyAvatar";
import { extractShowExpressionResults } from "./chatToolExpression";

type ChatStatus = "submitted" | "streaming" | "ready" | "error";

/**
 * Applies studio.showExpression tool results to the avatar for a bounded duration.
 * Clears when the user sends a new message or when the TTL expires.
 */
export function useDonnyChatExpression(
  messages: UIMessage[],
  status: ChatStatus,
): DonnyState | null {
  const [forcedExpression, setForcedExpression] = useState<DonnyState | null>(
    null,
  );
  const executedToolCallIdsRef = useRef(new Set<string>());
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousStatusRef = useRef(status);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;

    if (status === "submitted" && previousStatus !== "submitted") {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
      setForcedExpression(null);
      return;
    }

    const finishedStreaming =
      (previousStatus === "streaming" || previousStatus === "submitted") &&
      status === "ready";

    if (!finishedStreaming) {
      return;
    }

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.role !== "assistant") continue;

      for (const result of extractShowExpressionResults(message)) {
        if (executedToolCallIdsRef.current.has(result.toolCallId)) {
          continue;
        }

        executedToolCallIdsRef.current.add(result.toolCallId);
        setForcedExpression(result.expression);

        if (clearTimerRef.current) {
          clearTimeout(clearTimerRef.current);
        }

        clearTimerRef.current = setTimeout(() => {
          setForcedExpression((current) =>
            current === result.expression ? null : current,
          );
          clearTimerRef.current = null;
        }, result.durationMs);
      }

      break;
    }
  }, [messages, status]);

  useEffect(
    () => () => {
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current);
      }
    },
    [],
  );

  return forcedExpression;
}
