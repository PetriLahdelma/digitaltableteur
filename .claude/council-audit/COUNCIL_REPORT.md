# LLM Council Audit: Digitaltableteur Design System & Frontend Code

**Scope:** `nextjs-app/shared/` (design system, ~150 components, 47 patterns, tokens) + build/config + repo hygiene.
**Source:** local dev build, `main` @ `0ebee511f` (post "platinum component uplift"), tree clean.
**Method:** 8 expert personas reviewed a shared, pre-verified evidence pack and the live files (Storybook `:6010`, Next 16 `:3001`, 4 captured screenshots, Lighthouse). Every council claim cited below was independently re-verified against source: accuracy was 100% on spot-checks.

---

## Scoreboard

| Seat | Score | One-line verdict |
|---|---:|---|
| Senior developer | **68** | Above generic bar; flagship Button bug + unenforced rules + shadcn fork block a clean sign-off. |
| a11y expert | **62** | Won't certify at "authority" bar: real craft, but flagship primitives have keyboard/SR defects + a shipped WCAG fail. |
| Architect / CTO | **62** | Top-decile design, but a brilliant *solo artifact*; gap is enforcement + consolidation, not capability. |
| Client C-level | **61** | Not a turnkey platform; yes as talent/IP. Key-person + dependency + fork risks go in the contract. |
| Client hiring rep | **58** | Conditional hire. Elite portfolio, but doc-to-delivery gap + ~95% unfinished inventory + bus-factor-of-one. |
| Design lead peer | **58** | Closer than most, but the *primitives* (type scale, greys, dark-mode, Card semantics) are where it fails. |
| Junior designer | **58** | Inspiring bones dressed in a draft: flat type weight, monochrome-blue dark mode under WIP badges. |
| UX researcher | **52** | Won't ship as a reference system: the layer users touch most (forms, states) is inconsistent + has verified a11y breakages; no evidence of user validation. |
| **Average** | **59.9** | "Genuinely senior, not yet authority-grade." |

Severity tally across all seats: **4 blockers · 28 high · 23 medium · 7 low.**

---

## The one-paragraph verdict

This is a **top-decile design system built by one exceptional generalist, faster than any single person can finish, gate, and reconcile it.** The infrastructure is rare and real: a self-computing contrast story, forced-colors tokens, an orthogonal `variant × tone × size × surface` Button API, exemplary dated docs, axe-in-tests, a WIP→beta→stable lifecycle. But against the *design-systems-authority* bar the studio claims for itself, it is undercut by a consistent pattern: **ambition has outrun enforcement.** The system documents rules it doesn't gate, builds tools whose red flags it ships anyway, starts a second component architecture before retiring the first, and certifies as "stable" eight primitives that still carry correctness and a11y bugs. The capability is not in question. The *finishing discipline and consolidation* are.

---

## The through-line (root cause, not symptoms)

Every category of finding is a symptom of the same systemic cause: **generation velocity exceeding enforcement-and-finishing capacity in a single-maintainer system:**

| Symptom (what the seats found) | Same root |
|---|---|
| 150 components / 1,159 stories but **8 of 120 contracts `stable`** (7%) | Started far more than one person can finish |
| 225 hardcoded hex, 294 inline styles, `react-icons ^5.6.0` vs documented `5.5.0` pin | Rules written as prose, never wired to a gate |
| Contrast story computes **1.19:1 FAIL** in HCW: shipped anyway | Instrumentation built, never connected to a blocker |
| Bespoke CSS-Modules DS **+** shadcn/Tailwind subsystem both load-bearing; migration "decision board" still open | New direction begun before old one retired |
| Disabled `<Button>` link navigates; `Card` nests interactive-in-anchor; `FormField` never wires `aria-describedby`; `Title` size tokens missing | The "stable" 8 were never held to the stable bar |
| 88% single-author, only a `pre-push` hook, test/story/scripts escape `tsc` | Enforcement lives in the author's head + laptop, not the pipeline |

**The fix is not more components or more tooling. It is a stop-the-line moment:** freeze breadth, wire the gates that *already exist* (contrast, lint, typecheck) into a local pre-commit hook, pick **one** component architecture, and finish a small canonical core to a true `stable`.

---

## What is genuinely excellent (credit where due)

