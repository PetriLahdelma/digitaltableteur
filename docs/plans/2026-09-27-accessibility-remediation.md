# WCAG 2.2 AA remediation

Baseline: repository `8187e69dd`; live audit on 2026-09-27.

## Delivery increments

1. Navigation and forms: modal focus containment/restoration/background isolation, invalid contact input feedback, language selector names/state, scrollable mobile drawer.
2. Semantics and content: remove duplicate hidden blog links, retain a single main landmark, mark untranslated English passages, simplify card accessible names, add meaningful diagram alternatives.
3. Motion: user controls for persistent movement, deliberate reduced-motion behavior, meaningful video controls and valid content-scroll targets; retain a single semantic client list.
4. Chat and evidence: viewport-safe chat with identifiable speakers, predictable streaming/recovery; integrated regressions, full local gates, rendered checks and an honest criterion/evidence record.

## Acceptance

- Keyboard and programmatic focus stay inside active modal; close restores a logical focus target. Disabled initial controls do not defeat focus entry.
- Invalid input is explained with associated text and actionable correction; success/error handling preserves context without sending test data to real services.
- No invisible duplicate link sequence or nested main landmarks in complete production pages.
- English-only content retains the correct language under EN/FI/SV chrome.
- Essential overlay content remains reachable at 320 CSS px width, including a 256 px-high viewport and text-spacing overrides.
- Persistent autoplay has a usable pause/stop mechanism or is user initiated; reduced motion remains effective.
- Diagrams expose equivalent relationships; chat turns expose author information.
- Focused regressions, lint, typecheck, tests, production build, component contract gates and representative rendered states are checked locally.

## Constraints

No new dependencies. Preserve existing visual identity and unrelated user changes. Commit scoped increments with Lore trailers. Do not infer full WCAG conformance from axe or test counts; record untested assistive-technology, media and third-party process criteria explicitly. Follow local verification rather than GitHub Actions quota-dependent gates.

## Progress

- Planning: complete.
- Implementation: four scoped commits complete, including additional cookie/chat focus obstruction, bounded decorative motion and production-only caption contrast fixes.
- Verification: 124/124 production-build browser regressions, 389 unit-test files / 3,144 tests, production build, typecheck, lint, CSS and rhythm gates passed. Final generated evidence and contract checks accompany the delivery PR.
- Full conformance: not achieved or claimed. Garage Junction captions remain missing; media-equivalence, assistive-technology, external-booking and document verification remain open. See the dated accessibility evidence record.
- Delivery: implementation and evidence increments committed; current main-branch copy preserved through a verified merge. The pull request is the release handoff, not an AA certification.
