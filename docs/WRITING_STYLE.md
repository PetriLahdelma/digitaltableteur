# Digitaltableteur writing style (LLM reference)

> **Scope:** This file applies **only to the `digitaltableteur` repository**. Do not copy it to llm-wiki, global Cursor skills, or other projects. Agents working on blog posts, case studies, and long-form content in this repo should read this before drafting or editing prose.
>
> **Not covered here:** UI microcopy and i18n (EN/FI/SV app strings) → [`.claude/agents/copywriting-lead.md`](../.claude/agents/copywriting-lead.md) and translation files under `nextjs-app/shared/locales/`.

---

## When to load this doc

| Content type | Use this doc? |
|--------------|---------------|
| Blog MDX (`content/posts/`, `content/drafts/`) | **Yes** |
| Case studies, studio positioning, technical essays | **Yes** |
| Sanity portable text (if prose-heavy) | **Yes** |
| Button labels, errors, form copy | **No** → copywriting-lead |
| Marketing site UI (`t()` keys) | **No** → locales + copywriting-lead |

---

## Quick checklist (before shipping prose)

1. Opens with a **specific scene, observation, or claim** — not “In today’s…” or a definition.
2. Paragraphs are **2–5 sentences** of connected argument; not one-line staccato stacks.
3. **No** banned AI filler (see [Banned vocabulary](#banned-vocabulary)).
4. **First person** where the author is reporting practice (“I have seen…”, “We run…”) when appropriate.
5. Technical claims are **grounded** (repo commands, file paths, counts) when the post is about this stack.
6. Images follow the [illustration standard](#illustration-standard): one bespoke family per article, nothing recycled, every explanatory figure a real working artifact.
7. Read aloud once: does it sound like Petri on [petrilahdelma.com/writing](https://www.petrilahdelma.com/writing), not a generic AI essay?
8. Flagship pieces also pass the [flagship review](#flagship-review-editorial-not-a-score).

---

## Persona

**Who is speaking:** Petri Lahdelma — solo design systems / product design practitioner running Digitaltableteur. Practitioner-researcher, not a vendor brochure or academic paper.

**Sounds like:** A senior designer-engineer explaining what broke in real repos and what actually fixed it — over coffee with someone who ships design systems.

**Does not sound like:** Corporate press release, LinkedIn thought-leadership fluff, textbook definitions, or listicle SEO.

**Audience default:** Design system leads, design engineers, and product engineers at mid-to-large product orgs who already know Figma, tokens, and Storybook; explain *judgment*, not buzzwords.

---

## Voice vs tone

- **Voice** (constant): direct, evidence-minded, willing to use humor when it clarifies or deflates hype, respectful of reader time, willing to name tradeoffs.
- **Tone** (varies by situation):

| Situation | Tone shift |
|-----------|------------|
| Technical blog (MCP, contracts, agents) | More precise; cite repo reality; humor OK when it lands, not as filler |
| Studio / positioning (“Field Notes”) | Warmer; still no hype; short declarative lines allowed |
| Error or correction in a draft | Plain, non-defensive, fix-forward |
| Series continuity footers | Minimal; link forward/back; no recap essay |

---

## Tone dimensions (Nielsen Norman scales, 1–5)

Use these numbers in prompts instead of vague adjectives like “friendly.”

| Dimension | Target | Notes |
|-----------|--------|-------|
| Funny ↔ Serious | **3** | Humor is welcome when it serves the point; no forced punchlines or joke headings |
| Formal ↔ Casual | **2** | Professional but conversational; contractions yes |
| Respectful ↔ Irreverent | **3** | Can challenge hype; never punch down at readers |
| Enthusiastic ↔ Matter-of-fact | **3** | Care about the topic; no exclamation-mark energy |

---

## Principles (we always)

1. **Lead with the real problem** — what fails in review, CI, or handoff, not abstract “the future of X.”
2. **Prefer operating models over catalogues** — how teams *run* systems, not how many components they have.
3. **Show the loop** — intent → rules → output → evidence; name what counts as evidence in this repo.
4. **Active voice; named subjects** — “Stylelint rejects raw values,” not “raw values are rejected.”
5. **Plain English for jargon** — use DS terms readers know; translate vendor hype.
6. **Honest limits** — say what is enforced in CI today vs what is still design direction.
7. **Internal links** when extending a series or prior posts on this site.
8. **Varied rhythm** — mix sentence lengths; avoid three identical short paragraphs in a row.

---

## Principles (we never)

1. Open with “In today’s fast-paced / ever-evolving / landscape…”
2. Stack **In this post** callouts, pull-quote boxes, and inline diagrams that repeat the same bullet the paragraph already said.
3. Use **not X, it’s Y** contrast formulas more than once per article (`stop-slop` pattern).
4. Hedge stacks: “might,” “perhaps,” “it’s worth noting,” “arguably” without a concrete claim.
5. **False certainty** — “always,” “never,” “every team” without qualification.
6. Recycle **hero images** or Sanity art from unrelated posts.
7. **Em dashes** — use commas, parentheses, or a second sentence (aligns with anti-slop editing).
8. End every section with a one-line “mic drop” sentence.

---

## Banned vocabulary

Generic AI defaults and hollow intensifiers. If one appears in a draft, replace or delete.

`delve`, `leverage`, `utilize`, `robust`, `seamless`, `navigate` (metaphorical), `landscape`, `realm`, `tapestry`, `game-changer`, `unlock`, `elevate`, `foster`, `streamline`, `cutting-edge`, `holistic`, `synergy`, `furthermore`, `moreover`, `essentially`, `it’s important to note`, `at the end of the day`, `deep dive` (as noun), `double down`, `in conclusion`

**Digitaltableteur-specific avoid:** empty superlatives about “flagship” craft unless the piece is explicitly studio positioning.

---

## Preferred vocabulary

| Prefer | Instead of |
|--------|------------|
| use | utilize |
| run, enforce, check | leverage |
| repo, pipeline, contract | ecosystem (unless literal) |
| evidence, proof, CI | validation journey |
| operating model, loop | transformation |
| agent, linter, Storybook | co-pilot (unless quoting a product name) |

**Signature moves (use sparingly, not every paragraph):**

- Concrete failure in review or diff (“wrong action hierarchy,” “raw values instead of semantic tokens”).
- Maturity framing (“library vs operating model”).
- Referencing this monorepo honestly (`npm run validate:components`, contract JSON, Stylelint strict values).

---

## Structure rules

| Rule | Target |
|------|--------|
| Average sentence length | ~12–18 words; occasional shorter for emphasis |
| Paragraph length | 2–5 sentences; **avoid** single-sentence paragraphs back-to-back. A one-line paragraph is allowed as deliberate punctuation (a coined term landing, a dry aside), at most four per article |
| Headings | `##` for major turns; title case; not every paragraph needs a subhead |
| Lists | **Tools and checklists only** — not as a substitute for argument; default body is flowing prose |
| Bold | Sparingly — terms on first definitional use, not whole sentences |
| Contractions | Yes (`don’t`, `it’s`, `we’re`) in blog voice |
| Oxford comma | Yes |
| Questions in headings | Rare; prefer statements |
| Code / commands | Fenced blocks or inline backticks; real commands from this repo when claiming enforcement |
| MDX extras | `<Figure>` / images need unique assets and alt text that describes the diagram; no filler SVGs |

### Openers

**Do:** Start from observation, experiment, or reframed question.

```text
Last year I wrote about design systems for bots… Since then I have watched teams run the experiment for real.
```

**Don’t:**

```text
In today's rapidly evolving world of AI and design systems, organizations must adapt…
```

### Closers

End with **one clear takeaway or next action** (read the next post, run a command, adopt a test). No summary-of-summaries unless the piece is >2,500 words. Flagship pieces close by returning to the opening image or question, so the reader feels the loop shut.

---

## Flagship standard

> **Benchmark:** Daniel Yuschick, [Refactoring trust debt in your design system through predictable release cycles](https://zeroheight.com/blog/refactoring-trust-debt-in-your-design-system-through-predictable-release-cycles/) (zeroheight, 2026-10-14). We do not imitate it, quote it, or borrow its art. We codify why it works and hold our flagship articles to the same bar. Measured: about 2,150 words, 49 paragraphs averaging 2.4 sentences, 17-word sentences, one three-item list, no pull quotes, eight images (six decorative illustrations, two working artifacts).

A flagship article is one argument, told as practice, that a reader can act on. The earlier posts that read as listicles (for example `content/posts/workflow-tips.mdx`, which opens on a "rapidly evolving landscape") are below this bar. Treat them as calibration, not as voice references.

**1. A named spine.** Coin or adopt one concept that carries the whole piece (the benchmark's is "trust debt"). Name it within the first 150 words, let it land in its own one-line paragraph, use it in the title or excerpt, and return to it in the close. One concept per article; a second coined term competes with the first.

**2. An opening that reframes something familiar.** Start from an idea the reader already owns (a thought experiment, a common saying, a scene from review) and turn it toward the topic. Within the first three paragraphs, put the author in the story with real stakes: the role taken on, the audit run, the incident seen.

**3. An arc of practice, not a catalogue.** The body follows what happened or what to do, in order: diagnose, intervene, show evidence, admit limits. `##` headings trace that arc and may be playful, as long as they still describe the section. Use `###` only for genuinely parallel mechanisms (three release types, four failure modes).

**4. Specificity density.** Every section carries at least one concrete, checkable detail: a version number, a cadence, a count, a duration, a named artifact, a policy with its exact rule. An abstract claim gets an instance within two sentences. "Some products pinned years-old versions" is an observation; "v89 with no changelogs" is evidence.

**5. Mechanisms the reader can take.** Practical advice arrives as the specific mechanism used (the policy, the ritual, the template, the cadence), with enough detail to copy it on Monday. Lists are for parallel categories only: one or two per article, three to five items each.

**6. Honest evidence and an honest limits section.** Say what was measured and what was not; anecdotal results are fine when labelled as anecdotal. Before the close, include a section on what still did not work or what remains open. It is the most credible part of the article.

**7. Empathy for the people in the system.** Users, contributors, and teams who drifted are never the villain. Explain why their behaviour was rational given what they faced.

**8. Credit and sources.** Name and link the people and writing that shaped the work. For research-led pieces, primary sources first (standards, specifications, official guidance), then practitioner evidence with first-hand testing, then commentary. Every factual claim must trace to a source or to the author's own practice, and the draft keeps a source list for review.

**9. Voice texture.** First person singular for lived practice, `we` for the team, `you` sparingly for direct advice. Dry, brief humour that deflates rather than performs: a three-word aside after a long paragraph, at most one per section. Show change through quoted shifts in what people actually said when the article has them.

**10. Length and close.** 2,000 to 2,800 words. The close returns to the opening image, delivers one memorable line, and ends with a single understated footer line (event, next post, or contact). No inline sales pitch.

### Writing about disability

Accessibility pieces describe disabled people as the experts on their own experience, not as edge cases or beneficiaries. Use the terms the community uses: "disabled people" and "people with disabilities" are both acceptable; name specific groups ("screen reader users", "Deaf people who sign") when the point depends on it. Never use "suffers from", "confined to a wheelchair", or "normal users". When an article argues for testing with disabled people, it also says they should be paid and recruited with the same care as any other expert.

### Illustration standard

- **One bespoke family per article.** A hero plus three to six section illustrations at major turns, roughly every 300 to 450 words, in one consistent Digitaltableteur style. No recycled art, no stock, no generic AI imagery that could illustrate any article.
- **Illustrations carry the metaphor, not the text.** Each one depicts the section's idea as an image (a character, an object, a small scene); it never repeats a sentence from the paragraph as a caption-diagram.
- **Decorative means empty alt.** Purely decorative illustrations get `alt=""` so screen reader users are not made to listen to them; the article must still make complete sense without them.
- **Explanatory figures are real artifacts.** Timelines, tables, checklists, before-and-after comparisons, or screenshots from the actual work, with descriptive alt text that conveys the figure's information and a one-line caption.
- **Briefs first.** A draft lists an illustration brief per placement (subject, metaphor, placement, alt treatment) so art can be commissioned or produced before publishing.

### Flagship review (editorial, not a score)

Answer each question in writing before an article ships. These are editorial judgments for the author and editor; they are deliberately not turned into a numeric score, because mechanical scores reward the presence of signals rather than quality.

1. Can you state the spine concept in one sentence, and does the close return to it?
2. Would a practitioner learn a mechanism they could use this week? Which one?
3. Does every section contain at least one detail a sceptical reader could check?
4. Is there a section that admits what did not work or is still unknown?
5. Is any person or group cast as the villain? Rewrite until no one is.
6. Are all factual claims sourced, with primary sources first?
7. Read aloud: is there any sentence that could appear in any other article on any other site? Cut or sharpen it.
8. Do the illustrations form one family, and is every explanatory figure a real artifact with real alt text?

---

## Content-type notes

### Technical blog (design systems, MCP, agents)

- Anchor claims in **this codebase** where possible (counts, script names, paths).
- Name **competing tools** fairly with links (official Figma MCP, Figma Console MCP, figma-cli, etc.).
- Separate **v1 structural** vs **v2 semantic** contracts when discussing agent-readiness.
- Series: Part 1 sets spine; later parts deepen — **do not** repeat the full operating-loop diagram every time.

### Studio / Field Notes

- Shorter blocks OK; still **full sentences**, not slogan stacks.
- “One-person studio” framing is factual, not apologetic.
- CTAs: understated (“Start a sprint,” contact) — not aggressive sales.

### Excerpts & SEO frontmatter

- `excerpt`: one sharp sentence; no trailing hype.
- `readTime`: keep honest after edits.
- Title: specific claim or tension, not “Everything you need to know about…”

---

## On-brand vs off-brand examples

### On-brand (blog)

> AI did not invent those problems. It removed the slack that used to hide them.

> Governance in this context is not a committee. It is what stops every sprint from rediscovering the same decisions.

### Off-brand

> In today's AI-powered landscape, organizations must leverage cutting-edge tools to unlock seamless design system transformation.

> Here's the thing: design systems aren't just component libraries anymore. They're holistic ecosystems. Furthermore, it's important to note that…

### Off-brand structure (do not ship)

```markdown
## The Problem

AI is changing everything.

## The Solution

Operating models matter.

## Key Takeaways

- Operating models matter
- AI is fast
- Governance is key
```

Three disconnected micro-sections with no through-line.

---

## Editing pass (recommended order)

1. **Substance** — Is the argument true, scoped, and ordered?
2. **Structure** — Merge choppy paragraphs; remove redundant callouts/diagrams.
3. **Voice** — Run [Banned vocabulary](#banned-vocabulary); read aloud.
4. **Facts** — Verify commands, paths, and dates against the repo.
5. **MDX** — Frontmatter, unique `mainImageUrl`, alt text, internal links.
6. **Flagship** — For flagship pieces, write answers to the [flagship review](#flagship-review-editorial-not-a-score) questions and keep them with the draft.

Optional tightening: apply the same anti-slop instincts as the `stop-slop` skill (no em dashes, no “not X, it’s Y”, active voice) — **in-repo rules above take precedence** for Digitaltableteur voice.

---

## How others document voice for LLMs (research)

These informed this file. They are **external references**, not rules for this repo.

| # | Source | What they emphasize |
|---|--------|---------------------|
| 1 | [Atom Writer — Brand voice AI prompt template](https://www.atomwriter.com/blog/brand-voice-ai-prompt-template/) | Persona, Nielsen 1–5 tone scales, banned words, structural rules, on/off examples |
| 2 | [ClaudeReadiness — Claude brand voice guidelines](https://claudereadiness.com/blog/claude-brand-voice-guidelines/) | Behavioral tone descriptors; 3–5 full writing samples in context |
| 3 | [Single Grain — How LLMs interpret brand tone](https://www.singlegrain.com/branding-2/how-llms-interpret-brand-tone-and-voice/) | Compact “We always / We never” + gold-standard corpus |
| 4 | [LinkedIn — Your system prompt is your brand voice](https://www.linkedin.com/pulse/your-system-prompt-brand-voice-shyamala-prayaga-kkxhc) | Identity, intent, audience, values, guardrails |
| 5 | [Atom Writer — Claude AI brand voice](https://www.atomwriter.com/blog/claude-ai-brand-voice/) | Context-specific adjustments (blog vs email); examples > adjectives |
| 6 | [iMarkInfotech — 10-section brand voice document](https://www.imarkinfotech.com/how-to-write-a-brand-voice-document-that-actually-makes-ai-sound-like-you-a-10-section-template/) | Mission, audience, phrase lists, rhythm, AI-tell ban list |
| 7 | [Right Side Up — Voice guide with AI in an afternoon](https://www.rightsideup.com/blog/voice-and-tone-guide-with-ai) | Start from 5 real samples; iterate in steps; hard constraints |
| 8 | [Every — AI style guide](https://every.to/guides/ai-style-guide) | Voice tensions; positive/negative paragraph pairs |
| 9 | [AiFlowChat — Brand voice guidelines framework](https://aiflowchat.com/blog/articles/brand-voice-guidelines) | Voice traits with limits; tone map by channel |
| 10 | [Mailchimp Content Style Guide — Voice and tone](https://styleguide.mailchimp.com/voice-and-tone/) | Plainspoken, dry humor, clarity over entertainment; tone shifts by reader state |
| 11 | [Mailchimp — Writing goals and principles](https://styleguide.mailchimp.com/writing-principles/) | Empower, respect, educate; truth over grandiosity |

**Pattern that works for LLMs:** rules + banned list + numeric tone targets + 2–3 on-brand and 1–2 off-brand excerpts. Adjectives alone are weak.

---

## Calibration (author-confirmed)

| Topic | Setting |
|-------|---------|
| Humor | **Frequent when it fits** — not mandatory every section; still skip forced jokes |
| Narrative voice | **Mix:** `I` for lived practice, `we` for repo/process, `you` for clear calls to action |
| Opinion strength | **Balanced:** direct claims; hedge only when evidence is incomplete |
| Structure | **Prose-first:** connected paragraphs; lists for tools/checklists only |
| Commercial CTAs in technical series | **Footer only** — one understated line or next-post link; no inline services pitch |
| Nordic English | International English; not US-only idioms |
| Finnish/Swedish blog | English only for blog MDX today |

*Change preferences by editing this table in `docs/WRITING_STYLE.md` only — do not mirror to llm-wiki or global skills.*

---

## Automation (prose gate)

Run before shipping or editing blog MDX:

```bash
npm run prose:check              # errors on em dashes + banned vocab
npm run prose:fix-em-dashes      # rewrite — → comma / period / colon
npm run prose:check -- --include-drafts
```

Rules live in `scripts/prose/lib/slop-rules.mjs` (kept in sync with this doc). The checker also warns on patterns humans associate with Gen-AI prose:

| Tell | Why it reads as AI |
|------|---------------------|
| Em dashes (—) | Overused for dramatic pauses; NPR/Reddit called out as LLM habit |
| “In today’s fast-paced landscape…” | Empty opener |
| “Not X, it’s Y” (repeated) | Formulaic contrast |
| `delve`, `leverage`, `unlock`, `seamless`, `tapestry` | Default LLM vocabulary |
| Furthermore / Moreover at sentence start | Essay-bot transitions |
| “Here’s the thing” / hedge stacks | Throat-clearing and false nuance |
| Metaphorical *navigate* + *landscape* | Business-bot imagery |

**Policy:** zero em dashes in published posts; automated fix is a first pass, then read aloud. PSEO copy generation includes the same constraints in `scripts/pseo/generate-pseo-copy.ts`.

Agent skill: `.claude/skills/prose-quality/SKILL.md`

---

## Related repo files

| File | Role |
|------|------|
| `content/posts/*.mdx` | Published voice reference |
| `content/drafts/**` | Work in progress |
| `scripts/prose/check-prose-slop.mjs` | Machine prose gate |
| `improve-writing.md` | Generic concision checklist (secondary) |
| `.claude/agents/copywriting-lead.md` | UI/UX microcopy |
| `docs/LLM_COMPONENT_GENERATION_RULES.md` | Components, not prose |

---

**Last updated:** 2026-10-15 (flagship standard, illustration standard, writing about disability). Project-local only.
