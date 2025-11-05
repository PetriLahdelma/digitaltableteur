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

## Dynamic Component Injection Architecture

Dynamic components are no longer injected directly inside the `ChatMessages` component via inline heuristics. Instead, the pure transformer `messageProcessor.ts` produces a normalized array of `ProcessedMessage` objects that drive rendering.

Current transformation rules:

| Rule | Applies To | Effect |
| ---- | ---------- | ------ |
| Explicit token `[[openHours]]` | Assistant messages only | Splits the message into text and `<OpenHours compact />` parts, preserving surrounding text segments |
| Heuristic open hours mention (regex) | Assistant messages only | Appends a single `<OpenHours compact />` component after the full text when the token is absent |
| Explicit token `[[servicesGrid]]` | Assistant messages only | Injects a single `<ServicesGrid />` component (first token only) interleaved with surrounding text |
| Heuristic services mention (regex) | Assistant messages only | Appends a single `<ServicesGrid />` when no explicit servicesGrid token was provided |
| Any explicit token in user message | User messages | Token is stripped; no component injection (prevents privilege escalation) |

Why the refactor:

1. Separation of concerns – presentation (`ChatMessages`) now renders declarative parts, while parsing / business rules live in a testable pure module.
2. Deterministic behavior – avoids duplicate or conflicting heuristics; easier to extend with new component types.
3. Security & policy – user messages cannot coerce privileged UI components (guard enforced centrally).

Extensibility path:

- Add a new token constant and branch inside `processMessage`; return a `component` part with a unique `name`.
- Update the renderer switch in `ChatMessages` to handle the new component name.
- Provide unit tests in `messageProcessor.test.tsx` covering token split, heuristic fallback, and user token stripping.
- Add integration tests (`ChatMessages.<component>.test.tsx`) for assistant vs user rendering.
- Maintain translation coverage for any new user-facing labels surfaced by the component.

Reinstated behavior:

`[[servicesGrid]]` and its heuristic were previously removed to simplify the UI, but have been reintroduced to allow the assistant to surface a concise overview of core service offerings contextually. Injection rules mirror OpenHours: assistant-only, single component per message via either explicit token or heuristic.

Prompting guidance (current):

- Availability questions: the model may include `[[openHours]]` or rely on heuristic language ("opening hours", "business hours", etc.).
- Services overview requests: instruct the model to include `[[servicesGrid]]` or mention "services we offer" / "our services" naturally to trigger heuristic injection.
- Avoid redundant tokens; the processor will ignore additional `[[servicesGrid]]` occurrences after the first.

Anti-abuse considerations:

- User-provided tokens are sanitized (removed) before rendering.
- Only whitelisted component names are rendered; unknown names are ignored silently.
- Heuristics trigger only for assistant role ensuring users cannot phrase-bomb injections.

Testing strategy:

- `messageProcessor.test.tsx` validates transformation logic (token splitting, heuristic injection, user stripping) for both OpenHours and ServicesGrid.
- `ChatMessages.openHours.test.tsx` & `ChatMessages.servicesGrid.test.tsx` validate integration-level rendering (assistant vs user roles).
- Visual baselines should be refreshed if `<OpenHours />` or `<ServicesGrid />` layout changes: `npm run test:visual -- --updateSnapshot`.

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
