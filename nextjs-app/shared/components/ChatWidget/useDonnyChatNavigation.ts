"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { UIMessage } from "ai";
import { useOptionalDonnyActions } from "../DonnyActionProvider";
import {
  executeChatNavigation,
  extractNavigateToolResults,
} from "./chatToolNavigation";

/**
 * Executes studio.navigateTo tool results in the browser once per toolCallId.
 * Only runs after a chat response finishes streaming to avoid replay on reload.
 */
export function useDonnyChatNavigation(
  messages: UIMessage[],
  status: "submitted" | "streaming" | "ready" | "error",
): void {
  const router = useRouter();
  const donnyActions = useOptionalDonnyActions();
  const executedToolCallIdsRef = useRef(new Set<string>());
  const previousStatusRef = useRef(status);

  useEffect(() => {
    if (!donnyActions) {
      return;
    }

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

      for (const result of extractNavigateToolResults(message)) {
        if (!result.navigated || executedToolCallIdsRef.current.has(result.toolCallId)) {
          continue;
        }

        executedToolCallIdsRef.current.add(result.toolCallId);
        void executeChatNavigation(
          result.url,
          { showPageTarget: donnyActions.showPageTarget },
          router,
          result.toolCallId,
        );
      }

      break;
    }
  }, [donnyActions, messages, router, status]);
}
