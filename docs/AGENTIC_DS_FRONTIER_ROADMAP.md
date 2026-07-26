# The Provenance Loop: Roadmap to an Industry-Leading Agentic Design System

> Status: strategy draft, 2026-07-26. Grounded in a file-level audit of the current pipeline.
> Related: [`AGENT_READINESS.md`](AGENT_READINESS.md), [`AI_READY_DS_BENCHMARK.md`](AI_READY_DS_BENCHMARK.md), [`DS_AUTOMATION_STRATEGY.md`](DS_AUTOMATION_STRATEGY.md), [`DESIGN_SYSTEM_MCP.md`](DESIGN_SYSTEM_MCP.md), [`AGENTIC_DS_CASE_STUDY.md`](AGENTIC_DS_CASE_STUDY.md).

## 0. The thesis

Everyone shipping an "agentic design system" today, Meta's Astryx included, is doing one thing: **serving documentation to an agent.** Dense docs, an MCP `search`/`get` surface, JSDoc composition hints. It is one-directional publishing. The catalog talks; the agent reads; nobody checks whether either side is telling the truth.

The frontier nobody has planted a flag on is the **closed provenance loop**:

> Nothing an agent reads about this design system is hand-asserted. Every claim is either **generated from source** or **backed by a committed, timestamped test artifact**. The agent can **validate its own output** against those same machine-checkable rules. And a **published benchmark** proves the lift, with numbers a skeptic can reproduce.

We will not out-scale Meta (13,000 apps, 8 years, StyleX). We can out-*architect* them: the contract as a live guarantee instead of a document. Depth of the machine-readable contract, not breadth of adoption.

## 1. Why these three, and the shared root cause

The audit found that all three flagship ideas are blocked or hollow for the **same reason**: the contract's machine-checkable substance is thinner than it looks.

- **Accessibility is asserted, not proven.** `derive-a11y-criteria.mjs` stamps a criterion `verificationMode: automated` purely from a **hand-set boolean** on the contract (`accessibilityTreeVerified`, `realBrowserForcedColorsVerified`, etc.). It never reads a test result, SHA, or timestamp. The only criterion that actually re-verifies evidence is `keyboard-contract` via `check:keyboard-delegation`. Worse, the derived criterion advertises `check: "npm run test:stories"`, a script that **does not exist** in `package.json`.
- **The validation rules barely exist.** `validate_component_usage` can check `propRelationships` (mutually-exclusive / requires), but those are generated into the manifest for only **3 of 168** components. `forbiddenUse` exists on 162/172 contracts but as **free-text prose**, unreadable by a machine and not consumed by the validator. So a public validator would return `ok: true` for almost everything: false assurance.
- **The benchmark is 0% built.** `agent:eval` is fully deterministic, drives no LLM, and measures the DS's own metadata. There is no agent-builds-something harness and no token metering anywhere in the repo.

So this is not three parallel projects. It is one program with a dependency order:

```
  Phase 0  Cheap credibility fixes (remove the seam-level lies)
     │
  Phase 1  Track A: Prove accessibility        ─┐
           + enrich machine-checkable rules      │  these produce the
     │                                            │  trustworthy signals
  Phase 2  Track B: The validation loop        ─┘  that Track C scores
     │
  Phase 3  Track C: The published benchmark
```

Track C's scorers **are** the outputs of Tracks A and B. Build the foundation before the proof.

## 2. The positioning we can defend

Publicly, not "we are beyond Meta." Say the true, novel thing:

> Astryx is validated at a scale nobody can touch, but the contract it exposes to agents is authored JSDoc hints, a dense doc mode, and a two-tool MCP. We push the contract itself further: accessibility claims generated from real browser test evidence with source provenance, a validation loop that rejects agent code violating the contract, and a published benchmark that measures the build-quality lift. The contract as a proof, not a document.

This survives someone reading both repos. The moment we claim maturity our own `agent-manifest.json` `dsharpParity` block denies ("breadth is close, maturity is not"), we hand a skeptic the counterargument. Lead only on what is true and novel.

---

## Phase 0: Cheap credibility fixes (do first, days not weeks)

These are small, high-trust corrections the audit surfaced. They cost little and remove embarrassing seams before we build on top.

