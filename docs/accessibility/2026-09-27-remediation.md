# Accessibility remediation: 27 September 2026

Target: WCAG 2.2 Level AA. This is an engineering evidence record, not a conformance certificate or a guarantee against legal enforcement.

## Scope and method

The review combines source inspection, rendered Chromium/axe checks, keyboard and programmatic-focus regressions, text-spacing/reflow checks, unit tests, and Storybook accessibility-tree evidence. The page registry supplies 49 published routes, including core pages, published work and blog routes, legal pages and representative pSEO pages. A separate 48-case matrix covers four representative routes in EN/FI/SV and light/dark/high-contrast black/high-contrast white themes. The matrix is a sample, not the Cartesian product of every route and preference.

Page checks use WCAG A/AA tags through 2.2, explicitly enable target-size, retain full-page landmark checks, and attach both violations and axe's unresolved `incomplete` results. No full-page landmark rules are suppressed. Component-only Storybook checks retain their existing partial-context configuration and are not substituted for full-page checks. Contact requests are mocked or blocked in regressions; no real messages or bookings are submitted.

## Repaired barriers

| Area | Remediation | Principal criteria |
| --- | --- | --- |
| Modal and mobile navigation | Filter unavailable focus targets, contain Tab/focus, isolate background branches, restore usable focus, handle nested traps, close hidden drawers at desktop breakpoint, keep short-viewport navigation scrollable | 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11, 4.1.2 |
| Contact form | Allow invalid submission attempts to expose associated errors, focus first invalid field, make typo suggestions advisory, use readable error/placeholder tokens | 1.3.1, 1.4.3, 3.3.1, 3.3.2, 3.3.3 |
| Navigation semantics | Remove duplicate hidden blog links; retain one main landmark; add missing primary headings; preserve visible language codes in names, expanded/current state and focus return | 1.3.1, 2.4.1, 2.4.3, 2.4.6, 2.5.3, 4.1.2 |
| Language and diagrams | English boundaries on untranslated passages/cards without relabelling localized chrome; named diagrams with structured text equivalents available even when SVG rendering fails | 1.1.1, 1.3.1, 3.1.2 |
| Motion and media controls | Pause/resume client logos; one semantic client list; finite scroll hint; explicit start/stop for persistent logo effects; video posters and native controls instead of autoplay | 2.2.2; reduced-motion preference support |
| Chat | Visible speaker names, stop streaming while retaining a focusable input, preserve reading position, short-viewport scroll surface, error/edit focus recovery, input-purpose autocomplete, remove hidden launcher from Tab/AT, dismiss nonmodal overlay when keyboard focus leaves without stealing focus back | 1.3.5, 1.4.10, 1.4.12, 2.4.3, 2.4.7, 2.4.11, 3.3.1, 3.3.7, 4.1.2, 4.1.3 |
| Third-party video embed | Replace the supplementary YouTube embed that exposes invalid ARIA/unnamed controls with a validated, named external source link and new-window warning | 4.1.2 for the on-site link; does not certify the external service |
| Public statement | State the 2.2 AA target and unverified full-conformance status in all three locales; remove unsupported automated-pass certification; correct outdated complaint routing | Truthful evidence and feedback |

## Verification record

- Latest full unit run after the media follow-up: 389 files / 3,145 tests passed.
- After integrating current main-branch contact/chat copy, the production build, all 122 browser regressions and all 3,144 unit tests passed again.
- Final component evidence: 16 Storybook suites / 91 stories passed in each of light, dark and forced-colors modes (273 story executions), recaptured against committed source. Donny's demo controls were changed to existing themed buttons after their dark-mode contrast failure.
- Latest production-build browser run: **132/132 passed**, including the 97-case page/theme/language matrix with WCAG 2.2 target-size explicitly enabled, combined-overlay hit testing under normal and reduced motion, and eight media-description theme/width cases. This is the defined regression scope, not a claim that every WCAG criterion is automated.
- Production verification caught a CSS-chunk-order bug in the KnobSmith logo caption that was absent in development. Scoping its white foreground to the fixed dark panel repaired all affected light/high-contrast-white locale cases before the final run.
- Interaction tests cover disabled-first-control entry, forward/reverse trap wrap, Escape return, invalid email recovery, filtered blog links, language focus, 320 × 256 and 320 × 568 overlay reflow with WCAG text spacing, and foreign-language passages.
- Invalid editorial-form state is checked in all four themes, including every required field's error association.
- Chat tests additionally check stop behavior, labelled speakers, draft-preserving email recovery, input purpose, and background focus not remaining obscured by an open panel.
- Cookie-banner regressions assert non-overlap and actual hit-test visibility of focused main/footer links at 390 × 844 and 320 × 256, plus access to all three consent actions. The banner remains nonmodal and preserves existing document padding. A hit-test regression first failed at 320 × 256 because the sticky header covered controls already cleared of the banner; the header now scrolls with the page at heights of 480 CSS pixels or less.
- With `prefers-reduced-motion: no-preference`, a browser regression verifies keyboard pause/resume actually changes the marquee's computed animation state. Source-level regressions protect finite hero/manifesto/Donny motion; 63 focused motion tests passed.
- Short-screen collision checks also include the brand link, mobile-menu button and chat launcher. While consent is unresolved on these screens, the launcher is in document flow rather than covering navigation; chat remains available without requiring a cookie choice. All nine sampled interior points must hit each focused target or its descendants.
- Final shipping results are recorded in the delivery PR. Generated Storybook evidence is colocated with each component under `__a11y-evidence__` and `__a11y-snapshots__`.