1. **Self-auditing accessibility.** A Foundations/Contrast story computes WCAG ratios per theme and renders failures in red (`screenshot 02`). Per-component `forced-colors` stories. `variables.css` handles `forced-colors` + `prefers-contrast`. Most "authority" shops only talk about this.
2. **Component API design.** `Button`'s orthogonal `variant × tone × size × surface` with discriminated-union button/link polymorphism and a dev-mode icon-only-without-name warning (`Button.tsx:131`) is senior-grade.
3. **Documentation.** The Button docs page (`screenshot 04`): In use / How to use (live code) / When (not) to use / a real Accessibility section / dated promotion notes: is better than most commercial DS docs.
4. **Testing & lifecycle.** 148 `.test.tsx` with axe-core; Playwright a11y/e2e projects; contract + spec + MDX per promoted component; honest WIP→beta→stable gating. Homepage Lighthouse a11y = **100**.
5. **Differentiated ambition.** The agent-native layer (manifest, MCP, `llms.txt`) and a fluid `clamp()` type scale + a refined motion-token vocabulary are a real point of view, not template output.

---

## The 4 blockers (all verified in source)

1. **`FormField` never connects errors/help to the control**: `FormField.tsx:40` renders `{children}` verbatim; `errorId`/`helperId` (`:30-31`) land only on `<p>` elements (`:44,:54`); no `cloneElement`/`aria-describedby`/`aria-invalid`. Every form built on the molecule has unassociated errors for screen-reader users. *(ux-researcher)*
2. **4+ field families with incompatible error contracts**: `TextInput error?: boolean` vs `Select`/`FormField`/`Combobox`/`CheckboxField error?: string` vs `TextArea error?: string | boolean`. Plus `FormField` is Tailwind/`cn`-based while peers are CSS Modules. No single canonical field. *(ux-researcher)*
3. **Two component systems both load-bearing**: `nextjs-app/shared/components/interactive/index.ts` re-exports Dialog/Accordion/Tabs/DropdownMenu from `@/components/ui/*` (shadcn + Tailwind + CVA, `rsc:false`, lucide) but Tooltip from `@dt/Tooltip` (CSS Modules + Phosphor). One barrel, two architectures; the shadcn copy is permanently forked. *(architect/CTO)*
4. **Enforcement runs off one laptop**: 88% single-author; CI is quota-dead (known/standing context); only a `pre-push` husky hook exists (no pre-commit); `tsconfig` excludes `**/*.test.*`, `**/*.stories.*`, `scripts/design-system/**` → **214 test + 177 story files + the bespoke tooling escape `tsc`**. The 24-step quality apparatus gates nothing automatically. *(architect/CTO)*

---

## Consensus findings (multiple independent seats: highest confidence)

- **Disabled `<Button>`-as-link still navigates**: `Button.tsx:226-240` keeps `href`, sets only `aria-disabled`, no `tabIndex=-1`/click suppression; sanctioned by tests. *(ux, a11y, senior-dev, architect: 4 seats)*
- **`react-icons ^5.6.0` vs documented `5.5.0` pin**: 10–12 Work portfolio pages import `react-icons/si`; floating `^` is a re-install footgun on the revenue showcase. *(hiring, C-level, architect: 3)*
- **Bespoke + shadcn fork unresolved**: source-of-truth ambiguity shipped to public Storybook. *(C-level, senior-dev, architect: 3)*
- **HCW `1.19:1` warning-on-warning contrast FAIL**: `variables.css:534-536`, flagged red by the system's own tool, shipped. *(hiring, design-lead, a11y: 3)*
- **Bus factor of one**: 1001/1140 commits one author; buyer due-diligence risk. *(hiring, C-level, architect: 3)*
- **Dark mode is "everything blue"**: `--color-title`/`--primary-text-color`/`--main-body-copy-color`/`--color-primary` all `#6fa8ff` (`variables.css:329-336`); heading/body/primary collapse to one ink. *(design-lead, junior: 2)*
- **`Card` 40-prop god component nests interactive-in-`<a>`**: `Card.tsx:433-442` wraps Buttons/Tabs in `<Link>`. *(design-lead, a11y: 2)*

---

## Per-seat top priority

