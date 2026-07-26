# Phase 1 Spec: Prove Accessibility (asserted → evidenced)

> Status: spec, 2026-07-26. Parent: [`AGENTIC_DS_FRONTIER_ROADMAP.md`](AGENTIC_DS_FRONTIER_ROADMAP.md) Track A.
> Prereq: Phase 0 (merged #1334). Blocks nothing; unblocks the trustworthy a11y scorers Phase 3 needs.

## Goal

`verificationMode: automated` must provably mean **"a real browser passed this check at commit X on date Y,"** not "a human set a boolean." Today `derive-a11y-criteria.mjs` stamps `automated` purely from hand-set contract booleans (`accessibilityTreeVerified`, `realBrowserForcedColorsVerified`, …) and never reads a test result. This closes that gap: the test result writes the evidence; the contract boolean stops being the source of truth.

## Definition of done

- Every `automated` a11y criterion is backed by a committed evidence record carrying `{passed, sourceSHA, capturedAt}`.
- A criterion whose evidence is missing or stale reports `stale` / `evidence-missing`, not `automated`.
- `check:doc-semantics` counts and gates on real evidence; the ratchet ceiling is driven toward 0 as backfill lands.
- No hard-red on `main` during the migration (staged, ceiling-raised-then-lowered).

## Non-goals (deliberately deferred)

- Phase 2 (validation loop) and Phase 3 (benchmark).
- Web-component evidence: all 87 elements are `beta`, and evidence fields gate at `stable` only. Report, don't enforce, for now.
- Redesigning the AT-snapshot format or the theme matrix.

## Current seams (grounded)

- **Emit:** `.storybook/test-runner.ts` `postVisit` → `captureAccessibilityTree` (≈L324-367) → `scripts/design-system/a11y-snapshot-capture-lib.mjs`. Runs in a real checked-out browser under the run's mode (light/dark via `test:stories:matrix:ci`; forced-colors via `test:stories:hc:ci`). Axe runs via the Storybook a11y addon (`.storybook/preview.tsx` `parameters.a11y.test`), and **its pass/fail is currently discarded** — the AT-snapshot YAML is the only committed test-written artifact.
- **Consume:** `scripts/design-system/derive-a11y-criteria.mjs` `RULES[].mode()` reads `contract.a11y.*` booleans.
- **Enforce:** `scripts/design-system/validate-components.ts` (≈L599-625) is the one existing place that couples a boolean to a committed artifact (`stable` requires `accessibilityTreeVerified === true` AND a matching `__a11y-snapshots__/*.yaml`).
- **Ratchet:** `scripts/design-system/doc-semantics-ratchet.json` (`{ maxUnverifiedA11yCriteriaOnReady: 0 }`), gated by `check:doc-semantics` (`--strict` forces monotonic tightening). Precedent for time-based staleness: `STALE_DAYS = 180` in `check-doc-semantics.mjs`.
- Snapshots: 4309 YAML under `nextjs-app/shared/**/<Component>/__a11y-snapshots__/`, suffixed `""` / `.dark` / `.forced-colors`.

## The evidence record

Written next to each snapshot, one per (story, mode):
`nextjs-app/shared/**/<Component>/__a11y-evidence__/<story-id>.<mode>.json`

```jsonc
{
  "check": "axe-no-violations",        // | accessibility-tree | forced-colors-real-browser | keyboard-contract
  "storyId": "components-button--playground",
  "mode": "forced-colors",             // "" | dark | forced-colors
  "passed": true,
  "axeViolations": 0,                  // detail for axe checks
  "sourceSHA": "f1b8496a7…",           // GITHUB_SHA || git rev-parse HEAD at capture
  "capturedAt": "2026-07-26T15:54:55Z",
  "runner": "test:stories:hc:ci"
}
```

The AT-snapshot YAML already *is* the `accessibility-tree` evidence (a mismatch fails the run); the new records add the axe and forced-colors pass/fail that are presently thrown away, and stamp provenance on all of them.

## Freshness policy (the crux — pick one, PR 1 decision)

An evidence record is valid until the component's source changes under it. Options, cheapest first:
1. **Time window:** `capturedAt` within N days (reuse `STALE_DAYS`). Simple, weak — a stale-but-recent record passes.
2. **SHA ancestry + path guard (recommended):** valid iff no file under the component dir changed after `sourceSHA` (`git log <sha>..HEAD -- <componentDir>` is empty). Precise; costs one git call per component at build time.
3. **Content hash:** record a hash of the component's source; invalidate on mismatch. No git dependency; more to build.

Recommend option 2; fall back to 1 if the build-time git cost is unacceptable.

## Execution: three PRs, one concern each

### PR 1 — Emit (non-breaking, no consumer change)
- In `test-runner.ts` `postVisit`, after AT capture, run axe explicitly (`@axe-core/playwright` against `#storybook-root`) and write the evidence record for the current mode. Reuse the existing dir-resolution (`index.json` `importPath`), same as the snapshot writer, gated by the existing `DT_*_A11Y_SNAPSHOTS` env flags.
- Add the `__a11y-evidence__/` sidecars to the repo; **backfill** by running `test:stories:matrix:ci` + `test:stories:hc:ci` on `main` and committing the records.
- Ship the freshness helper (chosen option) but don't wire it into `derive-a11y-criteria` yet.
- Verify: capture runs green on the farm; records land for every required story; nothing downstream changes.

### PR 2 — Consume (the honest spike)
- `derive-a11y-criteria.mjs`: each `automated` rule consults the evidence record instead of the boolean. Passing + fresh → `automated`; missing/failed/stale → new `stale` / `evidence-missing` mode.
- Rebuild dist (`build:tokens`) and commit (Phase 0 lesson: `check:generated` will fail otherwise).
- In the SAME PR, raise `doc-semantics-ratchet.json` ceiling to the honest current count so the build is green while the real gap is now visible (the point of the phase).
- Verify: `check:doc-semantics` green at the raised ceiling; manifest now shows evidence-backed vs stale honestly.

### PR 3 — Enforce + ratchet down + reclaim the deferred Phase 0 item
- Generalize `validate-components.ts` so every a11y boolean must be backed by a committed evidence record (not just the stable AT-snapshot).
- Begin lowering the ratchet ceiling; `--strict` enforces monotonic progress as backfill completes.
- **Move `test:stories:hc:ci` onto the farm** now that forced-colors evidence is load-bearing (the item deferred in Phase 0), bumping `timeout-minutes` and flagging farm-capacity.
- Verify: full local gate; ceiling strictly below PR 2's number.

Then: ongoing PRs drive the ceiling to 0 as evidence backfills, component by component.

## Risks

- Real-browser axe/AT capture is flaky and slow; batch on the farm, tolerate retries.
- The PR 2 spike looks like a regression — it is the deliverable; communicate that the number going up is honesty, not breakage.
- Build-time git calls (freshness option 2) add cost; measure before committing to it.

## Open decisions

1. Freshness policy (options above) — PR 1.
2. Evidence storage: sidecar JSON (spec'd) vs a metadata header inside the snapshot YAML.
3. Axe capture in the main matrix pass vs a dedicated pass (perf vs simplicity).
4. Backfill scope first: beta/stable only, or all 168.
