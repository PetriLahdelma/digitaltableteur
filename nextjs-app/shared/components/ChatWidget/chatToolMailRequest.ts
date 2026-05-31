import type { UIMessage } from "ai";
import {
  isAllowedDonnyMailtoUrl,
  openDonnyMailtoUrl,
  type DonnyMailRequestType,
} from "../../data/donny-mail-requests";
import { isDonnyToolPart, normalizeDonnyToolName } from "../../lib/donny-tool-names";

export interface ComposeMailRequestToolResult {
  toolCallId: string;
  requestType: DonnyMailRequestType;
  mailtoUrl: string;
  opened: boolean;
}

const MAIL_TOOL_NAME = "studio.composeMailRequest";

function readMailRequestOutput(output: unknown): {
  requestType?: DonnyMailRequestType;
  mailtoUrl?: string;
  opened?: boolean;
} {
  if (!output || typeof output !== "object") return {};
  const record = output as {
    requestType?: unknown;
    mailtoUrl?: unknown;
    opened?: unknown;
  };
  const requestType =
    record.requestType === "cv" || record.requestType === "portfolio"
      ? record.requestType
      : undefined;
  return {
    requestType,
    mailtoUrl: typeof record.mailtoUrl === "string" ? record.mailtoUrl : undefined,
    opened: typeof record.opened === "boolean" ? record.opened : undefined,
  };
}

function isMailRequestPart(typed: {
  type?: string;
  toolName?: string;
}): boolean {
  return isDonnyToolPart(typed, MAIL_TOOL_NAME);
}

/** Extract completed studio.composeMailRequest tool results from AI SDK UI messages. */
export function extractComposeMailRequestResults(
  message: UIMessage,
): ComposeMailRequestToolResult[] {
  if (message.role !== "assistant" || !Array.isArray(message.parts)) {
    return [];
  }

  const results: ComposeMailRequestToolResult[] = [];

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
      if (
        normalizeDonnyToolName(inv.toolName) !== MAIL_TOOL_NAME ||
        inv.state !== "result"
      ) {
        continue;
      }
      const output = readMailRequestOutput(inv.result);
      if (!output.mailtoUrl || !output.requestType || !inv.toolCallId) continue;
      results.push({
        toolCallId: inv.toolCallId,
        requestType: output.requestType,
        mailtoUrl: output.mailtoUrl,
        opened: output.opened ?? true,
      });
      continue;
    }

    if (!isMailRequestPart(typed) || typed.state !== "output-available") {
      continue;
    }

    const output = readMailRequestOutput(typed.output);
    if (!output.mailtoUrl || !output.requestType || !typed.toolCallId) continue;

    results.push({
      toolCallId: typed.toolCallId,
      requestType: output.requestType,
      mailtoUrl: output.mailtoUrl,
      opened: output.opened ?? true,
    });
  }

  return results;
}

export function executeChatMailRequest(result: ComposeMailRequestToolResult): boolean {
  if (!result.opened || !isAllowedDonnyMailtoUrl(result.mailtoUrl)) {
    return false;
  }
  return openDonnyMailtoUrl(result.mailtoUrl);
}
