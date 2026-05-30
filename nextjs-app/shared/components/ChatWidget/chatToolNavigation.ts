import type { UIMessage } from "ai";
import {
  isSafeDonnyRoute,
  resolveDonnyTargetFromNavigationUrl,
} from "../../data/donny-site-actions";
import type { DonnyActionsContextValue } from "../DonnyActionProvider/useDonnyActions";

type ChatRouter = {
  push: (href: string) => void;
};

export interface NavigateToolResult {
  toolCallId: string;
  url: string;
  navigated: boolean;
}

function readNavigateOutput(output: unknown): { url?: string; navigated?: boolean } {
  if (!output || typeof output !== "object") return {};
  const record = output as { url?: unknown; navigated?: unknown };
  return {
    url: typeof record.url === "string" ? record.url : undefined,
    navigated:
      typeof record.navigated === "boolean" ? record.navigated : undefined,
  };
}

/** Extract completed studio.navigateTo tool results from AI SDK UI messages. */
export function extractNavigateToolResults(
  message: UIMessage,
): NavigateToolResult[] {
  if (message.role !== "assistant" || !Array.isArray(message.parts)) {
    return [];
  }

  const results: NavigateToolResult[] = [];

  for (const part of message.parts) {
    if (!part || typeof part !== "object") continue;

    const typed = part as {
      type?: string;
      toolCallId?: string;
      toolName?: string;
      state?: string;
      output?: unknown;
      toolInvocation?: {
        toolCallId?: string;
        toolName?: string;
        state?: string;
        result?: unknown;
      };
    };

    if (typed.type === "tool-invocation" && typed.toolInvocation) {
      const inv = typed.toolInvocation;
      if (inv.toolName !== "studio.navigateTo" || inv.state !== "result") {
        continue;
      }
      const output = readNavigateOutput(inv.result);
      if (!output.url || !inv.toolCallId) continue;
      results.push({
        toolCallId: inv.toolCallId,
        url: output.url,
        navigated: output.navigated ?? true,
      });
      continue;
    }

    const isNavigatePart =
      typed.type === "tool-studio.navigateTo" ||
      (typed.type === "dynamic-tool" && typed.toolName === "studio.navigateTo");

    if (!isNavigatePart) continue;
    if (typed.state !== "output-available") continue;

    const output = readNavigateOutput(typed.output);
    if (!output.url || !typed.toolCallId) continue;

    results.push({
      toolCallId: typed.toolCallId,
      url: output.url,
      navigated: output.navigated ?? true,
    });
  }

  return results;
}

export async function executeChatNavigation(
  url: string,
  actions: Pick<DonnyActionsContextValue, "showPageTarget">,
  router: ChatRouter,
  toolCallId?: string,
): Promise<void> {
  const pathOnly = url.split("#")[0] ?? url;
  if (!isSafeDonnyRoute(pathOnly)) {
    return;
  }

  const resolved = resolveDonnyTargetFromNavigationUrl(url);
  if (resolved) {
    await actions.showPageTarget({
      targetId: resolved.targetId,
      mode: "navigate",
      highlightMode: "spotlight",
      toolCallId,
    });
    return;
  }

  router.push(url);
}

export function findLatestNavigateToolResult(
  messages: UIMessage[],
): NavigateToolResult | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "assistant") continue;
    const results = extractNavigateToolResults(message);
    if (results.length > 0) {
      return results[results.length - 1];
    }
  }
  return null;
}
