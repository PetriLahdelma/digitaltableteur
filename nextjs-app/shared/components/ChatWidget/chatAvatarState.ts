import type { UIMessage } from "ai";
import type { DonnyState } from "@dt/DonnyAvatar";
import { extractShowExpressionFromMessage } from "./chatToolExpression";

export type ChatStatus = "ready" | "submitted" | "streaming" | "error";

export type ToolActivityPhase = "call" | "result";

export interface ToolActivity {
  toolName: string;
  phase: ToolActivityPhase;
}

type MessagePart = {
  type?: string;
  toolName?: string;
  state?: string;
  toolInvocation?: {
    toolName?: string;
    state?: string;
  };
};

const STUDIO_TOOL_PREFIX = "tool-studio.";

function normalizeToolName(toolName: string): string {
  return toolName.startsWith("studio.") ? toolName : `studio.${toolName}`;
}

/** Normalize legacy and AI SDK v5 tool lifecycle states. */
export function normalizeToolPhase(
  state: string | undefined,
): ToolActivityPhase | null {
  if (!state) return null;
  if (
    state === "call" ||
    state === "partial-call" ||
    state === "input-streaming" ||
    state === "input-available"
  ) {
    return "call";
  }
  if (state === "result" || state === "output-available") {
    return "result";
  }
  return null;
}

function readToolActivityFromPart(part: MessagePart): ToolActivity | null {
  if (part.type === "tool-invocation" && part.toolInvocation) {
    const { toolName, state } = part.toolInvocation;
    if (!toolName) return null;
    const phase = normalizeToolPhase(state);
    return phase ? { toolName: normalizeToolName(toolName), phase } : null;
  }

  if (part.type?.startsWith(STUDIO_TOOL_PREFIX)) {
    const toolName = normalizeToolName(
      part.type.slice(STUDIO_TOOL_PREFIX.length),
    );
    const phase = normalizeToolPhase(part.state);
    return phase ? { toolName, phase } : null;
  }

  if (part.type === "dynamic-tool" && part.toolName) {
    const phase = normalizeToolPhase(part.state);
    return phase
      ? { toolName: normalizeToolName(part.toolName), phase }
      : null;
  }

  return null;
}

/** Extract the most recent tool activity from an assistant message. */
export function extractLastToolActivity(
  message: UIMessage | null | undefined,
): ToolActivity | null {
  if (!message || message.role !== "assistant" || !Array.isArray(message.parts)) {
    return null;
  }

  let latest: ToolActivity | null = null;
  for (const part of message.parts) {
    if (!part || typeof part !== "object") continue;
    const activity = readToolActivityFromPart(part as MessagePart);
    if (activity) latest = activity;
  }
  return latest;
}

function findLatestAssistantMessage(messages: UIMessage[]): UIMessage | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === "assistant") {
      return messages[index];
    }
  }
  return null;
}

function messageHasCompletedTool(
  message: UIMessage | null | undefined,
  toolName: string,
): boolean {
  const activity = extractLastToolActivity(message);
  return activity?.toolName === toolName && activity.phase === "result";
}

/** True when the latest assistant reply includes a completed VertaaUX offer tool. */
export function messageHasVertaauxOffer(messages: UIMessage[]): boolean {
  return messageHasCompletedTool(
    findLatestAssistantMessage(messages),
    "studio.vertaauxAccessibility",
  );
}

/** True when the latest assistant reply includes a completed project showcase. */
export function messageHasProjectShowcase(messages: UIMessage[]): boolean {
  return messageHasCompletedTool(
    findLatestAssistantMessage(messages),
    "studio.projectShowcase",
  );
}

/** Resolve avatar state during active email workflow */
export function resolveWorkflowAvatarState(step: string): DonnyState {
  if (step === "success") return "celebrating";
  if (step === "sending") return "loading";
  if (step === "error") return "apologetic";
  if (step === "review") return "focused";
  if (step === "promptStart") return "suggesting";
  if (step.startsWith("collecting")) return "listening";
  return "success";
}

