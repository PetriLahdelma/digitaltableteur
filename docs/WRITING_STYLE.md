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
6. **One** hero image per post; no recycled art from other articles; no decorative callout/diagram spam unless they teach something the prose cannot.
7. Read aloud once: does it sound like Petri on [petrilahdelma.com/writing](https://www.petrilahdelma.com/writing), not a generic AI essay?

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
| Paragraph length | 2–5 sentences; **avoid** single-sentence paragraphs back-to-back |
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

End with **one clear takeaway or next action** (read the next post, run a command, adopt a test). No summary-of-summaries unless the piece is >2,500 words.

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

**Last updated:** 2026-05-28 — project-local only.