1. **Client hiring**: Reconcile docs with shipped reality before any client review: pin react-icons to 5.5.0; fix HCW 1.19:1. Self-inflicted credibility wounds your own tools already flag.
2. **Client C-level**: Resolve key-person risk: knowledge-transfer/runbook + named second maintainer (or escrow) before any platform-scale engagement.
3. **Design lead**: Fix type-scale token integrity (define the full title/text ladder or shrink the size unions; kill `xs===s`). A broken type scale is the most damaging single defect for the "authority" claim.
4. **Junior designer**: Fix dark-theme hierarchy: stop painting headings, body, and primary the same `#6fa8ff`. Most visible "looks broken" issue.
5. **UX researcher**: Fix `FormField`/`CheckboxField` aria wiring (clone id + `aria-describedby` + `aria-invalid` onto the control) + a rendered-DOM test so the documented contract can't silently lie.
6. **a11y expert**: Fix the HCW warning contrast to ≥4.5:1 **and** add the pair to the contrast gate so it can't regress.
7. **Senior dev**: Fix the navigable disabled-link in Button + add an a11y test; the flagship must obey its own disabled-vs-aria-disabled doctrine.
8. **Architect/CTO**: Move enforcement off the author's machine: a real local pre-commit/pre-push running the full verify, wire the dormant precommit-guard, add a second committer.

---

## Prioritized remediation roadmap

### P0: Stop-the-line (hours→days; do before any client sees the repo)
1. Fix HCW warning contrast `variables.css:534-536` to ≥4.5:1; **expand the 7-pair contrast gate and make it failing.**
2. Fix navigable disabled `<Button>`-link `Button.tsx:226-240` (drop `href` or `preventDefault` + `tabIndex=-1` + `pointer-events:none`) + a11y test.
3. Pin `react-icons` to `5.5.0` exact (or migrate the 12 Work pages to the already-installed `simple-icons`); delete the stale gotcha.
4. Fix `FormField` aria wiring (`cloneElement` id + `aria-describedby` + `aria-invalid`) + rendered-DOM test.
5. Move `.themeHCB .badge`/`.themeHCB .toast` out of the `.themeHCW` block (`variables.css:510-518`).

### P1: Foundations integrity (days→weeks)
6. Type-scale: define the full `--font-size-title-*`/`-text-*` ladder **or** shrink `TitleSize`/`TextSize` to real steps; remove `xxs/xs/xxl` dangling refs; drive `Title` weight from `--font-weight-title`, not hardcoded `500`.
7. Dark mode: distinct heading / body / primary inks; reserve the accent blue for interactive.
8. **Pick one component architecture.** Reconcile the `interactive/` barrel + `FormField`-in-Tailwind; retire bespoke-or-shadcn; remove the migration ambiguity from `main`.
9. Unify the input/field error contract (one `error` type, one wiring pattern); consolidate the 4+ field families to one canonical `FormField`.
10. Split `Card` (compound `Card.Header/Body/Footer` or children-first); fix interactive-in-anchor in link mode.

### P2: Make it stick (governance)
11. Local **pre-commit** hook running `lint:all` + contrast + `typecheck` (CI is out); wire the dormant precommit-guard.
12. Bring test/story/`scripts` into a typecheck project (391 files currently escape `tsc`).
13. Token cleanup: monotonic greyscale ramp; single radius scale + unit; consolidate dual focus tokens; fix `--color-primary-disabled`; ship an elevation/shadow scale to back the Elevation story.
14. Repo hygiene: untrack `debug-env.js`, `CLAUDE.md.backup`, ad-hoc `*.md` analyses, `shared_backup_20251123/`; reconcile the barrel (79/150) + AGENTS.md "80+".
15. **Honest stable surface:** lead with the 8 stable primitives as the proof point; reclassify/hide the alpha/beta sprawl; align the "150 components" story with the ~8 production-ready reality.
16. (Buyer-facing) Bus-factor mitigation for engagements: runbook, named second maintainer, or source escrow.

---

## Artifacts
- Shared evidence pack: `.claude/council-audit/EVIDENCE.md`
- Full per-seat findings (62 items): `.claude/council-audit/COUNCIL_RAW.md`
- Screenshots: `.claude/council-audit/screenshots/01-04`
