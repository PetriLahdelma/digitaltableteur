import { createGateway } from "@ai-sdk/gateway";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { resolveGatewayModelId, resolveModelId } from "@/app/api/chat-shared";

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
    return openai(resolveModelId());
  }

  const gateway = createGateway({
    baseURL: process.env.AI_GATEWAY_URL?.trim(),
    apiKey: process.env.AI_GATEWAY_API_KEY?.trim(),
  });
  return gateway(resolveGatewayModelId());
}

export function describeChatBackend(backend: ChatModelBackend): string {
  return backend === "openai"
    ? `openai/${resolveModelId()}`
    : resolveGatewayModelId();
}
