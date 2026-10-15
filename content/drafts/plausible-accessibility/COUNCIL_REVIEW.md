# Plausible accessibility: council review of draft 1

Seven independent seats reviewed the same evidence pack (line-numbered draft, measured metrics, the benchmark article, house standard, sources) on 2026-10-15. Severe claims were verified in the main thread against the repo, the sources, or both before being listed here. Benchmark: Daniel Yuschick, "Refactoring trust debt in your design system through predictable release cycles", zeroheight, 2026-10-14.

## Scores

| Seat | Score | One line |
|------|-------|----------|
| Benchmark editor | 7/10 | Beats the benchmark on spine, specificity, sourcing; loses on arc, rhythm, voice |
| Accessibility specialist | 7/10 | Accurate on the big claims; five expert-visible errors; routing table misses whole populations |
| Fact-checker | 49 of 61 verified | 1 wrong, 8 overstated, 3 unverifiable |
| Target reader (DS lead) | usefulness 6, memorability 8, trust 7, share 7 | Memorable and quotable; not yet a playbook |
| Disability-inclusion editor | 6.5/10 | Letter of the house rule met; structure and images undercut it |
| Line editor | 6.5/10 | Zero contractions, too many quotable closers, author absent for about 1,000 words |
| Art director | 6.5/10 | Palette holds; hand language and stencil model inconsistent; rhythm gaps |

## What every seat agreed on

1. **The unresolved AUTHOR CHECK is the single biggest problem.** An article titled "who to call" that does not say whether its author has called anyone fails its own close ("who told you?"). Five of seven seats raised it independently.
2. **It reads as a catalogue with a story wrapped around it.** The author's own September story (949 empty records, the language button, the 1:1 markers, the hot-reload hang) is the right spine, but the author disappears from about line 31 to line 89.
3. **Rhythm.** 4.1 sentences per paragraph against the benchmark's 2.4, and no contractions, although the house style requires them.
4. **The strongest material is first-hand and should be shown, not described:** the exact-name test as code, the marker contrast play test, the before/after spoken names.

## Must fix: facts (verified)

| Line | Problem | Fix |
|------|---------|-----|
| 71 | "216 deaf and hard-of-hearing viewers": the abstract says 216 validated participants; per the full text about 28 were hearing | "a September 2026 preprint surveying 216 viewers, most of them deaf or hard of hearing" |
| 37 | "tripled" mixes the one-line instruction (12% to 37%) and the instruction file (12% to 60%) | State both numbers |
| 37 | 39% vs 22% "needed a major redesign" were participants' judgments | "participants judged that..." |
| 37 | "Every pass in those numbers is an automated pass" cannot be confirmed for W4A | Limit to Fairchild and WebAIM |
| 39 | TalkBack "read the same instruction twice" is not in the source | Describe the redundant "Tap for details" instead |
| 73 | WFD/WASLI "cautioned against" avatars as replacements; they accept them for static content | Use their wording |
| 81 | Gower describes periodic "still composing", not silence | "feast-or-famine" in his terms |
| 93 | "FI, Suomi" is asserted only in the mobile drawer test | Say so, or quote "FI, Finnish" from the component test |
| 142 | "documented recapture recipe": no script sets `CI=1`. Also verified on 2026-10-15: running without `CI=1` no longer strips the axe result, so the failure does not reproduce a month later | Say exactly that; it strengthens the story |
| 144 | Snapshots exist for the beta-matrix stories, not every story | "every story in its test matrix" |

## Must fix: accessibility accuracy (verified)

