import { createGateway } from "@ai-sdk/gateway";
import { createOpenAI } from "@ai-sdk/openai";
import { wrapLanguageModel, type LanguageModel } from "ai";
import {
  resolveGatewayModelId,
  resolveModelId,
} from "@/app/api/chat-shared";
import { gatewayFinishCompatMiddleware } from "./gateway-finish-compat";
import { openAiPhaseFilterMiddleware } from "./openai-phase-filter";

export type ChatModelBackend = "gateway" | "openai";

/**
 * Which LLM backend Donny chat uses.
 * - `CHAT_MODEL_PROVIDER=openai` — direct OpenAI only
 * - `CHAT_MODEL_PROVIDER=gateway` — Vercel AI Gateway only
 * - default/auto — OpenAI when OPENAI_API_KEY is set (avoids Gateway free-tier limits),
 *   otherwise Gateway when AI_GATEWAY_API_KEY is set
 */
export function resolvePrimaryChatBackend(): ChatModelBackend {
  const explicit = process.env.CHAT_MODEL_PROVIDER?.trim().toLowerCase();
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY?.trim());
  const hasGateway = Boolean(process.env.AI_GATEWAY_API_KEY?.trim());

  if (explicit === "openai" && hasOpenAi) return "openai";
  if (explicit === "gateway" && hasGateway) return "gateway";

  if (hasOpenAi) return "openai";
  if (hasGateway) return "gateway";

  return "gateway";
}

/** Ordered backends to try; primary first, then the other provider when configured. */
export function resolveChatBackendOrder(): ChatModelBackend[] {
  const primary = resolvePrimaryChatBackend();
  const order: ChatModelBackend[] = [primary];

  if (primary === "gateway" && hasOpenAiFallback()) {
    order.push("openai");
  } else if (primary === "openai" && hasGatewayFallback()) {
    order.push("gateway");
  }

  return order;
}

export function hasOpenAiFallback(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function hasGatewayFallback(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY?.trim());
}

export function getChatLanguageModel(backend: ChatModelBackend): LanguageModel {
  if (backend === "openai") {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY!.trim(),
    });
    return wrapLanguageModel({
      model: openai(resolveModelId()),
      middleware: openAiPhaseFilterMiddleware,
    });
  }

  const gateway = createGateway({
    baseURL: process.env.AI_GATEWAY_URL?.trim(),
    apiKey: process.env.AI_GATEWAY_API_KEY?.trim(),
  });
  // The Gateway currently returns legacy finish data that stops tool calls;
  // see gateway-finish-compat.ts.
  return wrapLanguageModel({
    model: gateway(resolveGatewayModelId()),
    middleware: [gatewayFinishCompatMiddleware, openAiPhaseFilterMiddleware],
  });
}

/**
 * GPT-6 Luna defaults to reasoning effort "medium", which is slower, drops
 * temperature, and spends reasoning tokens against maxOutputTokens. Donny
 * runs it at "none", as OpenAI's GPT-4.x migration guide recommends. Needs
 * @ai-sdk/openai >= 4.0.90; older versions drop "none" with only a warning.
 * Non-reasoning models (e.g. a gpt-4o-mini rollback) ignore this option.
 *
 * parallelToolCalls: false enforces the system prompt's "at most one tool
 * per reply" rule at the API level; both models broke it in the 2026-10-14
 * eval (scripts/donny-model-eval.ts).
 */
export const CHAT_REASONING_EFFORT = "none";

export function getChatProviderOptions() {
  return {
    openai: {
      reasoningEffort: CHAT_REASONING_EFFORT,
      parallelToolCalls: false,
    },
  } as const;
}

export function describeChatBackend(backend: ChatModelBackend): string {
  return backend === "openai"
    ? `openai/${resolveModelId()}`
    : resolveGatewayModelId();
}
