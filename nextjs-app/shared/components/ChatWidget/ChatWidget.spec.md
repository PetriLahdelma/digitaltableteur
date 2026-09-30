# ChatWidget

## Intent

Provide a persistent, floating AI assistant for site visitors that
doesn't take up layout space until invoked. ChatWidget is opinionated
on purpose — it owns its endpoint resolution, its storage, its
guardrails, and its email-handoff flow — because every consumer of
"AI chat on a Next.js site" has the same dozen problems to solve.

## Interaction contract

- Keyboard: Tab reaches the floating toggle. Enter / Space opens the panel
  and focuses the composer. Tab follows the rendered controls; Shift+Tab
  reaches the transcript and header. Escape closes and restores launcher focus.
- The visually hidden open-state launcher is excluded from Tab and the
  accessibility tree. Moving focus out of the nonmodal panel closes it without
  stealing focus from the destination, so background controls stay unobscured.
- Pointer: click on the toggle opens / closes. Click outside the
  panel closes it (the panel is non-modal). Click on a
  message bubble does nothing unless it carries an action; the
  email-workflow bubbles expose explicit buttons.
- Screen readers: the toggle's `aria-expanded` reflects state. The
  message log uses `role="log"` with a polite live region and remains
  `aria-busy` while a reply streams, so assistive technology receives
  the completed response instead of repeated partial-text mutations.
- Each conversation turn has a visible speaker label and a named group.
- While streaming, the composer remains focusable and read-only; Stop response
  interrupts generation without closing the conversation. Scrolling back through
  older messages suspends automatic following until the user returns to the end.
- The panel scrolls as a whole when space is short, including at 320×256 CSS
  pixels with text-spacing overrides. No minimum panel height exceeds the viewport.
- When consent is unresolved in a viewport no taller than 480 CSS pixels,
  the closed launcher participates in document flow instead of floating over
  navigation. It remains reachable without requiring a cookie choice.

## Do / don't

- Do: mount once globally in the layout. The widget is designed for
  a single global instance.
- Do: rely on the env-resolved endpoint for normal use. Override only
  for preview deployments or partner contexts.
- Don't: gate the widget behind user authentication. The widget is
  for anonymous visitors; auth-gated chat is a different pattern.
- Don't: store chat history in cookies or persistent `localStorage`.
  The current storage is `sessionStorage`, so the browser copy ends with the
  tab session and never travels with a request.
- Don't: tamper with the email-workflow reducer state from outside.
  The reducer has invariants (e.g. "review can only follow
  compose") that direct mutation breaks.

## Design notes

- Tokens: toggle uses `Button variant="primary"` with a custom
  fixed-position wrapper. The opaque panel uses
  `--main-body-background-color` and `--radius-xl`; text and controls use
  semantic theme tokens so background content cannot bleed through them.
- Figma: https://www.figma.com/design/digitaltableteur/chat-widget
  — closed, open, streaming, and email-workflow frames.
- Endpoint resolution lives in `resolveChatApiEndpoint`:
  1. Explicit `endpoint` prop wins.
  2. `VITE_DONNY_CHAT_ENDPOINT` env var second.
  3. For trusted hosts (`digitaltableteur.com`, subdomains) or
     local-like hosts (localhost, 127.0.0.1, RFC1918), use
     `${origin}/api/chat`.
  4. Otherwise fall back to the public production endpoint.
- Email workflow is a separate reducer (`emailWorkflowReducer`)
  with states `idle | compose | field:<key> | review | send`.
  Each state has its own UI sub-component (`ComposePrompt`,
  `FieldPrompt`, `ReviewSummary`, `SendStatus`) so the main widget
  stays lean.
- Storage key is `dt-donny-chat-v2` in `sessionStorage`. Persistent
  `localStorage` values from `dt-donny-chat-v2` and `dt-donny-chat` are
  deleted on mount rather than migrated.
- The open panel identifies Donny as an AI assistant before the first user
  message, keeps a limitations/data notice visible, and links to the AI-use
  statement and problem-reporting route.
- Assistant message containers expose `data-ai-generated="true"`,
  `data-ai-output-type="text"`, and `data-ai-system="donny"`. These are
  application metadata, not a substitute for validating any standardised
  provider-level content-marking obligation.
- Guardrails are applied via `processConversationWithFlags`, which
  runs after every assistant response and can flip flags (e.g.
  "user is angry" or "user asked for human"). Flags drive UI
  decisions like surfacing the email-handoff prompt.
- The active assistant text part consumes the public `useStreamingText`
  utility. It smooths bursty accumulated chunks for sighted users,
  preserves grapheme clusters, bypasses animation for reduced motion,
  and snaps to the complete response when streaming ends. Historical
  assistant messages and user messages never enter the reveal loop.