| Line | Problem | Fix |
|------|---------|-----|
| 103 | 3.3.8 (AA) exempts object-recognition tests, so it does not cover most CAPTCHAs; 3.3.9 (AAA) does; 1.1.1 has its own CAPTCHA clause | Correct the claim |
| 93 | "exact spoken name" is the accessible name; what a screen reader speaks adds role and state and varies by reader | Say "accessible name", plus one sentence on listening in a real screen reader |
| 142 and the play test | Numbered markers are text, so 1.4.3 at 4.5:1 applies, not 1.4.11 at 3:1 | Raise the test threshold to 4.5:1 (inheritance already passes) |
| 95 | A date picker read as "button button button" is detectable by axe (`button-name`) | Replace with a case where names exist but mislead |
| 2 | "A11y" in the title reads as "A eleven Y" in some screen readers | Spell out Accessibility |
| 16 | `test: "todo"` reports violations as warnings; it does not skip axe | Describe the mechanism precisely |

**Product follow-ups the specialist found in the fix itself (code, not prose):** the language trigger's name changes between "Show" and "Hide" with state, which `aria-expanded` already conveys, and the trigger also carries `aria-current="true"`. The better pattern is a stable name ("EN, English") plus `aria-expanded`, without `aria-current`. Fix before the article presents the pattern as one to copy, then update Figure B. Also: decorative `ArticleFigure`s render an empty `<figure>`, and the routing table has no caption, no row headers, and no small-screen layout.

## Must fix: inclusion

- Line 138 ("experts decide, people with lived experience confirm") is a hierarchy that inverts "nothing about us without us". Rewrite so disabled people judge whether it works, from the first prototype.
- Line 107 treats specialists and disabled people as separate groups; many specialists are disabled.
- Line 103 suggests simulating cognitive disability ("as a person with limited memory would"). Test with people instead.
- Line 41 makes the blind customer the hazard ("sued... anyway"). Name the harm overlays do and the disabled-led opposition (Overlay Fact Sheet, NFB).
- "Pay people" is an afterthought. Make it a full rule: fees including prep, accessible recruitment, own devices and settings, consent and minimal data (disability data is special-category under GDPR), credit.
- Only one disabled person speaks in the piece. Add disabled practitioners and disabled-led bodies, including Finnish ones (Kuurojen Liitto, Näkövammaisten liitto, Selkokeskus).
- Sight metaphors: "blind spots" (line 142).

## Should fix: usefulness (target reader and specialist)

