# TaskList

## Intent

Orients people in a long form that is done in parts, in any order and over several sessions (a client intake, an application). It lists every part with its status and the open part's steps, and lets people move to any of them. Modelled on the GOV.UK task list, placed as a persistent rail beside the form as in Stripe's onboarding view.

## Interaction contract

- Keyboard: Tab moves through parts and the open part's steps; Enter or Space opens one.
- Pointer: the whole row of a part is the target, not just its name.
- Screen readers: a `nav` landmark named by `label`; the step on screen is `aria-current="step"`; each part's status and hint describe its button.

## Do / don't

- Do: keep part names short; one-line hints only.
- Do: map the rail 1:1 to the real steps and keep past steps selectable (Baymard: people click step indicators to go back).
- Don't: use it for a short linear flow that must be done in order; a simple "Step 2 of 3" caption is enough there.
- Don't: show a status nobody can act on; "Cannot start yet" is for a part that depends on another.

## Design notes

- Completed reads as plain text with a check, so parts that still need work stand out (GOV.UK research).
- Statuses use Badge; the check uses Icon.
- Tokens: --color-text, --color-muted, --color-border-light, --color-neutral-bg, --space-internal-*.
- Figma: not yet built.
