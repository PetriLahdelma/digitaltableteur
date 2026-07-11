# Full design-system consumption mandate

> Owner decision, 2026-07-10. This document is the governing target for how the
> site consumes the design system. It supersedes any earlier framing of the
> current partial consumption as an acceptable end state. Related plans:
> [dogfooding-plan.md](dogfooding-plan.md) (goal 1 execution),
> [npm-consumer-setup.md](npm-consumer-setup.md) (consumer mechanics).

## The mandate

1. **Every component must be in the design system.** No raw HTML, no
   non-design-system components in the app. (Enforced today by the dogfooding
   ratchet: raw-element and Tailwind-utility counts only go down.)
2. **Every component must be in the `@digitaltableteur/react` npm package** —
   atoms, molecules, organisms, and patterns alike — and the app must consume
   them from the registry like any external consumer.
3. **Everything else comes through the packages too**: tokens, CSS custom
   properties, and theme sheets via `@digitaltableteur/tokens` /
   `@digitaltableteur/tokens-css`; utilities and hooks (`cn`, theme,
   translation, toast, animation runtimes) via `@digitaltableteur/react`.
4. **No exceptions.** There is no category of UI, style, or utility that is
   exempt from consumption through the design system.

## The gap-closure method

When a piece of the current site cannot be reproduced with the design-system
version of a component, the resolution is **always API extension, never a
bespoke survivor**:

- Identify the visual/behavioral delta between the site element and the DS
  component (the canonical example: a button on the site that does not look
  like DS `Button`).
- Design the missing props, variants, or tokens that would let the DS
  component render that exact appearance, following the locked API
  conventions (variant × tone, `sm/md/lg`, `surface`, unprefixed booleans).
- Land the extension as an additive stable change with the full evidence
  bundle (contract, stories with plays, unit + axe tests, 4-mode AT
  snapshots, controls audit) — TextInput's `clearable`/`hideLabel` (#1054) is
  the exemplar.
- Switch the site element to the DS component and verify **100 % visual
  parity** against the pre-change rendering.
- Repeat per divergent element until none remain.

One blessed exception: **semantic inline text markup** (`<em>`, `<strong>`,
`<abbr>`, and kin) inside DS `Text`/`Title` children is content semantics,
not a component, and does not count as raw-HTML debt.

## Engineering prerequisites (sequenced program)

1. **Pilot** (do first, one component end-to-end): export one self-contained
   stable pattern (candidate: HeroSection), make the RSC-safe build change,
   publish, switch one page to registry consumption, prove the loop.
2. **RSC-safe package build**: dist is currently blanket `"use client"`;
   per-module directive preservation is required so server-renderable
   components stay server-safe when the blog's RSC paths switch.
3. **Export surface expansion**: the 77 production-used components not yet
   exported (pattern/organism tier + stragglers) join the public API in
   batches; app-coupled dependencies (booking config, content, analytics) are
   injected through the existing provider/adapter layer.
4. **Publish→consume automation**: one command/workflow for bump → publish →
   install → checks → consume PR; remove the react-version embedding from AT
   snapshots so consume bumps stop requiring recaptures. Without this, full
   consumption makes iteration unbearable (~20 min + PR per change today).
5. **Import switch + guard ratchet**: flip app imports page by page;
   `check:package-registry-resolution` graduates from classifying local
   imports to forbidding them, driving the allowlist to zero. Full
   consumption dissolves the dual-module-instance problem (#1019), so the
   dual-provide adapter entries collapse on their own.
6. **Token/utility closure**: `app/globals.css` consumes
   `@digitaltableteur/tokens-css` instead of the local `variables.css`;
   remaining local utility imports move to package exports.

## Status ledger

| Milestone | State |
|---|---|
| Goal 1 ratchet (raw elements / Tailwind lines) | running, 303 / 699 baseline |
| Components consumed via npm in prod | 2 of 131 (Button, Icon) |
| Package-exported but locally consumed | 52 |
| Not yet exported | 77 |
| Pilot | not started |

Update this ledger in every PR that advances the program.
