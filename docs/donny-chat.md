# Donny Chat Integration

The Donny widget streams assistant replies with the [Vercel AI SDK](https://ai-sdk.dev/docs) using the [OpenAI provider](https://ai-sdk.dev/providers/ai-sdk-providers/openai). The client posts UI messages to a Vercel serverless function which streams back UI message parts in real time.

## Environment variables

| Variable                   | Purpose                                                                                                                     | Default / Notes                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `VITE_DONNY_CHAT_ENDPOINT` | Overrides the client request URL. The production build points to `https://digitaltableteursecureproxy.vercel.app/api/chat`. | `/api/chat` in custom deployments                                          |
| `OPENAI_CHAT_MODEL`        | Optional override for the OpenAI chat model.                                                                                | `gpt-4o-mini` (derived from `AI_GATEWAY_MODEL` if prefixed with `openai/`) |
| `AI_GATEWAY_MODEL`         | Legacy model hint. If present the `openai/` prefix is stripped and reused.                                                  | —                                                                          |
| `OPENAI_API_KEY`           | Pulled from the `digitaltableteur_secure_proxy` Vercel project via `vercel env pull`.                                       | —                                                                          |

> Run `vercel env pull .env.local` whenever the secure proxy secrets change so local development keeps using the deployed credentials.

## Vercel serverless handler (Node runtime)

```ts
// api/chat.ts
import type { IncomingMessage, ServerResponse } from "http";
import { convertToCoreMessages, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const allowedOrigins = [
  "https://digitaltableteur.com",
  "https://www.digitaltableteur.com",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5176",
  "http://localhost:3001",
];

const systemPrompt = `You are Donny, Digitaltableteur’s sales & creative assistant. Stay concise, accurate, and grounded in the provided context.`;

const resolveModelId = () => {
  const explicit = process.env.OPENAI_CHAT_MODEL?.trim();
  if (explicit) return explicit;
  const candidate = process.env.AI_GATEWAY_MODEL?.trim();
  if (candidate?.startsWith("openai/"))
    return candidate.slice("openai/".length);
  return candidate || "gpt-4o-mini";
};

export default async function handler(
  req: IncomingMessage & {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  },
  res: ServerResponse,
) {
  const origin = req.headers?.origin;
  const corsOrigin = allowedOrigins.includes(origin ?? "")
    ? origin
    : allowedOrigins[0];
  res.setHeader("Access-Control-Allow-Origin", corsOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Missing OpenAI API key" }));
    return;
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const json = chunks.length ? Buffer.concat(chunks).toString("utf8") : "{}";
  const { messages = [] } = JSON.parse(json) as { messages?: unknown };

  if (!Array.isArray(messages)) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "messages must be an array" }));
    return;
  }

  const openai = createOpenAI({ apiKey });
  const result = await streamText({
    model: openai(resolveModelId()),
    system: systemPrompt,
    messages: convertToCoreMessages(messages),
    temperature: 0.3,
    maxRetries: 1,
  });

  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Transfer-Encoding", "chunked");

  await result.pipeUIMessageStreamToResponse(res);
}
```

## Notes

- The handler returns a [UI message stream](https://ai-sdk.dev/docs/ai-sdk-ui/ui-message-stream) that the `useChat` hook consumes.
- The widget falls back to `https://digitaltableteursecureproxy.vercel.app/api/chat` when running on `digitaltableteur.com` or `localhost`. Set `VITE_DONNY_CHAT_ENDPOINT` to point elsewhere if you host the API on another origin.
- Conditioning and retrieval can happen before `streamText` (fetch context, call tools, inject memory, etc.).

## Markdown Rendering

The chat widget now supports GitHub-flavored Markdown (GFM) for assistant and user messages via the `MarkdownMessage` component, powered by `react-markdown` + `remark-gfm`.

Security / sanitization:

- Raw HTML is currently disabled (`skipHtml`).
- Links receive `rel="noopener noreferrer"`.
- Code blocks and inline code are styled with design tokens.

Fallback behavior:

- While a streamed assistant reply is still forming, the widget renders a translated fallback (e.g. `chatThinking`).
- Once any text segment arrives, markdown parsing applies incrementally to the accumulated text.

Extensibility:

- Enable raw HTML or custom components by extending `MarkdownMessage` with rehype plugins when needed.
- For syntax highlighting, integrate a light-on-weight solution (e.g. refractor or a tokenizing highlighter) inside the code component override.

## Dynamic Component Tokens

The assistant can embed dynamic UI components inside streamed markdown by emitting special bracket tokens. Currently supported:

| Token              | Renders                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `[[openHours]]`    | The `<OpenHours compact />` component with live "open now" badge                               |
| `[[servicesGrid]]` | The `<ServicesGrid />` 2x2 capability icon grid (Design, Development, Strategy, AI Innovation) |

Guidelines:

- Tokens should appear on their own line or surrounded by blank lines for clearer layout, but inline usage is also supported.
- Multiple occurrences in a single message are allowed.
- Unknown tokens are left as plain text (future enhancement: whitelist enforcement before rendering).
- Unknown tokens are left as plain text (future enhancement: whitelist enforcement before rendering).
- `[[servicesGrid]]` renders four localized capability labels: `servicesGrid.titles.design`, `servicesGrid.titles.development`, `servicesGrid.titles.strategy`, and `servicesGrid.titles.aiInnovation`.
- Deduplication: Only the first `[[servicesGrid]]` token in an assistant message is rendered; subsequent occurrences in the same message are ignored. Heuristic injection will also not fire if an explicit token already rendered in that message.

Model Prompting Tips:

- Availability: _"When the user asks about our availability or operating times, include the token [[openHours]] where the schedule should appear."_
- Capabilities overview: _"When the user asks about what we offer or our capabilities, you may include [[servicesGrid]] to show a quick capability grid."_

## Availability Indicator

### High Contrast Styling (Accessibility)

For users on high contrast themes (e.g. `themeHCB` or OS forced colors) the Services Grid icon wrappers now use a transparent background with the icons colored via `var(--color-primary)`. This avoids white-on-white (or similar) collisions where both background and foreground previously resolved to the same forced color.

Updated CSS:

```
.iconWrapper { background: transparent; color: var(--color-primary); }
.iconWrapper svg { color: var(--color-primary); }
```

Impact:

- Preserves sizing, spacing, and layout semantics
- No new design tokens introduced (compliant with design system policy)
- Improved legibility in high contrast / forced color modes

Action Items after change:

- Refresh visual regression baselines: `npm run test:visual -- --updateSnapshot`
- Confirm icon visibility manually in high contrast mode

The chat header shows a minimal 8px circular availability indicator instead of a badge to reduce visual noise while preserving status context.

Implementation details:

- CSS classes: `.availabilityDot`, `.availabilityDotOpen`, `.availabilityDotClosed`.
- Colours derive from existing success/error tokens; no new colour variables introduced.
- Tooltip & accessibility: `title` + `aria-label` use `chatOpenTooltip` / `chatClosedTooltip` translation keys per locale.
- Logic unchanged: Finnish business hours (Europe/Helsinki) Mon–Fri 09:00–15:00 determine open/closed.

Future enhancements could expose a hoverable popover with next opening time or integrate with the `OpenHours` component inline.
