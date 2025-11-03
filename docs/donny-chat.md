# Donny Chat Integration

The chat widget now streams responses through the [Vercel AI SDK](https://ai-sdk.dev/docs) and [Vercel AI Gateway](https://vercel.com/docs/ai-gateway). The client sends UI messages to a single HTTP endpoint which responds with a UI message stream. You can extend the handler with retrieval, analytics, or guardrails as needed.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_DONNY_CHAT_ENDPOINT` | Overrides the client request URL. Useful if the API lives on another origin. | `/api/chat` |
| `AI_GATEWAY_API_KEY` | Gateway API key generated in the Vercel dashboard. Required for local development. | — |
| `AI_GATEWAY_MODEL` | Optional override for the model routed through the gateway (e.g. `openai/gpt-4o-mini-2024-07-18`). | `openai/gpt-4o-mini-2024-07-18` |

> When deployed on Vercel, the gateway can also authenticate via OIDC. Supplying `AI_GATEWAY_API_KEY` keeps local development simple and explicit.

## Minimal Node/Vercel function

```ts
// api/chat.ts
import type { IncomingMessage, ServerResponse } from "http";
import { convertToCoreMessages, streamText } from "ai";
import { gateway } from "@ai-sdk/gateway";

const systemPrompt = `You are Donny, Digitaltableteur’s sales & creative assistant. Stay concise, accurate, and grounded in the provided context.`;

export default async function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse,
) {
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const body = await new Promise<string>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

  const { messages = [] } = JSON.parse(body ?? "{}");

  const result = await streamText({
    model: gateway(process.env.AI_GATEWAY_MODEL ?? "openai/gpt-4o-mini-2024-07-18"),
    system: systemPrompt,
    messages: convertToCoreMessages(messages),
    temperature: 0.3,
    maxRetries: 1,
  });

  res.writeHead(200, {
    "Cache-Control": "no-store",
    Connection: "keep-alive",
  });
  result.pipeUIMessageStreamToResponse(res);
}
```

## Notes

- The handler returns a [UI message stream](https://ai-sdk.dev/docs/ai-sdk-ui/ui-message-stream) that the `useChat` hook consumes. If you add custom data parts or tool calls, ensure they follow the schema.
- Conditioning and retrieval can be added before the `streamText` call (e.g. fetch context, call tools, or inject memory).
- If you move the endpoint, remember to update `VITE_DONNY_CHAT_ENDPOINT` so the widget can find it.