/** Resolve avatar state when a tool invocation is active */
export function resolveToolAvatarState(
  tool: ToolActivity,
  expressionHint?: DonnyState | null,
): DonnyState {
  const { toolName, phase } = tool;

  if (toolName === "studio.showExpression") {
    return expressionHint ?? "playful";
  }

  if (phase === "call") {
    if (toolName === "studio.navigateTo") return "handoff";
    if (toolName === "studio.composeMailRequest") return "acknowledging";
    if (toolName === "studio.vertaauxAccessibility") return "suggesting";
    if (toolName === "studio.projectShowcase") return "searching";
    return "searching";
  }

  if (toolName === "studio.navigateTo") return "handoff";
  if (toolName === "studio.projectShowcase") return "impressed";
  if (toolName === "studio.vertaauxAccessibility") return "suggesting";
  if (toolName === "studio.composeMailRequest") return "success";
  return "confident";
}

/** Resolve avatar state from the user's current draft text */
export function resolveDraftAvatarState(
  draft: string,
  toolKeywords: string[],
): DonnyState {
  const trimmed = draft.trim().toLowerCase();
  if (!trimmed) return "idle";
  if (/\b(thanks?|thank you|thx|cheers|great|awesome|perfect)\b/.test(trimmed)) {
    return "celebrating";
  }
  if (
    /\b(doesn't work|broken|wrong|bad|terrible|frustrated|annoyed|confus(?:ed|ing)|don't understand|doesn't make sense)\b/.test(
      trimmed,
    )
  ) {
    return "confused";
  }
  if (/\b(sorry|apologize|my bad|oops)\b/.test(trimmed)) {
    return "apologetic";
  }
  if (/\b(accessibility|a11y|wcag|screen reader|saavutettavuus|tillgänglighet)\b/.test(trimmed)) {
    return "curious";
  }
  if (/\b(expression|mood|face|moods|expressions)\b/.test(trimmed)) {
    return "playful";
  }
  if (toolKeywords.some((keyword) => trimmed.includes(keyword))) {
    return "curious";
  }
  if (trimmed.includes("?")) return "focused";
  return "listening";
}

/** Distinguish generic failures (confused) from known error classes (error). */
export function resolveErrorAvatarState(
  resolvedErrorCopy: string | null,
  fallbackCopy: string,
): DonnyState {
  if (resolvedErrorCopy === fallbackCopy) return "confused";
  return "error";
}

export interface ResolveChatAvatarStateInput {
  status: ChatStatus;
  resolvedErrorCopy: string | null;
  fallbackErrorCopy: string;
  draft: string;
  toolKeywords: readonly string[];
  emailWorkflowStep: string;
  messages: UIMessage[];
}

/** Map chat lifecycle, tools, drafts, and errors to DonnyAvatar state. */
export function resolveChatAvatarState(
  input: ResolveChatAvatarStateInput,
): DonnyState {
  const {
    status,
    resolvedErrorCopy,
    fallbackErrorCopy,
    draft,
    toolKeywords,
    emailWorkflowStep,
    messages,
  } = input;

  if (resolvedErrorCopy) {
    return resolveErrorAvatarState(resolvedErrorCopy, fallbackErrorCopy);
  }

  const isToolWorkflowActive =
    emailWorkflowStep !== "idle" && emailWorkflowStep !== "error";

  if (isToolWorkflowActive) {
    return resolveWorkflowAvatarState(emailWorkflowStep);
  }

  const lastAssistant = findLatestAssistantMessage(messages);
  const lastToolActivity = extractLastToolActivity(lastAssistant);
  const expressionFromTool =
    lastToolActivity?.toolName === "studio.showExpression"
      ? extractShowExpressionFromMessage(lastAssistant)
      : null;

  if (
    lastToolActivity &&
    (status === "streaming" || status === "submitted")
  ) {
    return resolveToolAvatarState(lastToolActivity, expressionFromTool);
  }

  if (status === "submitted") return "loading";
  if (status === "streaming") return "typing";

  if (messageHasVertaauxOffer(messages)) return "suggesting";
  if (messageHasProjectShowcase(messages)) return "impressed";

  if (messages.length <= 1 && !draft.trim()) return "greeting";

  return resolveDraftAvatarState(draft, [...toolKeywords]);
}
