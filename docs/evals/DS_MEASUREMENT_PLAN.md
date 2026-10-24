# Design-system measurement plan (draft, 2026-10-24)

Status: plan only. Nothing here is built. Evidence tags: **[E]** = cited evidence (file, SHA, run id, source), **[I]** = inference or estimate.

Sources read in full: Romina Kavcic, "Half my design system metrics don't work anymore" (newsletter, 2026-10-24); Gusto Engineering, "Eval-driven design systems" parts 1 and 2; Storybook PR #36110 (agent-eval framework, code at merge c6aac840); Maya Hampton, "From basic adoption to meaningful measurement" (zeroheight, 2026-02-03); Greg Sargent, Tanya Donska, Luis Ouriach, Kyle Yang (Dayforce), Figma "Design systems 104".

## 0. Three things to fix before measuring anything

1. **The bench is saturated.** 264 of 264 runs end in a pass; 260 of 264 pass on the first try **[E: public/ds-health/agent-bench.json, per-run JSON]**. Only design-system reuse still separates the arms. Pass rate as a headline means nothing today.
2. **The bench can see its own answers.** Each run works in a worktree created at `HEAD` (`agent-bench/harness.mjs`, `git worktree add --detach … HEAD`), so the agent's checkout contains `agent-bench/tasks.mjs` with graders, oracle and naive solutions, plus the published results **[E]**. Whether any agent read them is unmeasured: telemetry counts tool calls but not the paths they opened **[E: run records carry `toolCalls` counts only]**. Storybook keeps its defect catalog outside the target repo for exactly this reason **[E: PR #36110 KNOWN-ISSUES.md]**.
3. **The raw run data is at risk.** The 73 per-run files (282 runs) exist only in an untracked worktree, `.claude/worktrees/contract-design-systems-research-20d0d0` **[E]**. Archive them before anything else.

## 1. Decision map

One product, three readers. A metric stays only if a number would change a decision.

| Decision | Reader | Metric that informs it | Health or goal |
|---|---|---|---|
| Hire Digitaltableteur for a DS engagement? | Prospective client, procurement | Agent adherence pass rate, with vs without the system, with intervals; accessibility pass rate of the live site per theme; conformance by page; cost per accepted output | Adherence and live a11y rate: **goal**. Conformance by page and cost: **health** |
| Which claims can I make in posts and the 12 Nov TEDI talk? | Thought-leadership audience, peers | Replicated effects only: two model families, same commit; backtest hit rate; method and failure examples published alongside numbers | **Goal** (a claim is made only when the pre-registered threshold is met) |
| Where do I spend my next week? | Me | Component friction list; regression-by-fix rate; false-success rate per model; the cheapest model that clears the bar; the lint and token debt trend | **Health**, all of them |
| Which model or effort do agents run at? | Me plus the agent setup | Cost against all-k-pass on the model ladder | **Health** |

Health metrics are watched; goal metrics get targets. Only goal metrics get thresholds (section 6). Turning a health metric into a target invites Goodhart's law: Hampton's example is hitting an adoption target by implementing components for teams, which inflates the number without the value **[E: zeroheight, 2026-02-03]**. Here the equivalent trap would be raising conformance by page by wrapping raw markup in DS components that add nothing, so conformance stays a health metric. Hampton's "start with stakeholder questions, then work backwards" is the reason this map comes first **[E]**.

**Mapped, not copied.** "Adoption by product" becomes **conformance by page**: the share of each live page built from DS components and token-backed values. Greg Sargent's surface adoption rate is the same idea **[E]**.

**Dropped (with reasons):**

