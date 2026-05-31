import type { UIMessage } from "ai";
import {
  dispatchDonnyContactPrefill,
  type DonnyContactPrefillDetail,
} from "../DonnyActionProvider/donnyContactPrefill";
import { isDonnyToolPart, normalizeDonnyToolName } from "../../lib/donny-tool-names";

export const CREATE_LEAD_TOOL_NAME = "studio.createLead";

export interface CreateLeadToolResult {
  toolCallId: string;
  stored: boolean;
  contactPrefill?: DonnyContactPrefillDetail;
  contactUrl: string;
}

function readCreateLeadPayload(value: unknown): {
  stored?: boolean;
  contactPrefill?: DonnyContactPrefillDetail;
  contactUrl?: string;
} {
  if (!value || typeof value !== "object") return {};
  const record = value as {
    stored?: unknown;
    contactPrefill?: unknown;
    contactUrl?: unknown;
  };

  let contactPrefill: DonnyContactPrefillDetail | undefined;
  if (record.contactPrefill && typeof record.contactPrefill === "object") {
    const prefill = record.contactPrefill as DonnyContactPrefillDetail;
    contactPrefill = {
      projectType: prefill.projectType,
      message: prefill.message,
      packageId: prefill.packageId,
      serviceId: prefill.serviceId,
      sourceTargetId: prefill.sourceTargetId,
    };
  }

  return {
    stored: record.stored === true,
    contactPrefill,
    contactUrl:
      typeof record.contactUrl === "string" ? record.contactUrl : undefined,
  };
}

function isCreateLeadPart(typed: {
  type?: string;
  toolName?: string;
}): boolean {
  return isDonnyToolPart(typed, CREATE_LEAD_TOOL_NAME);
}

function toCreateLeadResult(
  toolCallId: string | undefined,
  payload: ReturnType<typeof readCreateLeadPayload>,
): CreateLeadToolResult | null {
  if (!toolCallId || !payload.contactUrl) return null;
  return {
    toolCallId,
    stored: payload.stored === true,
    contactPrefill: payload.contactPrefill,
    contactUrl: payload.contactUrl,
  };
}

/** Extract completed studio.createLead tool results from AI SDK UI messages. */
export function extractCreateLeadResults(
  message: UIMessage,
): CreateLeadToolResult[] {
  if (message.role !== "assistant" || !Array.isArray(message.parts)) {
    return [];
  }

  const results: CreateLeadToolResult[] = [];

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
      if (normalizeDonnyToolName(inv.toolName) !== CREATE_LEAD_TOOL_NAME) continue;
      if (inv.state !== "result") continue;
      const payload = readCreateLeadPayload(inv.result);
      const result = toCreateLeadResult(inv.toolCallId, payload);
      if (result) results.push(result);
      continue;
    }

    if (!isCreateLeadPart(typed)) continue;
    if (typed.state !== "output-available") continue;

    const payload = readCreateLeadPayload(typed.output);
    const result = toCreateLeadResult(typed.toolCallId, payload);
    if (result) results.push(result);
  }

  return results;
}

export function executeCreateLeadPrefill(result: CreateLeadToolResult): void {
  if (!result.contactPrefill) return;
  dispatchDonnyContactPrefill(result.contactPrefill);
}
