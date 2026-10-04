# RFC 0001: Temporal and consequence contracts

- **Status:** Draft, 2026-10-04
- **Target:** Design System Contract 1.1
- **Author:** Petri Lahdelma, [Digitaltableteur](https://www.digitaltableteur.com)
- **Ships as:** `x-temporal` and `x-consequence` extensions, checked by `contract-check` 1.x
- **Schemas:** [`schema/extensions/temporal.schema.json`](../schema/extensions/temporal.schema.json), [`schema/extensions/consequence.schema.json`](../schema/extensions/consequence.schema.json)

## 1. Summary

Design System Contract 1.0 describes what a component accepts, which usages
are wrong, and which accessibility claims are proven. It says nothing about
two things people notice at once:

1. **Time.** When the component changes state on its own, how long a state
   stays valid, and what survives an interruption.
2. **Consequence.** What an action does to the world, and how much friction,
   recovery and authentication that calls for.

This RFC adds one optional block for each. Both follow the rule 1.0 is built
on: nothing an agent or reviewer reads is hand-asserted without saying so.
Every timing rule and every consequence policy is a **claim** with a
verification mode, and an `automated` claim must point at a test the checker
can find.

## 2. Motivation

### 2.1 States without time

A design system documents the loading state, the error state and the empty
state. It rarely documents the transitions between them:

- How long can a request run before the user sees an indicator?
- When does a wait become long enough to acknowledge in words and offer a
  way out?
- How long is cached data shown before it must say it may be out of date?
- When the connection drops mid-flow, what is kept, and what happens when it
  comes back?

These answers end up re-decided per screen, per platform and now per
generated interface. The result is familiar: spinners that flash for 80 ms,
waits of 20 seconds with no explanation, drafts lost on a network blip,
purchases submitted twice on reconnect.

Motion tokens do not cover this. A duration token says how long an animation
takes; it says nothing about when the component must change what it is
telling the user.

### 2.2 Variants without consequence

Buttons come as `primary`, `secondary` and `destructive`. That is a visual
taxonomy. It does not say whether the action can be undone, sends something
to another person, moves money, discloses personal data or changes who
controls an account. Those facts, not the color, should decide:

- whether there is a confirmation, a review step, an undo, or nothing;
- whether the user must re-authenticate;
- how the label and the tone read before activation.

Without a model of consequence, systems default to confirming everything or
nothing. Confirming routine actions is not neutral: people learn to click
through dialogs, and that habit carries over to the ones that matter
(Akhawe and Felt, *Alice in Warningland*, USENIX Security 2013, measured
click-through on browser security warnings in the field).

### 2.3 Why contracts and not guidelines

Both topics already have good guidance. What they lack is a form a machine
can hold an implementation to. An agent generating a checkout flow can read
"show progress after a second" in prose and ignore it. It cannot ignore a
contract whose claim is proven by a test that fails.

## 3. Design principles

1. **Claims, not prose.** Each entry has `verification`: `automated` (a test
   proves it; `test` required), `manual` (a person checked it; `reviewedAt`
   required) or `unverified` (a declared gap). These are the same modes as
   accessibility criteria in 1.0, section 5.
2. **Extension first.** Both blocks ship as `x-` fields. SPEC.md section 3
   requires 1.0 checkers to ignore unknown extensions, so no existing
   contract changes meaning. Promotion to first-class 1.1 fields follows
   section 10.
3. **Small vocabularies.** Six consequence classes, four confirmation
   strengths, eight interruption events. A vocabulary an agent can hold in
   context beats a complete one it cannot.
4. **Named thresholds.** A timing value can name the system-level threshold
   it comes from, so one table can be checked against every contract.
5. **Never lower a level.** In 1.x, extension findings are reported apart
   from the conformance level. A checker MAY offer a strict mode that fails
   on them.

## 4. `x-temporal`

### 4.1 Shape

```json
"x-temporal": {
  "transitions": [ ... ],
  "validity": [ ... ],
  "interruptions": [ ... ]
}
```

Every entry carries the claim fields:

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Kebab-case, unique within the block. |
| `statement` | yes | The claim in one sentence a person can check. |
| `verification` | yes | `automated`, `manual` or `unverified`. |
| `test` | when automated | Repository path of the test that proves the claim. |
| `reviewedAt` | when manual | Date of the review. |
| `guarantees` | no | Any of `no-duplicate-action`, `state-preserved`, `user-confirms-retry`, `announced`. |
| `note` | no | Context that does not fit the statement. |

### 4.2 Transitions

A state change the component makes without new user input.

| Field | Required | Meaning |
|---|---|---|
| `from`, `to` | yes | State names in the component's own vocabulary. |
| `afterMs` | one of | Time spent in `from` before moving to `to`. `0` means on entry. |
| `on` | one of | The event that triggers it when it is not time-based, e.g. `settled`. |
| `threshold` | no | The system threshold `afterMs` comes from. |

### 4.3 Validity

How long a state, or the data it shows, stays valid.

| Field | Required | Meaning |
|---|---|---|
| `state` | yes | The state that ages. |
| `staleAfterMs` | yes | When it stops being valid. |
| `then` | yes | `mark-stale` (keep it, say it may be out of date), `refresh`, `finalize` (an undoable state becomes permanent) or `discard`. |
| `threshold` | no | As above. |

### 4.4 Interruptions

What happens to in-progress state when the flow is interrupted.

| Field | Required | Meaning |
|---|---|---|
| `event` | yes | `connection-lost`, `connection-restored`, `request-failed`, `navigation`, `unmount`, `visibility-hidden`, `user-cancel` or `timeout`. |
| `preserve` | no | What survives, in the component's terms (draft, selection, transcript). |
| `then` | yes | `resume`, `reconcile` (ask the server before acting again), `retry-once` (one automatic retry that cannot duplicate the action), `restart` or `discard`. |

### 4.5 Example

A ticket purchase flow, written once and inherited by design files, web and
native implementations, tests, documentation and generated interfaces:

```json
"x-temporal": {
  "transitions": [
    { "id": "search-shows-progress", "from": "loading", "to": "loading-indicated",
      "afterMs": 1000, "threshold": "indicatorMs",
      "statement": "Search results show a progress indicator once loading passes one second.",
      "verification": "automated", "test": "src/search/Search.temporal.test.tsx" },
    { "id": "search-acknowledges-delay", "from": "loading", "to": "loading-slow",
      "afterMs": 10000, "threshold": "acknowledgeDelayMs", "guarantees": ["announced"],
      "statement": "After ten seconds the delay is acknowledged in words, with a way to cancel.",
      "verification": "automated", "test": "src/search/Search.temporal.test.tsx" }
  ],
  "validity": [
    { "id": "cached-journey-stale", "state": "cached", "staleAfterMs": 120000, "then": "mark-stale",
      "statement": "A cached journey is marked as possibly out of date after two minutes.",
      "verification": "manual", "reviewedAt": "2026-10-01" }
  ],
  "interruptions": [
    { "id": "purchase-survives-disconnect", "event": "connection-lost",
      "preserve": ["basket", "passenger details"], "then": "resume",
      "guarantees": ["state-preserved"],
      "statement": "Losing the connection keeps the basket and passenger details.",
      "verification": "unverified" },
    { "id": "purchase-reconciles-on-reconnect", "event": "connection-restored",
      "then": "reconcile", "guarantees": ["no-duplicate-action", "user-confirms-retry"],
      "statement": "On reconnect the client asks the server for the order state before offering to pay again; a purchase is never submitted twice.",
      "verification": "unverified" }
  ]
}
```

### 4.6 Recommended thresholds

A system SHOULD keep one table of thresholds and have contracts name them.
These defaults come from long-standing response-time research; a system MAY
choose others and SHOULD say why.

| Threshold | Default | Source |
|---|---|---|
| `instantMs` | 100 | Below this a response feels instant (Nielsen, *Response Times: The 3 Important Limits*, 1993). |
| `indicatorMs` | 1000 | Flow holds up to about one second; past it a busy indicator is warranted (same source). |
| `acknowledgeDelayMs` | 10000 | About the limit of attention; past it, say what is happening and offer a way out (same source). |
| `undoWindowMs` | 10000 | Long enough to notice a mistake, short enough not to hold state for long. Prefer undo to confirmation (Raskin, *The Humane Interface*, 2000). |

### 4.7 Checker requirements

A checker that understands `x-temporal`:

- MUST validate the block against the extension schema.
- MUST report an `automated` claim whose `test` does not exist, or whose test
  file does not contain the claim `id`. The id link is deliberate: renaming
  or deleting the test breaks the claim instead of leaving it orphaned.
- MUST report a `manual` claim reviewed outside the freshness window
  (1.0 section 6).
- MUST report duplicate ids within the block.
- MUST let the user set the base directory for `test` paths.

## 5. `x-consequence`

### 5.1 Classes

| Class | Meaning | Floor |
|---|---|---|
| `reversible` | The user can undo it. | recovery `undo` or `inverse-action` |
| `irreversible` | Destroys data or state with no recovery. | confirmation `explicit` |
| `external` | Sends something to another person or system; cannot be recalled. | confirmation `review` |
| `financial` | Commits or moves money. | confirmation `explicit`; authentication `step-up` SHOULD |
| `privacy` | Discloses personal data beyond the user's own view. | confirmation `review` |
| `identity` | Changes credentials, ownership or authentication factors. | confirmation `explicit`; authentication `recent` |

A **floor** is the weakest treatment a class allows. A policy or action below
its floor is a finding.

### 5.2 Treatment vocabulary

| Field | Values, weakest first | Meaning |
|---|---|---|
| `confirmation` | `none`, `review`, `explicit`, `typed` | `review`: the user sees exactly what will happen or be sent before committing. `explicit`: a separate confirming action names the consequence. `typed`: the user types a confirming value. |
| `recovery` | `none`, `undo`, `inverse-action` | `undo`: a time-boxed undo (pair it with an `x-temporal` validity claim). `inverse-action`: a separate action reverses it at any time. |
| `authentication` | `none`, `recent`, `step-up` | `recent`: a sign-in within a short window. `step-up`: re-authenticate for this action. |
| `tone` | system-defined | The tone the triggering control must use. |
| `rule` | rule id | A section 4 usage rule that enforces part of the policy statically. |

### 5.3 Two shapes

**A generic action component** (a Button) does not know what any one usage
does. It declares the prop with which each usage states its class, and the
policy per class:

```json
"x-consequence": {
  "prop": "consequence",
  "policies": {
    "reversible":   { "confirmation": "none", "recovery": "undo" },
    "irreversible": { "confirmation": "explicit", "recovery": "none", "tone": "error",
                      "rule": "button-irreversible-needs-error-tone" },
    "external":     { "confirmation": "review", "recovery": "none" }
  }
}
```

The prop MUST be a union whose values are consequence classes, and every
value MUST have a policy. Policies can be partly enforced with ordinary 1.0
rules, which already run in linters and MCP servers:

```json
{ "id": "button-irreversible-needs-error-tone",
  "when": { "consequence": { "equals": "irreversible" },
            "tone": { "oneOf": ["neutral", "info", "success", "warning"] } },
  "forbid": ["tone"], "severity": "error",
  "reason": "An irreversible action must read as destructive before it is activated." }
```

**A component that owns its actions** (a chat panel with Clear, a form that
sends) declares each action as a verifiable claim:

```json
"x-consequence": {
  "actions": [
    { "id": "clear-undo-window", "class": "reversible",
      "confirmation": "none", "recovery": "undo",
      "statement": "Clear empties the conversation and offers Undo for ten seconds.",
      "verification": "automated", "test": "src/chat/Chat.temporal.test.tsx" }
  ]
}
```

### 5.4 Checker requirements

A checker that understands `x-consequence`:

- MUST validate the block against the extension schema.
- MUST report a policy or action whose treatment is below its class floor,
  and SHOULD warn where the floor recommends more.
- MUST report a `prop` that is missing, not a union, or allows a class with
  no policy.
- MUST report a `rule` reference that names no rule in the contract.
- MUST apply section 4.7's claim checks to each action.

## 6. Constraint provenance (sketch, not specified)

A third block, `x-constraints`, is proposed for a later revision. It would
record why a design decision exists, as intrinsic requirement, current
technical constraint, historical constraint, organizational compromise or
preference, with a machine-checkable condition for when a constraint lifts:

```json
"x-constraints": [
  { "id": "tooltip-not-native", "kind": "technical",
    "statement": "Tooltip uses a JavaScript positioning library because CSS anchor positioning is not yet Baseline widely available.",
    "liftsWhen": { "baseline": { "feature": "anchor-positioning", "status": "widely" } } }
]
```

A checker with Baseline data could then report "constraint lifted, reconsider
the decisions that depend on it" without anyone remembering why the decision
was made. It is left out of this RFC so the first two blocks can be judged on
their own.

## 7. Conformance

While this RFC is a draft:

- `x-temporal` and `x-consequence` never change a contract's 1.0 level.
- A checker SHOULD report extension claim counts by verification mode next
  to the accessibility counts, so a system shows how much of its behavior is
  proven, asserted or a declared gap.
- A checker MAY offer a strict mode that fails on extension findings. The
  reference checker's is `--strict-extensions`.

## 8. Reference implementation

`contract-check` validates both blocks (`src/index.mjs`, `checkExtensions`).
The Digitaltableteur design system uses them on:

- **Button**: `x-temporal` (a pending `clickAction` locks on the same render
  and never fires twice; it returns to idle on resolve or reject) and
  `x-consequence` in prop mode, with two usage rules that make
  `consequence="irreversible"` require `tone="error"`.
- **ChatWidget** (the Donny assistant): a slow-response acknowledgment at
  `acknowledgeDelayMs`, a ten-second undo for Clear (which moves Clear from
  irreversible to reversible), transcript survival across navigation, a
  single retry only for requests that never reached a server, and a kept
  email draft on send failure. The email Send action is declared `external`
  with a `review` confirmation, which its review step provides.

Timing values live in one module (`nextjs-app/shared/lib/temporal.ts`);
each component's temporal test asserts that its contract values match it.
The exported contracts are checked with `--strict-extensions` on every push.

## 9. Open questions

1. **Multiple classes.** Sending a contact form is `external` and, arguably,
   `privacy`. Should `class` accept a list, with the strictest floor winning?
2. **System threshold table.** Should a system publish its thresholds in
   `index.json` so a checker can verify every named `threshold` against one
   table?
3. **Evidence records.** Accessibility claims carry dated, commit-pinned
   evidence. Should automated temporal claims emit the same records instead
   of relying on a test file existing?
4. **Platform differences.** Native platforms have their own conventions
   for progress and undo. Should a claim allow per-platform values?
5. **Runtime observation.** Temporal claims are testable in production
   (how often does the slow-response notice fire?). Should the spec define a
   telemetry name per claim id?

## 10. Promotion to 1.1

The blocks become first-class `temporal` and `consequence` fields in 1.1
when:

1. at least two independent design systems publish contracts using them;
2. the reference checker has implemented section 4.7 and 5.4 for one release
   cycle without breaking changes to the schemas;
3. no valid 1.0 contract becomes invalid or loses a level (SPEC.md section 9).

Until then the `x-` names are the stable interface, and a 1.1 checker MUST
continue to accept them.
