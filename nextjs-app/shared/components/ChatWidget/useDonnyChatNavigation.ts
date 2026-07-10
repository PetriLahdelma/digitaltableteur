"use client";

import { useEffect, useRef } from "react";
import { useNavigationRouter } from "../../lib/navigation";
import type { UIMessage } from "ai";
import { useOptionalDonnyActions } from "../DonnyActionProvider";
import {
  executeChatNavigation,
  extractNavigateToolResults,
} from "./chatToolNavigation";
import {
  executeChatMailRequest,
  extractComposeMailRequestResults,
} from "./chatToolMailRequest";

/**
 * Executes studio.navigateTo tool results in the browser once per toolCallId.
 * Only runs after a chat response finishes streaming to avoid replay on reload.
 */
export function useDonnyChatNavigation(
  messages: UIMessage[],
  status: "submitted" | "streaming" | "ready" | "error",
): void {
  const router = useNavigationRouter();
  const donnyActions = useOptionalDonnyActions();
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

      for (const result of extractNavigateToolResults(message)) {
        if (!result.navigated || executedToolCallIdsRef.current.has(result.toolCallId)) {
          continue;
        }

        executedToolCallIdsRef.current.add(result.toolCallId);
        if (donnyActions) {
          void executeChatNavigation(
            result.url,
            { showPageTarget: donnyActions.showPageTarget },
            router,
            result.toolCallId,
          );
        }
      }

      for (const result of extractComposeMailRequestResults(message)) {
        if (!result.opened || executedToolCallIdsRef.current.has(result.toolCallId)) {
          continue;
        }

        executedToolCallIdsRef.current.add(result.toolCallId);
        executeChatMailRequest(result);
      }

      break;
    }
  }, [donnyActions, messages, router, status]);
}
