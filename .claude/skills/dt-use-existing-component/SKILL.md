---
name: dt-use-existing-component
description: >-
  Find and reuse existing @dt design-system components before creating new UI.
  Use when the user asks which component to use, wants to avoid duplicating
  UI, needs import guidance, or says "reuse component", "what should I use for",
  "find component", "dogfood audit", or "existing primitive for".
metadata:
  version: 1.0.0
  category: design-system
---

# Reuse existing @dt components

## Rule

**Search the catalog before creating UI.** Digitaltableteur is AI-readable but not yet AI-native — contracts validate governance; usage evidence tells you what is proven in production.

## Step 1: Rank by intent

```bash
npm run find-component -- "dismissible warning banner with action"
npm run find-component -- --json "primary loading button"
```

Prefer matches with:
- higher score
- `productionImportCount > 0`
- `status: stable` or `beta` over `alpha`

## Step 2: Inspect manifest evidence

```bash
npm run build:tokens   # refreshes agent-manifest.json with usage scan
npm run audit:usage    # human-readable top consumers
npm run audit:usage -- --json
```

Open `nextjs-app/shared/foundations/dist/agent-manifest.json`:
- `usageCoverage` — fleet-wide stats
- `components[].usage` — `publicImport`, `evidence[]`, import counts
- `components[].agent` — generated props, variants, useWhen/avoidWhen, replacementFor

Or read `component-agent-blocks.json` directly after `npm run build:agent-blocks`.

## Step 3: Read contract + spec

For the chosen component `<Name>`:

1. `nextjs-app/shared/components/<Name>/<Name>.contract.json` (or `patterns/`)
2. `<Name>.spec.md` — Intent, Do/don't, Interaction contract
3. `<Name>.stories.tsx` — canonical props (until prop schema is generated in contract v2)

**Import policy:** always `@dt/<Name>` — see `docs/PUBLIC_API.md`.

## Step 4: Validate choice

```bash
npm run validate:components
npm test -- <Name>
```

If no catalog match fits, escalate to [`dt-design-system`](./dt-design-system/SKILL.md) to scaffold — do not drop in raw `<button>`, headings, or shadcn duplicates.

## Usage vs stable consumers

| Field | Purpose |
|-------|---------|
| `manifest.components[].usage` | All statuses — auto-scanned import evidence for agents |
| `contract.consumers[]` | **Stable promotion only** — shipping-product proof |

Do not treat empty `consumers[]` on beta components as "unused".

## Anti-patterns

- Raw `<h1>`–`<h6>`, `<p>`, styled `<button>` when `Title`, `Text`, `Button` exist
- `@/components/ui/*` when an `@dt/*` equivalent exists
- Hand-rolling layout spacing instead of `Stack`, `Row`, `Grid`, `Container`

## Related

- [`dt-design-system`](./dt-design-system/SKILL.md) — create/modify components
- `docs/PUBLIC_API.md` — import surface and verification commands
