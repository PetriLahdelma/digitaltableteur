# Donny Chat Integration

The Donny widget now streams assistant replies with the [Vercel AI SDK](https://ai-sdk.dev/docs), [AI Gateway](https://vercel.com/docs/ai/vercel-ai-gateway), and MCP-enabled tool calling. The browser component uses `useChat` and posts UI messages to a Vercel serverless function. That function orchestrates Gateway calls, executes local tools (open hours, services, contact card), and proxies any MCP servers defined in `mcp.json`. Responses are streamed back to the UI as `UIMessage` chunks.

## Environment variables

| Variable                   | Purpose                                                                                                                     | Default / Notes                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `VITE_DONNY_CHAT_ENDPOINT` | Overrides the client request URL. Production builds point to `https://digitaltableteursecureproxy.vercel.app/api/chat`.     | `/api/chat` in custom deployments                                          |
| `AI_GATEWAY_API_KEY`       | API key created inside Vercel AI Gateway. Required by both the Node and Edge handlers.                                      | Pulled via `vercel env pull .env.local`                                    |
| `AI_GATEWAY_URL`           | Optional override when routing through a private Gateway deployment.                                                        | `https://ai-gateway.vercel.sh/v1/ai`                                       |
| `AI_GATEWAY_MODEL`         | Preferred Gateway model identifier (`provider/model`).                                                                      | `openai/gpt-4o-mini`                                                       |
| `OPENAI_MODEL`             | Legacy shorthand (e.g. `gpt-4o-mini`). Used only when `AI_GATEWAY_MODEL` omits the provider prefix.                         | —                                                                          |

> Run `vercel env pull .env.local` whenever the secure proxy secrets change so local development keeps using the deployed credentials. MCP servers reuse the same env file via `mcp.json`.
> CORS automatically trusts private-network dev servers (e.g. `192.168.x.x:5173`, `10.x.x.x`) and `.local` hosts, so you can test on real devices without editing the allowlist.

## Vercel serverless handler (Node runtime)

```ts
import type { IncomingMessage, ServerResponse } from "http";
import { convertToModelMessages, streamText } from "ai";
import {
  createGateway,
  GatewayAuthenticationError,
  GatewayInvalidRequestError,
  GatewayModelNotFoundError,
  GatewayRateLimitError,
} from "@ai-sdk/gateway";
import {
  buildSystemPrompt,
  createCorsHeaders,
  resolveGatewayModelId,
  validateMessages,
  ChatApiError,
} from "./chat-shared";
import { getDonnyTools } from "./donny-tools";

const gatewayProvider = createGateway({
  baseURL: process.env.AI_GATEWAY_URL?.trim(),
  apiKey: process.env.AI_GATEWAY_API_KEY?.trim(),
});

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  Object.entries(createCorsHeaders(req.headers?.origin)).forEach(
    ([key, value]) => res.setHeader(key, value),
  );

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const body = await readJsonBody(req);
    validateMessages(body.messages);
    const tools = await getDonnyTools({ enableMcp: true, allowStdio: true });
    const system = buildSystemPrompt(Object.keys(tools));

    const result = await streamText({
      model: gatewayProvider(resolveGatewayModelId()),
      tools,
      system,
      messages: convertToModelMessages(body.messages as any[]),
      temperature: 0.2,
      maxRetries: 2,
    });

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Transfer-Encoding", "chunked");

    await result.pipeUIMessageStreamToResponse(res);
  } catch (error) {
    const normalized = normalizeError(error);
    if (!res.headersSent) {
      res.statusCode = normalized.status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: normalized.message }));
    } else {
      res.end();
    }
  }
}

const readJsonBody = async (req: IncomingMessage) => {
  if (req.body !== undefined) {
    if (typeof req.body === "string") return JSON.parse(req.body);
    if (Buffer.isBuffer(req.body))
      return JSON.parse(req.body.toString("utf8"));
    if (typeof req.body === "object" && req.body !== null) return req.body;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(
      typeof chunk === "string"
        ? Buffer.from(chunk, "utf8")
        : Buffer.from(chunk),
    );
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const normalizeError = (caught: unknown): ChatApiError => {
  if (caught instanceof ChatApiError) return caught;
  if (GatewayAuthenticationError.isInstance(caught)) {
    return new ChatApiError(502, "AI Gateway auth failed.");
  }
  if (GatewayRateLimitError.isInstance(caught)) {
    return new ChatApiError(429, "AI Gateway rate limit reached.");
  }
  if (
    GatewayInvalidRequestError.isInstance(caught) ||
    GatewayModelNotFoundError.isInstance(caught)
  ) {
    return new ChatApiError(
      400,
      "The AI Gateway rejected this payload. Check the model + request body.",
    );
  }
  if (caught instanceof Error) {
    console.error("Chat handler error", caught);
    return new ChatApiError(500, "Unexpected server error.");
  }
  console.error("Chat handler non-error throw", caught);
  return new ChatApiError(500, "Unknown error");
};
```

## Notes

- The handler returns a [UI message stream](https://ai-sdk.dev/docs/ai-sdk-ui/ui-message-stream) that the `useChat` hook consumes.
- The widget falls back to `https://digitaltableteursecureproxy.vercel.app/api/chat` when running on `digitaltableteur.com` or `localhost`. Set `VITE_DONNY_CHAT_ENDPOINT` to point elsewhere if you host the API on another origin.
  Conditioning and retrieval can happen before `streamText` (fetch context, call tools, inject memory, etc.).
- Tool calling is enabled through `api/donny-tools.ts`. Static helpers (`studio.openHours`, `studio.services`, `studio.contactCard`) are always present; MCP servers listed in `mcp.json` are loaded when available (SSE/HTTP everywhere, STDIO-only on the Node runtime).

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

## Styling & Layout Notes (Nov 2025 Update)

The chat widget migrated physical directional properties to logical equivalents:

- `margin-left` -> `margin-inline-start`
- `margin-right` -> `margin-inline-end`
- `border-left` -> `border-inline-start`
- Paired zero values consolidated: `margin-inline: 0`

This supports future RTL adaptation and enforces the defensive CSS rule set in the stylelint configuration. Gap fallbacks continue to rely on logical start margins to emulate spacing when `gap` is unsupported.

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

## Chat Email Workflow Triggers (Dual Path)

Two trigger modes for the email composition workflow:

| Type           | EN Example   | FI Example          | SV Example     | Phrase Key              | Behavior                                           |
| -------------- | ------------ | ------------------- | -------------- | ----------------------- | -------------------------------------------------- |
| General intent | "Send email" | "Lähetä sähköposti" | "Skicka epost" | `chatEmailSendPhrase`   | Assistant acknowledges & offers to compose         |
| Simple keyword | "email"      | "sähköposti"        | "epost"        | `chatEmailSimplePhrase` | Assistant reveals address then invites composition |

Regex for simple keyword is anchored to avoid accidental mid-sentence activation. Only one flag (`pendingEmailWorkflowGeneral` or `pendingEmailWorkflowSimple`) can be set per user message. Assistant consumes the flag next turn and resets it.

Update this file, README, `CLAUDE.md`, and `.github/copilot-instructions.md` together when altering trigger semantics.

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
