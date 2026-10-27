# TaskList

## Intent

Orients people in a long form that is done in parts, in any order and over several sessions (a client intake, an application). It lists every part with its status and the open part's steps, and lets people move to any of them. Modelled on the GOV.UK task list, placed as a persistent rail beside the form as in Stripe's onboarding view.

## Interaction contract

- Keyboard: Tab moves through parts and the open part's steps; Enter or Space opens one.
- Pointer: the whole row of a part is the target, not just its name.
- Screen readers: a `nav` landmark named by `label`; the step on screen is `aria-current="step"`; each part's status and hint describe its button.
- Status marks: only "In progress" (badge) and "Completed" (check) show. "Not started" is visually hidden so the rail does not repeat the same badge on every untouched part; it still describes the button for screen readers.

## Do / don't

- Do: keep part names short; one-line hints only.
- Do: map the rail 1:1 to the real steps and keep past steps selectable (Baymard: people click step indicators to go back).
- Don't: use it for a short linear flow that must be done in order; a simple "Step 2 of 3" caption is enough there.
- Don't: show a status nobody can act on; "Cannot start yet" is for a part that depends on another.

## Design notes

- Each task's number sits in a circle (--color-muted outline); a completed task's circle fills with --color-success and shows a check instead, so parts that still need work stand out (GOV.UK research). The word "Completed" is visually hidden and stays in the row's description for screen readers; "In progress" shows as a Badge, "Not started" is screen-reader only.
- `unnumbered` leaves a closing task such as "Check and submit" without a number (its space is kept so names line up); later tasks are numbered as if it were not there.
- The open step has a half-strength --color-neutral-bg fill with an 8px radius (--radius-lg); its check uses --color-success.
- Tokens: --color-text, --color-muted, --color-success, --color-surface, --color-border-light, --color-neutral-bg, --radius-lg, --radius-circle, --space-internal-*.
- Figma: not yet built.
