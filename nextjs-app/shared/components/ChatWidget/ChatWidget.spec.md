# ChatWidget

## Intent
Provide a persistent, floating AI assistant for site visitors that
doesn't take up layout space until invoked. ChatWidget is opinionated
on purpose — it owns its endpoint resolution, its storage, its
guardrails, and its email-handoff flow — because every consumer of
"AI chat on a Next.js site" has the same dozen problems to solve.

## Interaction contract
- Keyboard: Tab reaches the floating toggle. Enter / Space toggles
  the panel. Inside the panel, Tab walks composer → send button →
  message list (which is scrollable but not individually
  tab-stoppable). Escape closes the panel.
- Pointer: click on the toggle opens / closes. Click outside the
  panel does *not* close (the panel is non-modal). Click on a
  message bubble does nothing unless it carries an action; the
  email-workflow bubbles expose explicit buttons.
- Screen readers: the toggle's `aria-expanded` reflects state. The
  message log uses `role="log"` with a polite live region and remains
  `aria-busy` while a reply streams, so assistive technology receives
  the completed response instead of repeated partial-text mutations.

## Do / don't
- Do: mount once globally in the layout. The widget is designed for
  a single global instance.
- Do: rely on the env-resolved endpoint for normal use. Override only
  for preview deployments or partner contexts.
- Don't: gate the widget behind user authentication. The widget is
  for anonymous visitors; auth-gated chat is a different pattern.
- Don't: store chat history in cookies. The current storage is
  `localStorage`; cookies have size limits and travel with every
  request, which is wrong for chat transcripts.
- Don't: tamper with the email-workflow reducer state from outside.
  The reducer has invariants (e.g. "review can only follow
  compose") that direct mutation breaks.

## Design notes
- Tokens: toggle uses `Button variant="primary"` with a custom
  fixed-position wrapper. Panel surface uses
  `--color-surface-elevated`; bubbles use `--color-primary-surface`
  (user) and `--color-surface-muted` (assistant). Radius is
  `--radius-lg` for the panel; bubbles use `--radius-md`.
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
- Storage key is `dt-donny-chat-v2`. The migration from
  `dt-donny-chat` is one-way on mount.
- Guardrails are applied via `processConversationWithFlags`, which
  runs after every assistant response and can flip flags (e.g.
  "user is angry" or "user asked for human"). Flags drive UI
  decisions like surfacing the email-handoff prompt.
- The active assistant text part consumes the public `useStreamingText`
  utility. It smooths bursty accumulated chunks for sighted users,
  preserves grapheme clusters, bypasses animation for reduced motion,
  and snaps to the complete response when streaming ends. Historical
  assistant messages and user messages never enter the reveal loop.
