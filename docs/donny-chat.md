# Donny Chat Integration

The client widget expects a single HTTP endpoint that accepts the running conversation and returns your model’s reply. You can implement it with any provider that outputs a string (OpenAI, Anthropic, Vercel AI SDK, etc.).

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_DONNY_CHAT_ENDPOINT` | Overrides the client request URL. Useful if the API lives on another origin. | `/api/chat` |
| `OPENAI_API_KEY` (or provider equivalent) | Access token for your LLM provider. Keep this secret; do not expose it in the browser. | — |

## Minimal Vercel serverless function

```ts
// api/chat.ts (Vercel)
import { Configuration, OpenAIApi } from "openai";

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY }),
);

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { messages = [] } = request.body ?? {};

  const completion = await openai.createChatCompletion({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are Donny, Digitaltableteur’s sales & creative assistant. Be accurate, concise, and grounded in supplied context.",
      },
      ...messages,
    ],
    temperature: 0.3,
  });

  const reply = completion.data.choices[0]?.message?.content ?? "";
  return response.status(200).json({ reply });
}
```

## Using the Vercel AI SDK

The Vercel AI SDK simplifies streaming responses:

```ts
// api/chat/route.ts (Vercel edge runtime)
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "edge";

export async function POST(request: Request) {
  const { messages = [] } = await request.json();

  const result = await streamText({
    model: openai("gpt-4.1-mini"),
    system:
      "You are Donny, Digitaltableteur’s brand ambassador. Keep answers factual and grounded in provided context.",
    messages,
  });

  return result.toAIStreamResponse();
}
```

## Notes

- Layer a retrieval step (e.g., Supabase, Pinecone) before the model to ground answers in portfolio content.
- Apply rate limiting and authentication if the endpoint is public.
- When you change the endpoint URL, update `VITE_DONNY_CHAT_ENDPOINT` and rebuild.***
