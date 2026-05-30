# Agentic Design Systems — Content Enrichment Plan

**Goal:** Bring the five scheduled drafts to the standard of contemporary AI + design-system + devtooling articles (2025–2026), without turning them into generic “AI thought leadership.”

**Benchmark set (reviewed May 2026):**

| Source | What they do well |
|--------|-------------------|
| [Polente — Agentic Design Workflow](https://b.polente.de/blog/TheAgenticDesignWorkflowOrchestratingMCPAndAIForScale/) | Step-based narrative, layered MCP architecture, executive summary, visual workflow steps |
| [Figma — Design Agent + MCP](https://www.figma.com/blog/the-figma-agent-is-here/) | Product visuals, clear tool boundaries, “when to use what” framing |
| [Vicente G. — DS for AI agents](https://medium.com/@vicentegrafico.com/design-systems-for-ai-agents-the-new-paradigm-shift-ad097cfae228) | Progressive context layers (foundations → components → composition → quality) |
| [Lasso — AI + Figma MCP DS](https://www.lasso.security/blog/scalable-design-system-with-ai-figma-mcp) | Concrete inspection outcomes (token drift, variant duplication), security angle |
| **Your published posts** | `mainImageUrl`, inline figures, multiple JSON blocks, narrative density |

### Community Figma devtooling (cite in series)

| Tool | Author | Link | When to mention |
|------|--------|------|-----------------|
| **Figma Console MCP** | TJ Pitre | [GitHub](https://github.com/southleft/figma-console-mcp) · [Docs](https://docs.figma-console-mcp.southleft.com/) | Post 2 — tools layer; extraction/write/debug; multi-MCP teams |
| **figma-cli** | Sil Bormüller | [GitHub](https://github.com/silships/figma-cli) · [Tutorial](https://www.intodesignsystems.com/blog/claude-code-figma-no-mcp) | Post 2 — CLI vs MCP; terminal harness; bulk token/variable ops |
| **Official Figma MCP** | Figma | [Blog intro](https://www.figma.com/blog/introducing-figma-mcp-server/) · [Your post](/blog/figma-mcp-design-systems) | Post 1 opener, Post 2 contrast |

**Intro copy pattern (Post 2):** One short paragraph each — what it is, who built it, how it differs from official MCP, when a squad should try it. Frame all three as **tools column only**; none replaces contracts or CI.

**Visual (enrichment):** Optional comparison card — Official MCP vs Console MCP vs CLI (transport, setup, read/write, best fit).

---

## 1. Gap analysis: reference vs current drafts

| Dimension | Contemporary articles | Current series (avg ~1,000 words/post) |
|-----------|----------------------|----------------------------------------|
| **Hero** | OG image + often in-article diagram above fold | **Unique** series heroes only (`public/blog/agentic-design-systems/hero-*.svg`) — never recycle another post’s Sanity art |
| **Typographic hierarchy** | Summary → H2 chapters → H3 steps → callouts; sidebars | Mostly H2 + bullets; few H3s; no callouts |
| **Visual rhythm** | Image/diagram every 2–4 scroll depths | Code/txt blocks only; no photos, charts, or diagrams |
| **Evidence** | Screenshots, terminal output, Figma frames, CI logs | JSON/YAML samples; little “show your work” |
| **Tables** | Used sparingly; often replaced by comparison cards | One diagnostic table (Post 2); removed elsewhere |
| **Architecture visuals** | Layer diagrams (MCP, harness, skills, contracts) | Described in prose only |
| **Interactive / embed** | Rare; MCP Apps, Figma embeds where relevant | None |
| **Read time honesty** | 8–12 min usually = 1,800–2,400 words + visuals | ~1,000 words labeled 7–9 min |

**Core diagnosis:** The series reads like a **well-edited memo**, not a **2026 design-engineering article**. Ideas are sound; **format and proof** lag the bar set by your own `figma-mcp` and `from-tokens` posts—and by Polente/Figma/Lasso.

---

## 2. Target article anatomy (template)

**Editorial rule (May 2026):** Legibility beats density. One hero per post; inline figures only when prose cannot carry the idea. No “In this post” callout boxes. Prefer continuous paragraphs over bullet stacks and duplicate diagrams.

```
1. Hero image (series-only, unique asset)
2. Lede — 2–4 sentences, one movement of thought
3. H2 sections — mostly prose; code samples where they prove CI truth
4. At most one table OR one short list per major section (not both)
5. Single-line series nav (no stacked CTAs / `<br />` blocks)
```

### Typographic hierarchy rules

| Level | Use for | Style (blog prose) |
|-------|---------|-------------------|
| **Lede** | First paragraph after hero | Slightly larger or bold opening sentence; max 3 sentences |
| **H2** | Major movements (3–5 per post) | Chapter breaks; always followed by visual or example within 2 paragraphs |
| **H3** | Steps, case fragments, sub-concepts | Numbered where sequential (Step 1, Step 2) |
| **Callout** | Warnings, v1/v2 honesty, definitions | `>` blockquote with bold label |
| **Figure + caption** | Every diagram/screenshot | `<figure>` + `figcaption` (existing MDX pattern) |
| **Code** | Repo truth | `title=` filename; caption explaining what fails/passes CI |

**Prerequisite:** Restore proper blog `prose` styling (`@tailwindcss/typography` or equivalent)—do not maintain a parallel `.articleBody` typography system.

---

## 3. Visual asset library (shared across series)

Create once, reuse with post-specific captions.

| Asset ID | Type | Used in | Description |
|----------|------|---------|-------------|
| `ADS-hero-series` | Illustration / OG | All 5 | Abstract “operating loop” or MCP→harness→contract pipeline; brand colors |
| `ADS-diagram-loop` | Diagram | Post 1, 5 | Intent → Rules → Output → Evidence → Better rules |
| `ADS-diagram-layers` | Diagram | Post 2 | Tools / Harness / Skills stack + symptom→layer arrows |
| `ADS-diagram-contract` | Diagram | Post 3 | Docs vs contracts; v1 structural vs v2 semantic |
| `ADS-diagram-mvp` | Diagram | Post 4 | Six-layer stack + 30-60-90 timeline |
| `ADS-diagram-agentops` | Diagram | Post 5 | DesignOps → AgentOps; context operator role |
| `ADS-screenshot-validate` | Terminal | Post 1, 3, 5 | Real `npm run validate:components` failure/success (redacted) |
| `ADS-screenshot-storybook` | UI | Post 3, 4 | Button stories + contract-required states |
| `ADS-screenshot-figma-mcp` | UI | Post 2 | Callback to existing Figma MCP post frame |
| `ADS-chart-maturity` | Chart | Post 1, 4 | Readability / Executability / Survivability maturity bar |
| `ADS-table-diagnostic` | Designed table | Post 2 | Symptom → misdiagnosis → layer (styled in Figma, export PNG) |

**Production options:**

1. **Figma** — Use design system components; export 2x PNG/WebP to Sanity or `/public/blog/`
2. **Mermaid in MDX** — Fast for flowcharts (if pipeline supports server render or pre-render to SVG)
3. **Sanity** — Upload with `mainImageUrl` + inline figures (matches existing posts)

---

## 4. Per-post enrichment matrix

### Post 1 — Operating Models (Jun 3)

| Add | Details |
|-----|---------|
| Hero | `mainImageUrl` — loop diagram or agent+DS abstract |
| Above fold | 3-bullet “In this post” summary |
| Diagram | Operating model loop (replace plain txt block or supplement) |
| Chart | Maturity model: Readability / Executability / Survivability |
| Screenshot | Stale Storybook story vs contract-flagged legacy story |
| Code | Short real excerpt from `LLM_COMPONENT_GENERATION_RULES.md` (not fictional dialog JSON) |
| Callout | v1 vs v2 contracts honesty box |
| Structure | Split “Governance” into H3: review questions, token lint example |
| Words | Target **1,600–1,900** (+ diagrams) |

### Post 2 — Tools, Harnesses, Skills (Jun 7)

| Add | Details |
|-----|---------|
| Hero | Three-layer stack illustration |
| Diagram | Tool → Harness → Skill → Evidence flow (replace ascii txt) |
| Visual table | Export diagnostic table as designed graphic (not raw MD table) |
| Screenshot | `AGENTS.md` + skills index URL snippet |
| Code | Real `Button.contract.json` path list in harness YAML context |
| Comparison | Side-by-side “wrong layer” mini cases (2 columns, image) |
| Link | Embed/cite existing [Figma MCP post](/blog/figma-mcp-design-systems) with its hero thumb |
| References | **Done in draft:** Figma Console MCP (TJ Pitre) + figma-cli (Sil Bormüller) in “Three Figma surfaces” H3 |
| Visual | Comparison card: Official MCP vs Console MCP vs CLI |
| Words | Target **1,700–2,000** |

### Post 3 — Component Contracts (Jun 11)

| Add | Details |
|-----|---------|
| Hero | “Taste with handles” — designer glance + contract overlay mock |
| Diagram | Documentation vs constraint; encode vs leave human |
| Code | Shipped `Button.contract.json` + separate v2 target panel (two windows) |
| Screenshot | `validate:components` CLI output (primary+danger failure when v2 lands) |
| Figure | Review flow diagram (replace txt-only review-flow) |
| Pull quote | One line from design-systems-for-bots on executability |
| Words | Target **1,800–2,100** |

### Post 4 — Minimum Viable (Jun 15)

| Add | Details |
|-----|---------|
| Hero | “Cathedral vs squad” — simple metaphor illustration |
| Diagram | Six-layer stack (vertical, annotated) |
| Timeline | 30-60-90 visual (Gantt-style, not bullet-only) |
| Chart | Pain → first move (bar or matrix graphic) |
| Code | `minimum-agent-ready-system.json` kept but add caption + link to repo scripts |
| Photo/diagram | Squad ownership RACI-lite (Design / Eng / Shared) |
| Words | Target **1,700–2,000** |

### Post 5 — AgentOps (Jun 19)

| Add | Details |
|-----|---------|
| Hero | DesignOps → AgentOps bridge diagram |
| Diagram | Context operator: sources → curated context → agent |
| Screenshot | CI failure story (Button contract / Storybook rename) |
| Structure | Responsibilities as icon row or card grid image (not prose labels only) |
| Cadence | Weekly loop visual (daily/weekly/monthly/quarterly) |
| Series index | Visual “map” of all 5 posts with one-line thesis each |
| Words | Target **1,400–1,700** (capstone can be slightly shorter if visual-heavy) |

---

## 5. Content quality upgrades (all posts)

### Voice and structure

- Open with **scene or observation** (like Figma MCP post), not “wrong question” template on every installment
- One **named example** per post (team type, failure mode, fix)—anonymized case study
- Replace repeated series vocabulary in body (operating loop, hallway memory) with **cross-links** instead of re-explaining
- Add **“What we’d do differently”** short H3 on Posts 2 and 4 (practitioner credibility)

### Code blocks

| Rule | Action |
|------|--------|
| Real > aspirational | Label `*.target.json` clearly; pair with shipped file |
| Captions | Every block: what it proves, what CI does today |
| Languages | Mix: `json`, `yaml`, `bash`, `tsx` (Storybook snippet) |
| Length | Max 25 lines per block; link to repo path for full file |

### MDX components to use (existing stack)

- `<figure>` + `![...]()` + `<figcaption>` — inline images
- Fenced code with `title=` → `CodeBlockWindow` via ArticlePageTemplate
- `mainImageUrl` in frontmatter — blog index + OG + ArticleHero
- Optional: add `Callout` MDX shortcode (info/warning) if blockquotes are insufficient

---

## 6. Technical prerequisites (before enrichment pass)

| Task | Owner | Why |
|------|-------|-----|
| Fix `/blog` route and restore `prose` typography | Eng | Enrichment useless if layout broken |
| Add `@tailwindcss/typography` (Tailwind 4) OR document prose alternative | Eng | `prose-*` classes currently ineffective |
| Install `@tailwindcss/typography` in `app/tailwind.css` | Eng | One-line plugin enable |
| Regenerate `blogManifest` after frontmatter images | Content | `npm run generate:blog` |
| Draft preview UX | Eng | **`npm run dev:drafts`**, `/blog?preview=drafts`, banner on `/blog` |
| Define OG template in Figma (1200×630 + 900×512) | Design | Series consistency |
| Sanity upload path for series assets | Content | Match published posts CDN pattern |

---

## 7. Phased execution (before publish dates)

| Phase | When | Deliverables |
|-------|------|----------------|
| **0 — Unblock** | Immediately | Blog route stable; typography = design system prose |
| **1 — Shared assets** | Week 1 | 6 diagrams + series hero + OG template in Sanity |
| **2 — Posts 1–2** | Week 2 | **Done (May 2026):** heroes, SVG diagrams, takeaway boxes, Figma tooling links; preview via `npm run dev:drafts` |
| **3 — Posts 3–4** | Week 3 | Code evidence + contract visuals |
| **4 — Post 5 + series map** | Week 4 | Capstone visuals + series index graphic |
| **5 — QA** | Before each `publishedAt` | Read time recalc, `validate:mdx`, mobile screenshot pass |

**Cadence alignment:**

| Publish | Post | Enrichment deadline (suggested) |
|---------|------|--------------------------------|
| Jun 3 | 1 | May 29 |
| Jun 7 | 2 | Jun 2 |
| Jun 11 | 3 | Jun 6 |
| Jun 15 | 4 | Jun 10 |
| Jun 19 | 5 | Jun 14 |

---

## 8. Success criteria (definition of “meets 2026 bar”)

A post is ready when:

1. **Hero image** present and relevant in frontmatter
2. **≥ 3 figures** (diagram, screenshot, or chart) with captions
3. **≥ 2 code blocks** with repo-linked captions
4. **H3 structure** inside every H2 section
5. **No wall of bullets** longer than 5 items without narrative break
6. **Read time** recalculated after final word count + visual pause
7. **Mobile check** — hierarchy readable, descenders not clipped, tables scroll or are images
8. **One cross-link** to prior published post + one forward link in series

---

## 9. Optional stretch (differentiation)

| Idea | Post | Effort |
|------|------|--------|
| Interactive maturity checklist | 4 | Medium — embed simple HTML or link to tool |
| FigJam embed | 2 | Low — link to public board |
| Short video/GIF | 3 | High — Storybook + agent diff |
| “Repo tour” sidebar | 3 | Low — link to GitHub paths (public OSS only) |
| Compare table: Tool vs Harness vs Skill | 2 | Low — designed PNG |

---

## 10. Next decision (for Petri)

Choose asset pipeline:

- **A — Sanity-first** (matches production blog, best OG/social)
- **B — `/public/blog/agentic-design-systems/`** (faster iteration, no CMS)
- **C — Figma → export only** (no live embeds)

Recommended: **A for heroes + OG**, **B for inline diagrams** until copy is frozen, then upload to Sanity.

---

*Plan version: 2026-05-30. Complements `README.md` positioning and council editorial pass.*
