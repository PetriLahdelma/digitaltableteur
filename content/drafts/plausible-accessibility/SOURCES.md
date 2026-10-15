# Plausible accessibility: sources

All URLs were checked on 2026-10-15. Order follows the flagship standard: primary sources first, then research, then practitioner evidence, then first-hand evidence from this repo.

## W3C and WAI (primary)

| Source | Status and date | Used for |
|--------|-----------------|----------|
| [Selecting Web Accessibility Evaluation Tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/) | Updated 2024-05-13 | "tools can not determine accessibility, they can only assist" |
| [WCAG-EM 2.0](https://www.w3.org/TR/wcag-em-2/) | W3C Group Note, 2026-07-23 | "most accessibility checks are not fully automatable" |
| [About ACT Rules](https://www.w3.org/WAI/standards-guidelines/act/rules/about/) | Undated page | Passing a rule needs human verification |
| [Images Tutorial](https://www.w3.org/WAI/tutorials/images/) and [Complex Images](https://www.w3.org/WAI/tutorials/images/complex/) | Undated pages | Alt text depends on purpose and context; charts need summaries and data |
| [Accessibility of Machine Learning and Generative AI](https://w3c.github.io/ai-accessibility/) | **Editor's Draft, 2026-03-28, not endorsed, not yet on /TR.** Cite as draft research | AI alt text misses chart values and varies per run; ASR about 85% accurate; Deaf community view |
| [Inaccessibility of CAPTCHA](https://www.w3.org/TR/turingtest/) | Group Draft Note, 2021-12-16 | Software beats audio reCAPTCHA about 90% of the time |
| [Using Combined Expertise](https://www.w3.org/WAI/test-evaluate/combined-expertise/) | Updated 2024-03-21 | Evaluation needs knowledge of barriers and assistive technology |
| [Involving Users in Evaluating Web Accessibility](https://www.w3.org/WAI/test-evaluate/involving-users/) | Updated 2021-06-01 | User testing finds what conformance review misses; do not generalise from one or two users |
| WCAG 2.2 Understanding: [1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html), [1.2.2](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html), [2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), [2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html), [3.1.5](https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html), [3.3.8](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html), [4.1.2](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) | WCAG 2.2 Recommendation, 2024-12-12 | Criterion text and why judgment is required |

**Deliberately not claimed:** WAI has no official overlay position and no official percentage of success criteria needing human judgment. The article claims neither.

## Research and data

| Source | Used for |
|--------|----------|
| [WebAIM Million 2026](https://webaim.org/projects/million/) (data Feb 2026) | 95.9% of home pages with detected failures, up from 94.8%; 56.1 errors per page; "vibe coding" named |
| [Microsoft A11y LLM Eval report](https://microsoft.github.io/a11y-llm-eval-report/index.html) and [repo](https://github.com/microsoft/a11y-llm-eval) | 12% average control pass rate; 100% is not conformance |
| Aljedaani, Koumu, Guriță, "Generated Inaccessible", ACM W4A 2026, [doi:10.1145/3800424.3800430](https://doi.org/10.1145/3800424.3800430) | Accessibility prompts lowered compliance; 39% vs 22% needing major redesign |
| Panchanadikar, Bhosekar, Dixon, "Can Generative AI Create Accessible Websites?", ASSETS 2025, [doi:10.1145/3663547.3759755](https://doi.org/10.1145/3663547.3759755) | 52.93% of 308 errors were cognitive |
| "Are Caption Metrics Broken?", [arXiv 2609.11408](https://arxiv.org/abs/2609.11408) (preprint, 2026-09-10) | 216 DHH viewers; metrics track AI captions poorly |
| [WFD and WASLI statement on signing avatars](https://wfdeaf.org/wp-content/uploads/WFD-and-WASLI-Statement-on-Avatar-FINAL-14032018-Updated-14042018.pdf) (2018) | Avatars should not replace interpreters |
| [FTC final order, accessiBe](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million) (2025-04-22) | $1M; no unsupported WCAG claims |
| Bloomsybox.com LLC v. UserWay, D. Del. 1:24-cv-00844; [Lainey Feingold summary](https://www.lflegal.com/2025/02/userway-overlay-lawsuit) | Florist sued despite overlay, now suing the vendor. A Feb 2026 recommendation to let claims proceed is not yet adopted: no liability finding |

## Practitioner evidence (Medium and Dev.to)

| Source | Strength | Used for |
|--------|----------|----------|
| Michael Fairchild, [AI-generated accessibility, an update](https://dev.to/mfairchild365/ai-generated-accessibility-an-update-frontier-models-still-fail-but-skills-change-the-game-5629), Dev.to, 2026-05-21 | Strong, benchmark author | 1,280 samples; 12% average; 25% best; 0% hardest case; 86% with generate-then-review at about 5.5x input tokens |
| Eevis, [Does Claude Generate Accessible Apps](https://dev.to/eevajonnapanula/does-claude-generate-accessible-apps-5759), Dev.to, 2025-08-22 | Strong, hands-on TalkBack testing | 15 claimed features; unused helper; nonexistent role; doubled instruction |
| Eevis, [Does AI Generate Accessible Android Apps?](https://dev.to/eevajonnapanula/does-ai-generate-accessible-android-apps-2gb5), Dev.to, 2025-11-25 | Strong | "Add yarn" / "Add new yarn" redundant labels across four tools |
| Drishti Bansal, [How AI Actually Helps Me as a Deaf Person](https://medium.com/@dribans/how-ai-actually-helps-me-as-a-deaf-person-and-the-parts-no-one-talks-about-b7be5f9236c6), Medium, 2025-12-04 | Strong, lived experience | Caption failure modes; quoted line |
| Mike Gower, [Usable AI chat](https://medium.com/design-ibm/usable-ai-chat-46dedcca6a8f), 2025-03-27, and [Catching up on accessibility with AI chat](https://medium.com/design-ibm/catching-up-on-accessibility-with-ai-chat-1129be33c184), 2025-04-22, IBM Design on Medium | Strong, expert analysis | Morphing streamed responses; 85 Tab presses |
| BetterQA, [What automated scanners keep missing](https://dev.to/tudorsss-betterqa/accessibility-testing-what-automated-scanners-keep-missing-2d44), Dev.to, 2026-04-09 | Strong cases, vendor author | 14 vs 47 issues; modal focus return; "button button button" date picker |
| [AI-generated UI is shipping faster than accessibility can catch up](https://dev.to/lixingliangsy/ai-generated-ui-is-shipping-faster-than-accessibility-can-catch-up-1o2i), Dev.to, 2026-09-26 | Weak overall; concrete anecdote only | Modal letting focus escape |
| Durgesh Rajubhai Pawar, [AI-Generated UI Is Inaccessible by Default](https://blog.master.dev/ai-generated-ui-is-inaccessible-by-default/), Frontend Masters blog, 2026-04-13 | Strong, not Medium/Dev.to | Sidebar as anonymous generic; 10 failures in 29 lines |

**Excluded as unverifiable:** "70% spike in screen reader abandonment" (Minarik, Medium), "88% of AI code omits ARIA", the UsableNet overlay-lawsuit percentages, and secondhand claims about AI alt text anchoring authors.

## First-hand evidence (this repo)

| Claim in article | Evidence |
|------------------|----------|
| 949 light-theme records lost their axe result, exit 0 | `.storybook/preview.tsx:564` sets `test` to `"todo"` without `CI`; recapture recipe and incident in memory note `project_a11y_evidence_recapture` (2026-09-01, #1470) |
| Chat bubble at 1.82:1 in dark theme, flagged by axe | `MarkdownMessage.module.css` comment and fix 3bb66d360 (2026-09-02): `#e0e0e0` on `#6fa8ff` |
| Invisible list markers in the user bubble | `MarkdownMessage.module.css:20` `::marker { color: var(--color-primary) }`; user messages render through `MarkdownMessage` (`ChatMessageBubble.tsx:258`) on a `--color-primary` background. Still open |
| Language button name | Production, 2026-10-15: computed `aria-label` began `EN, EN` then "Switch to English. Show language options" with English active. Fixed in 3bc2c6e83 (exact spoken names unit-tested); snapshot diff in b73740e0f shows old and new names across 16 header snapshots |
| Recapture hang | Writing `__a11y-evidence__` JSON hot-reloaded Storybook mid-test; KeyboardToggle hung 60 s in every mode with the update flag, passed in 241 ms without it. Fixed in 9b0304e5c |
