"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import {
  executeCreateLeadPrefill,
  extractCreateLeadResults,
} from "./chatToolLead";

/**
 * Applies studio.createLead contact prefill once per toolCallId after streaming completes.
 */
export function useDonnyChatLead(
  messages: UIMessage[],
  status: "submitted" | "streaming" | "ready" | "error",
): void {
  const executedToolCallIdsRef = useRef(new Set<string>());
  const previousStatusRef = useRef(status);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    previousStatusRef.current = status;

    const finishedStreaming =
      (previousStatus === "streaming" || previousStatus === "submitted") &&
      status === "ready";

    if (!finishedStreaming) {
      return;
    }

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.role !== "assistant") continue;

      for (const result of extractCreateLeadResults(message)) {
        if (executedToolCallIdsRef.current.has(result.toolCallId)) {
          continue;
        }
        executedToolCallIdsRef.current.add(result.toolCallId);
        executeCreateLeadPrefill(result);
      }

      break;
    }
  }, [messages, status]);
}
