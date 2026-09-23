# EU AI Act site hardening design

Date: 2026-09-23

## Decision

Apply a traceable product-and-evidence hardening pass to the public Donny assistant. The site will identify Donny as an AI assistant before a visitor sends a message, state the main limitations and data boundary at the interaction point, keep browser transcripts for the tab session only, expose policy and problem-reporting routes, mark assistant DOM output as AI-generated, narrow the server prompt's prohibited uses, and keep a feature record with unresolved legal/vendor questions.

This is a risk-reduction implementation, not a conformity assessment, legal opinion, certification, or promise that enforcement can never occur.

## Options considered

1. **Policy-only update.** Fastest, but rejected because Article 50 guidance says a notice hidden in terms or documentation is generally insufficient. It would also leave the policy contradicting `localStorage` behavior.
2. **Interaction controls plus evidence record.** Chosen. It addresses the live user experience, privacy/data behavior, system boundaries, tests, and audit trail without overbuilding a formal high-risk conformity system that does not match the intended use.
3. **Disable the assistant.** Lowest AI-specific exposure, but disproportionate while the assistant remains a narrow, non-decision-making site guide and the material gaps can be fixed directly.

## Intended use and boundary

Donny answers questions about Digitaltableteur's published work, services, site content, and design-system topics. It may navigate to internal pages, show verified site data, prefill or draft user-controlled contact actions, and show a booking interface. It must not impersonate Petri, make binding commitments, rank or profile people, make employment or eligibility decisions, infer emotions or biometric traits, provide regulated professional advice, or execute a contact action without an explicit user review/confirmation step.

On the current facts this is likely outside the Annex I/III high-risk routes. Any change to users, purpose, autonomy, model, data, tools, or law triggers a fresh classification review.

## Interface and data design

- The launcher, dialog title, and first assistant message explicitly say “AI assistant” in English, Finnish, and Swedish.
- The header description warns that replies are automatic and may be wrong.
- A persistent notice before the message log links to the AI-use statement and to an AI-specific problem-report email route, and tells visitors not to enter sensitive personal data.
- Assistant message containers carry machine-readable DOM metadata identifying them as AI-generated text. This is an application-level marker, not a claim that provider-native Article 50(2) marking has been legally validated.
- Chat text is retained in `sessionStorage`, not persistent `localStorage`. Legacy persistent keys are deleted on mount. Clearing the conversation replaces the session record with the localized intro only.
- Token-usage telemetry does not attach raw IP addresses to Sentry events.

## Public statement and evidence

The AI-use statement distinguishes live, unreviewed chat replies from human-reviewed published/client work, records the assistant's intended and excluded uses, describes the session storage behavior, and avoids unsupported blanket claims about every provider contract or every AI output receiving human review.

The repository feature record contains the provisional role/classification decision, data flow, controls, evidence links, AI-literacy topics, incident steps, change triggers, and owner-only items that source code cannot prove (supplier terms, deployment date, provider retention/configuration, and standardized output marking).

## Verification

- Unit tests assert pre-interaction AI identity, policy/report links, session-only storage, legacy persistent-data cleanup, machine-readable assistant-message metadata, and the server prompt's excluded-use rules.
- Existing focused chat, policy-page, typecheck, lint, test, security, and production-build gates run locally.
- A browser pass checks the rendered widget at desktop and mobile widths, keyboard focus order, readable notice placement, and policy links.
