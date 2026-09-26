# Agent benchmark methodology (Astryx-gap Phase 3)

> Measures whether the design system's agent affordances (contracts, the
> `dt` CLI, the generated registry) change what a coding agent builds (in
> correctness, cost, and design-system reuse) under conditions a skeptic
> can reproduce.

## Versions

- **v1 (2026-08, 90 runs, archived at `public/ds-health/agent-bench-2026-08.json`).**
  Two arms, five tasks. Saturated: both arms passed about 100%, so the only
  measurable lift was cost and design-system reuse. Runs loaded the
  operator's user-level Claude configuration (global CLAUDE.md, skills,
  plugins, MCP servers) in both arms: symmetric, but not reproducible by a
  third party.
- **v2 (2026-09, current).** Three arms (adds MCP), eight tasks (adds three
  discriminating tasks), isolated runs, per-run tool telemetry, and a
  naive-solution integrity check. Numbers from v1 and v2 are not pooled.

## Results, v2 (2026-09-25)

96 published runs (8 tasks, 4 arms, n=3), claude-sonnet-5, isolated.
Artifact: `public/ds-health/agent-bench.json`.

- **An MCP server is only as good as the pointer to it.** Attached alone:
  called in 3 of 24 runs, DS reuse 4/18 (control: 6/18). Plus one line
  naming it: called in 22 of 24 runs (4.7 calls each), DS reuse 15/18, level
  with documenting the CLI (WITH 14/18). The client defers MCP tools behind
  a tool search; an agent not told the server exists rarely looks. Cost of
  the pointer: about $0.10 more per run.
- **Pass rates saturated.** First-try pass 23 to 24 of 24 in every arm; the
  v2 tasks did not separate the arms for this model, and no run in any arm
  used an undefined token.
- **Two grader bugs were caught mid-batch** (a stale hardcoded consumer
  list; a colour scan that flagged `var(--color-white)`), fixed, guarded in
  the selftest, and the affected tasks re-run in all arms. The superseded
  runs are recorded in the artifact, not dropped silently.

Next increments worth running: harder tasks (multi-component composition,
cross-file refactors) so pass rates separate, and a second model family.

## What is measured

Eight task categories, chosen to cover the system's claims: **table**,
**tree**, **migration**, **repair**, **forced-colors**, and since v2
**tokens**, **dialog** and **form**. Each task is a realistic brief with
machine-checkable acceptance (`scripts/design-system/agent-bench/tasks.mjs`).

The v2 tasks target failure modes coding agents actually show, because the
v1 tasks no longer separated the arms:

- **tokens**: style a card with the design tokens. Acceptance fails any color
  literal and any `var(--name)` the design system does not define (a
  *phantom token*: an invented, plausible name such as `--spacing-md`, which
  the browser silently drops). Mean phantom references per run are
  reported.
- **dialog**: a delete confirmation with focus moved in, background
  unreachable, Escape and Cancel returning focus to the trigger.
- **form**: errors exposed as each field's accessible description,
  `aria-invalid`, and focus on the first invalid field.

Per run we record:

- **pass/fail** per acceptance check (the primary outcome)
- **token cost and turns** from the runtime's JSON envelope
- **wall-clock duration**
- **design-system reuse** as a reported metric, never a gate (see
  Fairness)
- **tool use** (v2): a per-run histogram of tool calls from the runtime's
  stream, including MCP tool calls and `dt` CLI invocations, so "did the
  agent use the affordance at all?" is answered by data
- **repair-loop convergence**: rounds needed to reach acceptance when the
  automatic validate → guidance → revalidate loop is enabled

## The arms

Every arm gets an identical disposable git worktree, the identical TASK.md
brief, the same pinned model, the same turn budget, and the same
permissions. Exactly one thing differs, how the design system is offered:

- **WITH**: the workspace `CLAUDE.md` documents the `dt` CLI (search,
  component, example, validate, upgrade, diff), the `@dt/<Name>` import
  convention, and the guidance to reuse and validate.
- **MCP** (v2): the workspace `CLAUDE.md` is the generic control text, and
  the repository's own stdio design-system MCP server
  (`scripts/design-system/ds-mcp-stdio.ts`) is attached. The server's tool
  descriptions and instructions are the whole affordance. This is the arm
  any design system can reproduce: it measures what shipping an MCP server
  buys, with no workspace prompt engineering.
- **MCP + POINTER** (v2): the MCP arm plus one line in the workspace
  `CLAUDE.md`: "This repository's design system is available through the
  `design-system` MCP server; use its tools to find components and validate
  usage before finishing." Isolates whether the agent knows the server
  exists.
- **WITHOUT**: generic task rules only.

Note on the MCP arm: the runtime lists MCP tools as deferred (loaded on
demand through its tool search) when many tools are present. An agent that
is not told the server exists has to decide to look. That is the default
client behaviour and it is what the arm measures; the tool telemetry shows
how often the agent looked.

## Isolation (v2)

Paid runs pass `--strict-mcp-config` and `--setting-sources project,local`.
The operator's user-level CLAUDE.md, skills, plugins, hooks and MCP servers
never reach the agent; only the repository under test (its project settings
and files) does. A probe run confirmed the difference: without the flags the
agent reported the operator's global instructions and skills in context;
with them it reported neither. Runs use the operator's Claude subscription
login, so `--bare` (API-key only) is not used.

### The control-condition decision

The control keeps full repository access, including the contract files and
generated registry on disk. We deliberately do **not** delete those
artifacts in the control arm:

1. Deleting them would change the codebase under test: imports break,
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
- the **naive** agent (v2 tasks: applies a committed plausible-but-wrong
  solution, for example invented token names with safe fallbacks, or a
  dialog with correct roles but no focus management) must FAIL. This proves
  a task discriminates beyond "did nothing".

A benchmark number from a grader that cannot tell "did nothing" from
"reference solution" is meaningless; this gate runs with zero model spend.

## Runtime, pinning, and metering

The paid arm drives headless Claude Code (`claude -p --output-format
stream-json --verbose`; the final result envelope carries the metering)
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
npm run agent:bench -- --task all --arm mcp --agent claude \
  --reps 3 --repair-loop                                  # one arm; arms can run as parallel processes
node scripts/design-system/agent-bench/aggregate.mjs \
  --out public/ds-health/agent-bench.json results/<files>  # publish
```