1. **Fix the phantom check reference.** `derive-a11y-criteria.mjs` emits `check: "npm run test:stories"`; no such script exists. Point it at the real `test:stories:*` family (or add a `test:stories` alias). An agent that follows our own advice currently runs a command that fails.
2. **Correct stale path references.** `validate-components.ts` and `contract.schema.v2.json` error strings still reference `packages/react/__a11y-snapshots__/…` and `pnpm test:stories`; snapshots actually live under `nextjs-app/shared/**/__a11y-snapshots__/` (4309 YAML files) and we use npm.
3. **Move the doc-semantics ratchet onto CI.** `check:doc-semantics` and the forced-colors pass `test:stories:hc:ci` run only in `.husky/pre-push` and a weekly cron, never on the per-PR farm (`.github/workflows/pr-validation.yml`). The authoritative honesty gate is off the critical path. Add both to farm PR validation.

## Phase 1 / Track A: Prove accessibility (asserted → evidenced)

**Goal.** A criterion is `automated` only when a real browser proved it at a known commit. The evidence artifact, not a human, sets the boolean.

**Current reality (grounded).**
- Emit seam: `.storybook/test-runner.ts` `postVisit` → `captureAccessibilityTree` (via `scripts/design-system/a11y-snapshot-capture-lib.mjs`) already runs axe and forced-colors in a real checked-out browser, then **discards** the axe pass/fail. The AT-snapshot YAMLs are the *only* committed artifact a test writes.
- Consume seam: `derive-a11y-criteria.mjs` `RULES[].mode()` reads booleans.
- Enforce seam: `validate-components.ts:581-634` is the one place already coupling a boolean to a committed artifact (a `stable` component needs `accessibilityTreeVerified === true` **and** a matching snapshot YAML). This is the proven pattern to generalize.
- Ratchet: `doc-semantics-ratchet.json` = `{ maxUnverifiedA11yCriteriaOnReady: 0 }`, monotonic-down, `--strict` forces tightening. It reads 0 today only because everything is trusted-automated.

**The build.**
1. **Emit an evidence record.** At the `postVisit` seam, write `__a11y-evidence__/<story-id>.<mode>.json` next to each snapshot: `{ check, storyId, mode, passed, axeViolations, sourceSHA, capturedAt, runner }`. This is the missing `{passed, SHA, timestamp}` artifact.
2. **Flip the consumer.** `derive-a11y-criteria.mjs` returns `automated` only when a fresh evidence record backs the claim; otherwise a new `stale` / `evidence-missing` mode (reuse the `STALE_DAYS = 180` precedent for freshness against `sourceSHA`/`capturedAt`). Booleans stop being the source of truth; they become derived from evidence.
3. **Generalize the enforcement.** Extend the `validate-components.ts:605` pattern so every a11y boolean must be backed by a committed evidence record, not just the stable-tier snapshot check.
4. **Let the ratchet do the work.** Flipping the consumer will spike `unverifiedOnReady` above 0. That is correct and honest: it exposes how many "automated" claims were never proven. Drive it back down component-by-component as real evidence lands, `--strict` enforcing monotonic progress.

**Definition of done.** `verificationMode: automated` provably means "a browser passed this at commit X on date Y." The ratchet is green from evidence, not trust. Gates run on the farm (Phase 0.3).

**Risk.** Real-browser AT/axe capture is flaky and slow; batch on the farm, tolerate retries. Expect the honesty spike in step 4 to look like a regression; frame it as the point.

**Effort.** Medium. The emit/consume/enforce seams all already exist; this is wiring evidence through them, not new infrastructure.

## Phase 2 / Track B: The validation loop (docs → guardrail)

**Goal.** An agent's proposed component usage is validated against the contract, publicly and in CI, and violating code cannot merge.

**Current reality (grounded).**
- The public HTTP handler (`create-consulting-mcp-handler.ts`) **deliberately omits** `registerDesignSystemMcpTools`; the public surface is consulting tools + `search`/`get` only. `validate_component_usage` is stdio-only.
- `executeValidateComponentUsage` (`executors.ts:326-431`) has two modes: a raw-UI **regex** scan and a structured `propRelationships` check that needs a **pre-structured props object** (no JSX parsing).
- **The blocker is coverage, not plumbing:** `propRelationships` exist for 3/168 components; `forbiddenUse` is prose; no gate anywhere parses JSX props of DS components (`lint:dt-usage` was reduced to a single import-policy rule).
- **Security:** the `filePath` branch honors absolute paths (arbitrary server-side file read if exposed); rate limiting is weak in-memory; `authentication.required` is `false`; `Access-Control-Allow-Origin: *`.