Reproduction:

```sh
npx vitest run --maxWorkers=2
npx playwright test tests/a11y/remediation --project=a11y --workers=2
npm run typecheck
npm run lint
npm run lint:css
npm run audit:rhythm:check
npm run build
```

## Remaining conformance work

Do not claim full WCAG AA conformance from these results. In particular:

1. **Meaningful media:** Garage Junction's promotional video has an audible track and is described as original sound design, but has no caption track. Review its actual sound and visual sequence, provide accurate synchronized captions for meaningful audio, and assess audio description (1.2.2, 1.2.5). Review all other videos for meaningful sound, visual-only information, flashes and equivalent alternatives. Do not invent captions from filenames or treat controls as captions. Silent/near-silent media tracks are not evidence of meaningful speech.
2. **Assistive technology:** Verify complete contact/chat/error/retry/cancel journeys with VoiceOver/Safari and NVDA/Firefox or Chrome; include announcement timing, interruption, reading position and focus visibility. DOM/ARIA snapshots cannot establish spoken output quality. JAWS and voice-control compatibility remain unverified.
3. **External processes:** Complete the booking flow with keyboard and assistive technology, including date/time selection, timezone, validation and confirmation. An on-site contact alternative is useful but does not itself prove third-party process conformance.
4. **Documents:** The follow-up review confirms that the linked Finnish Reliable Partner report has no structure tree and the EN/SV reports incorrectly declare Finnish at their document roots. All nine linked-report pages were inspected; 22 additional public legacy PDFs received metadata inventory only. A faithful HTML alternative or issuer-supplied accessible replacement remains needed. See [document and media follow-up](2026-09-27-document-media-audit.md) for evidence and privacy/publishing boundaries.
5. **Beyond the sample:** Check browser text-only zoom and actual 200%/400% zoom, landscape and software keyboards, forced colors on full production flows, all published media/complex images, and WCAG pointer/gesture, timing and authentication requirements wherever those interactions occur. Responsive CSS-pixel testing is evidence for reflow, not a substitute for every zoom or assistive setting.

The public site does not receive an AA certificate from axe, a Lighthouse score, an accessibility statement, or these code changes. WCAG requires complete pages and complete processes to satisfy all applicable criteria. EU AI Act duties are a separate assessment from web accessibility; neither assessment guarantees that fines cannot occur.

The media follow-up adds a visible, programmatically associated description of Garage Junction's verified static visual content. Original-sound captions are still missing. A synthesized audio-description prototype was withheld before publication because the installed system voice's publication rights were not cleared; an owned recording or appropriately licensed voice is required. The originals and report PDFs remain unchanged.

## Sources

- [W3C WCAG 2.2 and conformance requirements](https://www.w3.org/TR/WCAG22/)
- [W3C Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/understanding/)
- [Traficom accessibility statement and complaint routing](https://traficom.fi/en/about-traficom/accessibility-statements/accessibility-statement-traficoms-websites)

## Delivery boundaries

No new dependencies, no secrets, no production contact submissions and no CI quota-dependent gates. Existing unrelated local edits in `.claude/settings.local.json`, `.planning/STATE.md`, `next-env.d.ts`, `public/ds-health/agent-experience.json`, the stencils draft and its media are excluded from the release. The design-system debt baseline is tightened only after eliminating increases; automated evidence is regenerated rather than hand-certified.