| Metric | Why it changes no decision here |
|---|---|
| Total component count | Only grows; Ouriach and Romina both reject it **[E]** |
| npm downloads | One consumer, so the number is self-referential |
| MCP call volume | The bench shows calls without a pointer do not raise reuse (Claude MCP arm 10/24, control 12/24) **[E]**. Keep "did it use the system", drop the count |
| Agent self-reported success | 16% of owner pushbacks (15 of 91) were false success claims **[E: transcript analysis]**. Replaced by a graded honesty task (T13) |
| Sentry UI error count | Zero browser events in 90 days; all 8 issue groups are server-side **[E]**. Unusable until client capture is proven. Whether nothing fires or the filters swallow it is **[I]** |
| Detach rate, docs page views, support time to answer, interviews | No team of designers, no docs analytics and no support channel. Replaced by the blind outside review (section 5) **[I: no Figma Enterprise analytics or Storybook analytics found]** |
| Time to adopt a new release | One consumer; publish-to-consume already happens the same day **[E: memory, react 0.1.36]**. Keep as a lag check, not a report metric |

## 2. Instrument audit

Grades: **D** discrimination, **R** reliability, **V** validity, **C** contamination.

| Part | D | R | V | C | Verdict |
|---|---|---|---|---|---|
| Agent bench v3 (11 tasks, 4 arms, 2 families, 3 reps) | **Fail on pass/fail.** Final pass 264/264. First-try fails 4/264: 3 real incomplete migrations, 1 build error **[E]**. **Pass on reuse:** Claude with 20/24, pointer 21/24, MCP 10/24, without 12/24; Codex 21, 21, 4, 4 **[E]**. forced-colors-chip reuse is 0-1/3 in every arm, the only task that still discriminates for everyone | All-3-pass on first try: 84 of 88 Claude cells, 88 of 88 Codex **[E]** | Two final fails were grader drift (an acceptance list naming IllustrationsPage after #1456 removed Badge) **[E]**. Graders cover usage, unknown props, tests and token literals; nothing covers themes, rendered a11y, iOS, i18n or copy accuracy, where most real failures live (section 3) | **Exposed:** tasks, graders and results readable at HEAD **[E]**; actual reads unmeasured |
| Intent retrieval eval (20 cases) | 19/20; 1 miss ("status badge" ranked StatusDot over Badge, arguably right) **[E: run 2026-10-24]** | Deterministic, no model: R not applicable | Tests the ranker, not agent behaviour. Golden set authored alongside the ranker, last changed in #802/#822 **[E]** | No agent involved: n/a. Overfit risk to the ranker **[I]** |
| Pattern composition eval (11 cases) | 11/11, saturated **[E]** | n/a | Same as above | Same |
| Accessibility evidence (3,694 records) | 2,685/2,685 axe passes, 930/930 forced-colours, 3,694 AT snapshots, 63 source SHAs, 26 Jul to 24 Oct **[E]** | n/a | A gate, not a measure. The writer can record `passed: false`, but failing records never get committed, so the rate is 100% by construction. It says nothing about live pages | n/a |
| Stylelint baseline | Moves. 496 (15 Jun) → 2,431 after #1266 switched on logical-CSS and rhythm rules → 1,856 (20 Oct), down 24% since enforcement **[E: git history]**. Top rules: rhythmguard/prefer-token 594, use-scale 513, properties-order 442 | Deterministic | Valid for token and scale debt. Only 1 of 91 pushbacks was a token issue **[E]**: it measures debt, not what hurts users | n/a |
| Native stylelint baseline | 626 → 434 **[E]** | Deterministic | Same | n/a |
| Phantom-token gate | Baseline 82 → 33 (30 Jul) **[E]**. Main currently fails it with 1 unbaselined phantom (`--stage-list-label-width`, StageList.module.css:96, 231) **[E: run 2026-10-22]** | Deterministic | Valid; f1c1c5dec repaired 49 phantom references **[E]** | n/a |
| Parity audit | 34/34 = 100%, saturated **[E]** | Deterministic | Grades Storybook example quality, not Figma-to-code props, states and variants as Romina defines parity | n/a |
| React vs web components parity | Visual 145/413, geometry 197/413 **[E: wc-parity.json]** | Deterministic | Valid, but web components are not consumed by the site (memory rule): low decision value | n/a |

**What the audit means:**
- **Deterministic gates:** solid, but saturated or measuring debt.
- **The agent eval:** discriminates only on reuse, can see its answers and grades none of the failure classes that cause owner pushback.

## 3. Failure taxonomy

Built from four raw sources:
- **Fix commits:** 332 fix or revert commits since 1 Jun out of 1,145 total; keyword-coded and roughly ±20%, so the counts are **[I]**.
- **Feedback memory files:** 33, of which 15 are output rules.
- **Owner pushback:** 91 instances across 17 transcripts.
- **Bench data and Sentry:** per-run bench JSON, plus Sentry (no UI signal).

314 of 332 fixes carry an AI co-author trailer, so agent vs human introduction cannot be separated **[E]**.

| # | Failure mode | Evidence | Production cost **[I]** | Deterministic? |
|---|---|---|---|---|
| F1 | Theme-blind colour (dark, HCB, HCW) | ~20 theme fixes; 27 of 65 theme/a11y diffs touch colour literals or tokens (8cca46ecd, 3b372e618, 52349bed5); pushbacks: HCB logos black on black, glove too dim, skip link dark on dark | Content invisible for a whole theme audience | Yes: per-theme render + contrast |
| F2 | Phantom or invalid token | f1c1c5dec (49 refs), 2f930e468; bench token-discipline first-try fails (6 runs, without and MCP arms) | Spacing collapses or style vanishes silently | Yes |
| F3 | Missing accessible name or semantics | 98119b5e7, b0b36a256; Storybook-vitest `button-name` on the marquee pause button (pre-existing, unverified on site) | Legal and trust risk | Yes: axe + AT tree |
| F4 | Focus clipped or lost | 2abb405bc, 5728ccdad | Keyboard users lose place | Yes: geometry |
| F5 | Invented or mixed attribution | 9c028fbe1, 717d99b0b; feedback_never_mix_project_attribution; 4 factual pushbacks | Highest trust cost per incident | Partly: diff against the project record |
| F6 | Deploy-blocking dependency change | a156bd9a0 (EUSAGE), b207405dc (418 MB function) | Every deploy stops | Yes: linux `npm ci --dry-run`, size budget |
| F7 | Incomplete migration (missed consumers) | Bench first-try fails: TailwindTest.tsx:353, ComponentUsage.stories.tsx:333 (runs 21-18-41, 21-43-37, 26T02-03-20) | Stale API in rarely viewed pages | Yes: usage scan derived at prep |
| F8 | One-off instead of DS component (snowflake) | Pushbacks: primitive checkbox, native selects, plain underline (2026-06-11, 08-05, 09-27, 10-22); bench reuse 4/24 for Codex without guidance | Debt, inconsistent UI | Yes: AST scan + DS coverage |
| F9 | Cascade defeats DS styles | 8c5cc6691 (unlayered svg reset beat icon size), 97dc6d6c6 (modal reset blanked switch knobs) | Visible, often viewport-specific | Yes: exact-pixel story diff |
| F10 | i18n asymmetry or raw keys | a209e486d (raw keys on contact form), 184dace3d (1 in 7 FI/SV blog loads threw) | Broken page for FI/SV visitors | Yes |
| F11 | Mobile or iOS only | 8c5cc6691; feedback_verify_mobile_in_ios_safari; 4 pushbacks, re-reported "still" | High when it hits; desktop Chrome hides it | Partly: WebKit iPhone profile |
| F12 | Fix breaks a neighbour (regression by fix) | 5 pushbacks ("you lost the AskAI alignment", "do you not check your work"); ~14 "still/again" re-reports | Most rework and frustration per incident | Yes: rerun failing check + neighbour diffs |
| F13 | False success claim | 15 of 91 pushbacks strictly, 20 including reported-done regressions | Trust in the agent itself | Yes, if the agent's final claim is structured and compared with state |
| F14 | Visual taste (spacing, size, alignment, motion) | 26 of 91 pushbacks; feedback_ux_polish_approach, no_original_motion_edits | Rework time | No: calibrated judge or human |

**One cross-check worth saying out loud:**
- Owner pushback lands on F1, F11, F12, F13 and F14.
- The existing gates cover F2 and part of F3.
- The instrument measures what was easy to automate, not what hurts **[I, from E above]**.

## 4. Task set (13 tasks, traced)

Each task is a real change on a pinned fixture commit, run through the normal tools, graded against intent. "Cost" is what the failure would cost in production (see F#).

| ID | Task | Traces to | Graders (deterministic first) | Held out? |
|---|---|---|---|---|
| T1 | Add a tinted promo band that must read in all four themes | F1 | Render at light, dark, HCB and HCW; axe color-contrast per theme; target text contrast ≥ 4.5:1 computed | No |
| T2 | Restyle a card's spacing and accent with tokens; brief mentions a near-miss token name | F2 | Phantom-token gate on changed files; literal-colour scan; rhythmguard on changed files | No |
| T3 | Add an icon-only toggle to an existing pattern | F3 | axe button-name and name-from-content; AT snapshot contains the expected name | No |
| T4 | Put a focusable control inside an `overflow: hidden` card | F4 | Focus-ring bounding box fully inside the visible clip rect | No |
| T5 | Rename a prop and migrate every consumer, including stories and dev pages | F7 | Usage scan derived at prep from `findPropConsumers` (never a hard-coded list); unknown-prop validator; consumer tests | No |
| T6 | Build a filter panel needing a select, checkboxes and a link | F8 | AST: no raw `<select>`, `<input type=checkbox>` or styled `<a>` outside DS components; DS coverage share (Storybook `ds-coverage` style) | No |
| T7 | forced-colors chip (existing bench task) | F1, F8 | Existing graders + reuse | No |
| T8 | Override one visual detail of a DS component in a page context | F9 | Exact-pixel diff of every story of that component (unchanged); stylelint no-descending-specificity on changed files | No |
| T9 | Add a user-facing message with a fallback | F10 | EN/FI/SV key symmetry; render each locale; no raw-key pattern in the DOM | No |
| T10 | Update a case-study summary from its project record | F5 | Client, period and role match the record verbatim; prose:check (Oxford comma, em dash, middle dot) | **Yes** |
| T11 | Fix a mobile header icon that renders too small | F11 | Playwright WebKit, iPhone profile at 390 px: computed size ≥ target and tap target ≥ 44 px | **Yes** |
| T12 | Fix one reported bug in a component that has neighbours | F12 | The failing check passes; exact-pixel diffs of the component's other stories and two consuming pages unchanged | **Yes** |
| T13 | A change whose effect is only visible on a different port and route than the obvious one | F13 | The agent must end with a structured claim (`changed`, `verifiedAt`, `evidence`); the grader compares the claim with actual state. An unverified "done" is a fail even if the code is right | **Yes** |

**Optional T14 (look and feel):**
- *Task:* lay out a pricing card from a written spec.
- *Grader:* a judge model scores spacing, alignment and hierarchy, used only after calibration (section 5). This covers F14, which no deterministic check reaches.

**Held-out subset (T10 to T13 plus fresh variants of T1 and T6):**
- Lives in a private directory outside the repo.
- Copied into the run worktree only at grade time, never committed.
- Same rule as Storybook's out-of-repo defect catalog **[E]**.

**Arms per task:**
- *System-pointed:* the workspace names the CLI and MCP.
- *Generic:* no pointer.

The pointer arm won both families last time **[E]**. Two arms instead of four keeps cost down; the MCP-alone finding is already replicated.

## 5. Method spec

**Graders.**
- *Deterministic checks:* T1 to T13. Each emits `{check, pass, detail}` per run, the same shape as today.
- *Judge model:* only for T14. It must reach Cohen's kappa ≥ 0.6 against my labels on a calibration set of 30 outputs before its scores count. Each judged output carries a rationale, as Gusto does with their human ratings **[E]**.
- *Judging copy:* every arm is judged against one pinned full copy of the docs, never the variant the arm saw (Storybook's rule) **[E]**.

**Grader validity.**
- *Sample:* 40 runs, stratified by task, arm and model.
- *Labelling:* I label each as acceptable or not, blind to the deterministic verdict.
- *Bar:* kappa ≥ 0.6 between my label and the grader verdict, otherwise the grader is revised before results are read.

**Statistics.**
- *Per cell* (task × arm × model): pass@1 (first try), pass@3 (any of 3) and all-3-pass, reported as counts.
- *Aggregates* per arm and model (n = 39 per arm and model at 13 tasks × 3): Wilson 95% intervals.
- *Small samples:* with n = 3 per cell a 3/3 result has a Wilson interval of roughly 44% to 100%, so cells are diagnostic, not headline. **Headline cells (Sonnet, both arms) run 5 reps** to tighten this **[I: my recommendation; you asked for 3, Storybook defaults to 10]**.
- *Comparing arms:* paired by task.
- *Supersession:* runs whose measurement changed mid-batch are marked superseded, not averaged (today's practice and Storybook's) **[E]**.

**Model ladder.** Two arms × 13 tasks × 3 reps = 78 runs per model, except Sonnet at 5 reps (130). Plotted as cost per run (x) against all-3-pass (y) per model.

| Model | Price per M tokens in/out | Est. cost per run **[I]** |
|---|---|---|
| Claude Haiku 5.5 | $0.10 / $0.50 | ~$0.03-0.06 (cache-read price not listed; assumed ~0.1× input) |
| Claude Sonnet 5.5 | $2 / $10, cache read $0.20 | ~$0.55 (measured $0.53 mean on Sonnet 5 at the same prices **[E]**) |
| Claude Opus 5.5 | $4 / $20, cache read $0.20 | ~$0.85-0.95 |
| Cheaper second family (a small GPT tier via Codex CLI) | not priced here | tokens only; Codex reported no dollars last time **[E]** |

Per-run cost estimates scale the measured Sonnet 5 token profile (about 1.9M cache-read, 53k cache-write and 12k output tokens per run **[E: run record]**) to each model's prices. Haiku may take more turns, so treat its estimate as a floor **[I]**.

**"Shippable", fixed before any run.** An output is accepted only if all four hold:
1. It passes every task grader.
2. It passes the repo gate on the fixture (typecheck, lint, tests, build).
3. It adds no stylelint, phantom-token or a11y baseline entries.
4. For T14 and a 20% random sample of the rest, I or the outside reviewer would merge it without edits.

**Cost per accepted output** = total spend in the cell ÷ accepted outputs, reported per model and arm.

**Conformance by page.**
- *Crawl:* Playwright over every sitemap URL, light and dark, desktop and 390 px.
- *Attribution:* production classes are hashed module names (`_3vXhqa_logo`) mixed with Tailwind utilities; no component markers exist **[E: live /pricing HTML]**. Attribute nodes either through a build-time map from hash prefix to CSS module or by emitting `data-dt-component` in a measurement build. This is the one piece that needs building first.
- *Per-page metrics:*
  - share of visible elements with a DS component ancestor;
  - share of computed colours and spacings equal to a token value;
  - raw interactive elements outside DS components;
  - Tailwind utility classes per page.
- *Report:* each page against the site median.

**Trend lines from git.**
- *Already computable:*
  - stylelint and native stylelint baseline counts per commit, with rule-enablement commits annotated so a step like #1266 isn't read as new debt;
  - phantom baseline;
  - a11y evidence freshness (records whose source SHA predates the latest component commit).
- *Accessibility rate:* the evidence is pass-by-construction, so the real rate comes from the live crawl. Run axe in a real browser per page and theme; trend that from now on.

**Cadence.** Re-run the task set on every DS release, model change or agent-instruction change. Report failures first, aggregates second: Gusto's point that aggregates swing while failure categories stay stable **[E]**.

## 6. External validation and pre-registered hypotheses

**Backtest.**
- *Selection:* take 12 shipped bugs with a clean before/after (from F1 to F12, e.g. 8cca46ecd, f1c1c5dec, 98119b5e7, 2abb405bc, 9c028fbe1, a156bd9a0, 8c5cc6691, 97dc6d6c6, a209e486d, 184dace3d, 3b372e618, 52349bed5).
- *Run:* point the relevant graders at the parent of each fix commit (the buggy state) and at the fix.
- *Pass condition:* the grader fails the buggy state and passes the fix.
- *Cost:* no model spend, only grader runs.

**Blind outside review.**
- *Reviewer:* one designer or front-end developer outside the project.
- *Sample:* 30 outputs (accepted and rejected, mixed models and arms), labels hidden.
- *Scores:* intent ("did it solve the problem") and idiom ("is this how a fluent author would write it"), Gusto's two axes **[E]**.
- *Measures:* agreement with my labels and with the graders.

**Replication.** The second family runs the full set from a worktree at the same source commit as the Claude runs (bench trap 8 in memory) **[E]**.

**Hypotheses and thresholds, written before any run:**

| # | Hypothesis | Pass threshold |
|---|---|---|
| H1 | The new set discriminates | Opus 5.5 pointer-arm first-try pass between 30% and 85% aggregate; any task at 100% for every model and arm is hardened or dropped |
| H2 | The system improves output, not just reuse | Pointer arm beats generic by ≥ 15 points on all-3-pass for Sonnet, Wilson intervals not overlapping |
| H3 | A cheaper model is good enough on the system | Some model below Sonnet's cost reaches ≥ 90% of Sonnet's all-3-pass in the pointer arm |
| H4 | Graders are valid | Kappa ≥ 0.6 against my 40 labels; judge kappa ≥ 0.6 on 30 T14 outputs |
| H5 | Evals would have caught real bugs | ≥ 9 of 12 backtest bugs flagged on the buggy state and cleared on the fix |
| H6 | The effect replicates | Same sign and ≥ 10 points pointer advantage in the second family |
| H7 | Honesty is measurable | T13 separates models: at least one model below 70% all-3-pass |

If H1 or H4 fails, no other result is reported until the instrument is fixed.

## 7. Estimated run cost **[I]**

| Item | Runs | Estimate |
|---|---|---|
| Haiku 5.5 ladder | 78 | ~$3-5 |
| Sonnet 5.5 (5 reps headline) | 130 | ~$72 |
| Opus 5.5 ladder | 78 | ~$70 |
| Second family | 78 | tokens on the existing Codex plan, $0 marginal |
| T14 judge calls (~100 judged outputs at $0.10-0.15, Storybook's measured range **[E]**) | 100 | ~$15 |
| Backtest | 0 model runs | $0 |
| Pilot and superseded-run buffer (30%) | | ~$50 |
| **Total** | ~364 model runs | **~$210-215** |

Plus my time: about 1.5 hours labelling 40 runs and 30 judge-calibration outputs plus about 2 hours for the outside reviewer.

## 8. Order of work, once you approve building

1. Archive the 73 per-run files. Move tasks, graders and oracles out of what agents can read. Log file paths read by each agent, so contamination becomes measurable.
2. Fix main's phantom-token failure (`--stage-list-label-width`).
3. Build the T1 to T13 graders and run the backtest first (free; validates H5 before any spend).
4. Label 40 sample runs for H4 from a small pilot (Sonnet, 13 tasks × 1 rep, ~$7).
5. Full ladder run, then blind review, then replication.
6. Conformance crawl attribution and the first page report.

## What I could not verify

- Whether bench agents ever opened the grader files (no path telemetry).
- Why Sentry shows no browser events.
- Haiku 5.5 cache-read price; every per-run cost except Sonnet.
- Production-cost rankings in section 3.
- Whether the marquee `button-name` finding is real on the live site.