**The build (coverage first, then expose).**
1. **Enrich machine-checkable rules.** This is the real prerequisite. Broaden AST-derived `propRelationships` in `build-component-agent-blocks.ts` beyond discriminated unions, and add a **structured `forbiddenCombos`** schema field to the contract (replacing/augmenting prose `forbiddenUse`) so combinations are machine-checkable. Target coverage measured and ratcheted like catalog coverage.
2. **Build a JSX-props extractor.** Use `ts-morph` (already a dependency) to turn `<Button href=… submits />` into `{component, props}` for the structured check. Both the public tool and the CI gate need this.
3. **Ship a hardened public validator.** Register a variant on the public handler with **real zod input schemas** (the empty-schema path silently strips args), **no `filePath` parameter**, a `snippet` size cap, and durable rate limiting. Advertise it in the server card; decide `authentication.required`.
4. **Add the CI gate.** New `validate:agent-usage` script (walk changed files, extract DS-component JSX, fail on `contractFindings`) wired into `release-gate.mjs` and farm PR validation.

**Definition of done.** An agent can POST proposed JSX to `/mcp` and get real contract violations back; the same check blocks merges; rule coverage is high enough that `ok: true` means something.

**Risk.** Coverage (step 1) is the long pole and the credibility gate; do not expose the public validator until coverage is real, or we ship false assurance. Accepting code snippets publicly is an abuse surface; the `filePath` removal and input caps are non-negotiable.

**Effort.** Large, concentrated in step 1 (rule enrichment across 168 contracts).

## Phase 3 / Track C: The published benchmark (claims → numbers)

**Goal.** Public, reproducible numbers: agent build correctness, token cost, and a11y pass, with vs without our MCP.

**Current reality (grounded).**
- `agent:eval` is deterministic metadata scoring; the A/B agent harness is net-new.
- Reusable scorers already exist: `validate_component_usage` (Track B), the automated a11y criteria (Track A), `typecheck`/`lint`/`build`, `canonicalExamples` and story sources as reference outputs, and the `golden-intents.json` / `golden-patterns.json` fixtures.
- A public proof page already exists: `app/design-system/agent/page.tsx` ("Public proof surface…"), plus `public/ds-health/*.json` artifacts. Natural home for live numbers.
- Naming collision: "golden/eval/benchmark" all mean static ranking tests today; namespace the new one (e.g. `agent:bench:build`).

**The build.**
1. **Define the task suite.** N realistic build briefs ("dismissible warning banner with an action", etc.) with machine-checkable acceptance built from Track A + B scorers.
2. **Build the A/B harness.** Drive a pinned coding-agent runtime twice per task: **WITH** the stdio DS MCP, **WITHOUT** the `@dt` discovery affordance (same task, same repo access). Designing a genuinely fair control condition is the methodological crux; document it.
3. **Instrument token cost.** Net-new; capture per-run input/output tokens from the runtime.
4. **Score and report variance.** Pinned model versions, multiple runs, report distributions not single figures (every current repo number is byte-reproducible; a live-model benchmark is not, so honesty means variance).
5. **Publish.** Live scored numbers on `app/design-system/agent/page.tsx`, backed by a `public/ds-health/agent-bench.json` artifact.

**Definition of done.** A public page shows measured lift with methodology and variance a third party can reproduce.

**Risk.** LLM nondeterminism, recurring model cost (not in any CI budget today), and control-condition fairness. Under-claim: a modest, honest, reproducible number beats an impressive unreproducible one.

**Effort.** Large, and gated on Tracks A and B for trustworthy scorers.

---

## The honesty guardrail (applies to all phases)

- Every generated field keeps its `docOrigin` provenance. Extend it with source SHA + generator version + timestamp so freshness is queryable.
- Do not let marketing outrun tooling. Until a claim is evidenced or machine-checked, it is labeled `authored`/`unverified`, visibly.
- The `dsharpParity` candor in the manifest is a feature. Keep publishing what is *not* yet mature.

## Suggested first PR (smallest shippable increment)

Phase 0 in one PR: fix the phantom `test:stories` check reference, correct the stale `packages/react` paths, and add `check:doc-semantics` + `test:stories:hc:ci` to farm PR validation. Small, verifiable against the local gate, and it makes every later claim land on honest ground.

## Open decisions for you

1. **Public validator auth.** Keep `/mcp` open (`authentication.required: false`) for the validation tool, or gate it? Affects abuse surface and adoption.
2. **`forbiddenUse` migration.** Replace prose with structured `forbiddenCombos`, or keep prose and add the structured field alongside? Affects 162 contracts.
3. **Benchmark runtime and budget.** Which agent runtime do we pin, and what recurring model spend is acceptable for Track C?
4. **Publish cadence.** One external blog post at the end, or build in public across the phases?