- Routing table: add **Owner** (design system or product team) and **When** (design, release candidate, pre-claim) columns; add rows for zoom and reflow, voice and switch control, motion, documents and PDFs, native mobile; split captions from audio description.
- Show the coding-agent instruction block (the 12% to 37% to 60% to 86% finding is the article's hope and its most copyable idea).
- Show the exact-name test as code, and the "assert the check actually ran" guard for the silent-skip class.
- Replace the US overlay story as the business case with the European Accessibility Act and EN 301 549 for EU readers; keep overlays as the plausibility example.
- Recruiting, budget, and briefing a vendor: a short, concrete paragraph.

## Should fix: voice and structure

- Contractions throughout; split paragraphs to about 2.8 sentences; cut about half the quotable closers; four deliberate one-line paragraphs, never adjacent.
- Thread the September story through the body; pair "axe caught 1.82:1" with "axe could not see 1:1" in the machines section.
- Close on "who told you?"; cut the summary paragraph; footer as a statement, not a question.
- Explain W4A, ASSETS, TalkBack, and live regions in a clause each.

## Illustrations

- Hands read as gloves (who-to-call) and as an outside force reaching in (hero). Redraw: sleeves, hands on the person's own side doing a specific expert act, never acting on the stencil.
- One stencil model (full body, cut-paper edge); no translucency (median-web); no off-palette mint (placing-a-person); violet snapped to `#812eff`; 16:9 for all section images; cut the repeated squiggle and dash tics.
- `fig-outline-pulled-loose` does not read as alt text and puts violet (human) on the machine's failure. Replace with the briefed luggage tag.
- The person-token in `fig-placing-a-person` risks reading as tokenism. Show a person stepping in, or cut it.
- Spacing: 987 words without an image between the maze and who-to-call. Move hollow-checkmark to "Where my own checks still fall short"; the two real artifacts fill the other gaps.
- Hero at thumbnail size: the hollow figure vanishes and the violet arm dominates. Check at 320×168.

## Decisions for the author

1. **AUTHOR CHECK:** what testing with disabled people has actually happened, or the dated, costed commitment to publish instead.
2. **Arc:** restructure around the September story (recommended by the benchmark editor and line editor) or keep the field-first order.
3. **Illustrations:** commission the redraws listed above, or ship with the current set after the minimal fixes (move, re-crop, replace one).
4. **The language-button pattern:** fix the component first (stable name, no `aria-current`), so the article does not teach a pattern an expert would correct.

## Already done after the review

- Real-artifact figures A (an evidence record, captioned with the true history: the September copies were discarded and the failure no longer reproduces) and B (the committed snapshot diff from b73740e0f) are in the draft as text, not images of text.
- Hero images without their own alt are now decorative site-wide, so screen readers no longer hear every post's title twice.

## Draft 2 (2026-10-15): what the owner chose and what changed

Owner picked: verified errors, inclusion fixes, voice and rhythm pass, restructure around September; routing table upgrade, code blocks, EAA and recruiting paragraph; all four code fixes. Illustration redraws were not picked.

- **Restructured** around the September story: the opening (949 empty records), "What the green runs hid" (three more problems no gate caught: the button, the 1:1 markers, the recapture hang), the 1.82:1 vs 1:1 pairing in "What the machines are good at", and the limits section.
- **All verified fact and accessibility corrections applied** (216 viewers, instruction numbers, participant-judged redesign share, WFD wording, Gower's feast or famine, accessible name not spoken name, 3.3.8 vs CAPTCHA with 3.3.9 and 1.1.1, 1.2.2 level and 1.2.4, unauthenticated scans, deafblind, cognitive needs outside WCAG with COGA, matrix-only snapshots, the CI=1 recipe and the failure no longer reproducing).
- **Inclusion:** "experts decide, lived experience confirms" replaced; specialists can be disabled; testing with people with memory or attention disabilities rather than simulating them; overlays framed around the blind customer and the disabled-led Overlay Fact Sheet; blind and low-vision programmers' study added; "pay people" now a full paragraph (rate including prep, accessible recruitment, own setup, consent and GDPR special-category data, credit); Finnish disabled-led and plain-language bodies named; "blind spots" removed.
- **Voice:** 52 contractions (draft 1: none); 3.2 sentences per paragraph (4.1); four one-line paragraphs, none adjacent; closes on "who told you?"; footer is a statement.
- **Additions:** routing table as a striped design-system Table with Owner and timing, 14 rows (audio description, zoom and reflow, motion, documents, native mobile added; voice and switch users in widget rows), stacked on phones; code blocks for the exact accessible-name test, an agent instruction file, and a silent-skip guard; the EAA paragraph.
- **Code:** LanguageSwitcher stable name without aria-current (Figure B now shows the final name); marker play test at 4.5:1; captionless figures and hero render as plain wrappers; table caption, row headers, explicit roles, small-screen layout.
- **AUTHOR CHECK:** resolved. The two Siteimprove experts, both with visual disabilities, worked with the owner during the Helsinki Design System work; the engagement has ended. The limits section says so and names the gap: this site's design system has not had a review like it.

Still open: illustration redraws (hands, stencil model, palette), the CodeBlockWindow component wraps every code block in an uncaptioned figure, and the article runs about 2,870 prose words (target 2,000 to 2,800) because of the expanded table.

## After draft 2 (2026-10-15)

- Routing table replaced by four striped lists grouped by owning team (owner: a table was the wrong form for sentence-length cases).
- No Oxford comma anywhere; title and headings fixed; run-on joins left by the comma removal split into sentences.
- Illustration redraws: owner declined, ship the current set.
