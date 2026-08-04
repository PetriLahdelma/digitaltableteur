# Agent benchmark methodology (Astryx-gap Phase 3)

> Measures whether the design system's agent affordances (contracts, the
> `dt` CLI, the generated registry) change what a coding agent builds — in
> correctness, cost, and design-system reuse — under conditions a skeptic
> can reproduce.

## What is measured

Five task categories, chosen to cover the system's claims: **table**,
**tree**, **migration**, **repair**, **forced-colors**. Each task is a
realistic brief with machine-checkable acceptance
(`scripts/design-system/agent-bench/tasks.mjs`). Per run we record:

- **pass/fail** per acceptance check (the primary outcome)
- **token cost and turns** from the runtime's JSON envelope
- **wall-clock duration**
- **design-system reuse** as a reported metric — never a gate (see
  Fairness)
- **repair-loop convergence**: rounds needed to reach acceptance when the
  automatic validate → guidance → revalidate loop is enabled

## The A/B arms

Both arms get an identical disposable git worktree, the identical TASK.md
brief, the same pinned model, the same turn budget, and the same
permissions. Exactly one thing differs — the workspace `CLAUDE.md`:

- **WITH**: documents the `dt` CLI (search / component / example / validate
  / upgrade / diff), the `@dt/<Name>` import convention, and the guidance to
  reuse and validate.
- **WITHOUT**: generic task rules only.

### The control-condition decision

The control keeps full repository access, including the contract files and
generated registry on disk. We deliberately do **not** delete those
artifacts in the control arm:

1. Deleting them would change the codebase under test — imports break,
   scripts fail, and the arm stops being "the same repo without guidance"
   and becomes a different, broken repo.
2. The claim under test is that the *affordance layer* (discoverability +
   tooling) produces the lift, not that the files' mere existence does. An
   agent in the control arm that finds and exploits the contracts on its own
   is legitimate signal, not contamination.

This is the same framing as the roadmap's Track C ("WITHOUT the `@dt`
discovery affordance, same repo access"). It biases the measured lift
*downward* (the control can stumble into the affordances), so a positive
result under-claims rather than over-claims.

## Fairness rules for acceptance

- Acceptance is **affordance-neutral**: every check tests user-visible
  semantics (roles, aria attributes, rendered content, absence of hardcoded
  hex) or contract conformance of whatever the agent actually used. A
  hand-rolled table with correct `aria-sort` semantics passes the table task
  exactly like a `DataTable` solution.
- Design-system reuse is recorded as a separate **metric**, so "did the
  affordance change what the agent reached for?" is answered without
  contaminating pass/fail.
- Assertion tests are pre-written and shipped to both arms unmodified; the
  brief states they must pass as-is.

## Harness integrity: null and oracle agents

Before any paid run, `npm run agent:bench:selftest` proves every grader
discriminates:

- the **null** agent (does nothing) must FAIL every task
- the **oracle** agent (applies a committed reference solution) must PASS
  every task

A benchmark number from a grader that cannot tell "did nothing" from
"reference solution" is meaningless; this gate runs with zero model spend.

## Runtime, pinning, and metering

The paid arm drives headless Claude Code (`claude -p --output-format json`)
with a pinned `--model` and `--max-turns`, inside the worktree, with
permissions skipped (the worktree is disposable and never merged). Token
usage, turn count, and cost come from the runtime's JSON result envelope.

## Variance and honesty

- LLM runs are nondeterministic: report **distributions over `--reps`**,
  never single figures.
- Results are written to `scripts/design-system/agent-bench/results/` and
  are **not** published to `public/ds-health/` until real multi-rep numbers
  exist. Until then, every number on the public surface stays generated or
  test-backed, per the honesty guardrail.
- The repair loop is part of the system under test: report pass rates both
  before and after repair rounds.

## Running

```bash
npm run agent:bench:selftest                 # graders discriminate, no spend
npm run agent:bench -- --task all --agent oracle          # ceiling check
npm run agent:bench -- --task repair-status-panel \
  --arm both --agent claude --reps 3 --repair-loop        # a real A/B slice
```
