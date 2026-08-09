# Extension model (Astryx-gap Phase 5)

Status: **specced, not implemented — by design.** The owner plan
(2026-08-03) gates Phase 5 on a second real consumer existing, and none
does. This spec exists so that consumer #2's arrival triggers execution
instead of design: the surfaces below are defined, their evidence gates
already run, and the open questions are enumerated. Implementing ahead of a
real consumer would produce speculative API shaped by guesswork — the
precise failure mode the gate prevents.

## Thesis

DT's extension model is not a new subsystem. Every sanctioned extension
surface below already half-exists, built for the site's own consumption and
verified by the Phase 4 evidence family. Phase 5 is the act of promoting
those surfaces to a contract a second consumer can rely on, with the same
rule that governs everything else here: a claim ships with the evidence
that measures it.

## Sanctioned extension surfaces

### 1. Brand themes (token overrides)

The pipeline exists end to end: a brand JSON
(`scripts/design-system/themes/<brand>.brand.json`) compiles through
`npm run generate:theme` into a `[data-brand="<brand>"]`-scoped stylesheet
shipped at `@digitaltableteur/tokens-css/themes/<brand>.css` (see the
committed `acme` proof theme). Generation validates every overridden
custom property against the token catalog, so a theme cannot invent
phantom tokens.

Consumer story: install tokens-css, import base tokens + their theme
stylesheet, set `data-brand` on a root element. No component changes.

### 2. Component theming vars

Contracts carry a `theming.vars` field (name, description, default) — the
per-component custom-property channel. The override-evidence gate (INV-2)
already probes every declared var for liveness in real Chromium. The field
is currently **unpopulated fleet-wide (0 declared)**; populating it is the
main pre-consumer work item Phase 5 would schedule, because it defines
which knobs a consumer may turn per component with per-publish proof that
each knob works.

### 3. className overrides

The owner-decided contract (2026-08-07): a consumer's single-class,
no-`!important` selector applied via `className` wins over component base
styles, verified per publish by `audit:override-evidence` (INV-1) against
the documented import order. This is already a consumer-facing guarantee;
Phase 5 only documents it as part of the extension contract.

### 4. Composition

Children, slots, and sub-parts (`subParts`, sub-slot recipes) are the
sanctioned structural extension. The encapsulation matrix (INV-3) guards
the other direction: DS containers must not interfere with what consumers
compose into them, gated against a dated baseline.

## Explicitly out of the model

- Forking components or reaching into internals with descendant selectors
  (the hostile-ancestor evidence exists precisely to catch this class).
- Per-consumer prop-API extension of published components.
- Runtime patching or wrapping of package modules.
- Theme values outside the token catalog (generation rejects them).

## Evidence requirements

Every surface maps to a gate that already runs per publish:

| Surface | Gate |
|---|---|
| Brand themes | catalog validation at generation; open question: per-theme contrast |
| theming.vars | override-evidence INV-2 liveness |
| className overrides | override-evidence INV-1 |
| Composition | encapsulation matrix (INV-3) + sub-slot recipes |

Sketch for a consumer-side verb (not committed API): `dt theme verify
<brand.css>` — validate a consumer theme against the installed catalog and
run the contrast pairs under it, so a consumer can gate their own theme the
way this repo gates its own.

## What consumer #2 must bring before implementation starts

The gate exists so the API is demand-shaped. Before writing any code,
collect from the real consumer:

1. Their brand token set (which of the 13 catalog groups they actually
   need to override — this decides how much of `theming.vars` to populate
   first).
2. Their composition surfaces (which containers they compose into — this
   prioritizes sub-slot recipes and matrix coverage).
3. Their build context (bundler, React version — the compat matrix
   endpoints may need their floor added).

## Open owner questions

1. Theme distribution: additional themes as tokens-css subpaths (the acme
   pattern) vs a per-consumer theme package. Subpaths are simpler; a
   package isolates consumer cadence from token releases.
2. Should `theming.vars` population become a beta/stable promotion
   requirement once the extension contract is live? (Today the honest
   count is zero; a requirement would ratchet it.)
3. Do the WCAG contrast gates run per-theme (each brand proves its own
   pairs) or does the base catalog's proof suffice with themes constrained
   to safe ranges?
