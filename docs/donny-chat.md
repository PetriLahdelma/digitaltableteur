# Donny Chat Integration

The Donny widget streams assistant replies with the [Vercel AI SDK](https://ai-sdk.dev/docs) using the [OpenAI provider](https://ai-sdk.dev/providers/ai-sdk-providers/openai). The client posts UI messages to a Vercel serverless function which streams back UI message parts in real time.

## Environment variables

| Variable                   | Purpose                                                                                                                     | Default / Notes                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `VITE_DONNY_CHAT_ENDPOINT` | Overrides the client request URL. The production build points to `https://digitaltableteursecureproxy.vercel.app/api/chat`. | `/api/chat` in custom deployments                                          |
| `OPENAI_CHAT_MODEL`        | Optional override for the OpenAI chat model.                                                                                | `gpt-4o-mini` (derived from `AI_GATEWAY_MODEL` if prefixed with `openai/`) |
| `AI_GATEWAY_MODEL`         | Legacy model hint. If present the `openai/` prefix is stripped and reused.                                                  | —                                                                          |
| `OPENAI_API_KEY`           | Pulled from the `digitaltableteur_secure_proxy` Vercel project via `vercel env pull`.                                       | —                                                                          |
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
  Conditioning and retrieval can happen before `streamText` (fetch context, call tools, inject memory, etc.).

## Markdown Rendering

The chat widget supports GitHub-flavored Markdown (GFM) for assistant and user messages via the `MarkdownMessage` component, powered by `react-markdown` + `remark-gfm`.

Security / sanitization:

- Raw HTML is disabled (`skipHtml`).
- Links receive `rel="noopener noreferrer"`.
- Code blocks and inline code are styled with design tokens.

Fallback behavior:

- While a streamed assistant reply is still forming, the widget renders a translated fallback (e.g. `chatThinking`).
- Once any text segment arrives, markdown parsing applies incrementally to the accumulated text.

Extensibility:

- Enable raw HTML or custom components by extending `MarkdownMessage` with rehype plugins when needed.
- For syntax highlighting, integrate a light-on-weight solution (e.g. refractor or a tokenizing highlighter) inside the code component override.

## Dynamic Component Injection Architecture (User-Triggered Model)

Dynamic components are injected based solely on preceding USER messages. Assistant self-heuristics have been disabled for tighter control and predictability.

Current transformation rules (messageProcessor.ts / processConversation):

| Rule                                                                                       | Applies To     | Effect                                                                                                          |
| ------------------------------------------------------------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------- |
| User message containing `[[openHours]]` token OR open hours heuristic keywords (EN/FI/SV)  | User           | Sets a pendingOpenHours flag; user-facing text is sanitized (token removed).                                    |
| User message containing `[[servicesGrid]]` token OR services heuristic keywords (EN/FI/SV) | User           | Sets a pendingServices flag; user text sanitized (token removed).                                               |
| Next assistant message when pendingOpenHours=true                                          | Assistant      | Assistant text sanitized (removes token + leading keyword) and `<OpenHours compact />` appended. Flag reset.    |
| Next assistant message when pendingServices=true                                           | Assistant      | Assistant text sanitized (removes token + leading keyword) and `<ServicesGrid />` appended. Flag reset.         |
| Multiple triggers in same user message                                                     | User/Assistant | Both components injected in the immediate subsequent assistant reply, each sanitizing relevant keywords/tokens. |
| Tokens/keywords in assistant message without pending flag                                  | Assistant      | Ignored entirely; rendered as plain text.                                                                       |

Sanitization details:

- User messages: explicit tokens stripped; keywords retained (for transparency) unless they are part of the token phrase.
- Assistant messages (when injecting): explicit tokens and the first occurrence of the leading keyword (open hours / aukioloajat / öppettider, services / palvelut / tjänster) are removed so only the component visually represents the concept.
- Keywords inside assistant text when no injection flag exists are preserved (no surprise deletions).

Heuristic keyword coverage (user role only now):

- Open hours EN: open hours, business hours, closing time, opening time, hours of operation, operating times
- Open hours FI: aukioloajat, aukioloaika, sulkemisaika, avaamisaika, tänään auki
- Open hours SV: öppettider, öppet, stängningstid, öppningstid, dagens öppettider
- Services EN: services, capabilities, offerings, what do you offer, what services do you provide
- Services FI: palvelut, palveluja, palveluita, mitä tarjoatte, palvelunne
- Services SV: tjänster, era tjänster, vad erbjuder ni, erbjudanden

Security & policy:

- Users cannot force immediate multi-response injection; only the following single assistant message consumes pending flags.
- Tokens in user input are never echoed back.
- Assistant cannot self-inject by echoing tokens or phrasing heuristics—flags must originate from user role.

Extensibility:

1. Add new token + regex to user trigger section in `messageProcessor.ts` (update `USER_*_PATTERN`).
2. Introduce pending flag logic inside `processConversation`.
3. Append new component part in assistant branch when flag true; perform token/keyword sanitization.
4. Update renderer switch in `ChatMessages.tsx`.
5. Add unit tests (processor) + integration tests (ChatMessages) for user-token, user-keyword, and assistant sanitization scenarios.
6. Refresh visual baselines if layout shifts: `npm run test:visual -- --updateSnapshot`.

Testing strategy (updated):

- `messageProcessor.test.tsx` covers user-trigger flagging and assistant sanitization across EN/FI/SV.
- `ChatMessages.openHours.test.tsx` + `ChatMessages.servicesGrid.test.tsx` ensure components render only after a user trigger and confirm keyword/token removal from assistant output.
- Visual regression suite ensures UI stability after component insertion changes.

## Storybook WIP Badge Policy

All Storybook stories render with a persistent, localized WIP badge (using the shared `Badge` component) to indicate the story is under active review. This badge remains until you explicitly opt out inside a story definition:

```ts
export const Example = {
  parameters: { wip: { disabled: true } },
};
```

Removal criteria:

1. Accessibility audit passes (`npm run test:a11y`).
2. Visual regression baseline is intentional and updated (`npm run test:visual -- --updateSnapshot` if needed).
3. Translation coverage includes any new user-facing copy for EN/FI/SV.

Workflow note: The WIP badge uses the translation key `storybookWipBadge` so ensure all locales define it.

Prompting guidance (model alignment):

- Encourage users to ask directly (e.g., “What are your opening hours?” / “Mitkä ovat aukioloajat?” / “Vilka är öppettiderna?” or “List your services”).
- Avoid instructing the assistant to emit tokens; they are user-facing triggers only.

Anti-abuse controls:

- Only whitelisted component names can appear; dynamic `name` values are ignored.
- Pending flags consumed immediately—prevents unbounded component repetition.
- Sanitization removes potentially confusing duplicated semantic prefaces in assistant replies.

Recent change highlight:

- Removed assistant-side heuristics & token parsing.
- Added assistant sanitization (Finnish/Swedish/English keywords + tokens) upon injection.
- Updated tests to assert absence of keywords/tokens post-sanitization.

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
- Logic unchanged: Finnish business hours (Europe/Helsinki) Mon–Fri 09:00–17:00 determine open/closed.

Future enhancements could expose a hoverable popover with next opening time or integrate with the `OpenHours` component inline.

## Focus Behavior

When the chat widget is opened, the textarea in the composer auto-focuses for immediate typing. Implementation notes:

- `ChatComposer` exposes a `focusInput` method via `forwardRef` / `useImperativeHandle`.
- `ChatWidget` holds a `composerRef` and calls `focusInput` inside a `requestAnimationFrame` after opening to ensure the DOM is laid out.
- Accessibility: autofocus is intentional and improves efficiency; screen readers announce cursor placement within the composer. Consider a future user setting to disable if requested.
- Tests: a dedicated focus test asserts the textarea receives focus after toggle (with a `scrollTo` feature guard for jsdom environment).

Fallback / safety:

- If `scrollTo` is unsupported (jsdom), the widget falls back to setting `scrollTop` directly before focusing.
- Focus method checks instance existence to avoid race condition errors.
