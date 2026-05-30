# Agentic Design Systems Draft Series

**Voice:** [`docs/WRITING_STYLE.md`](../../../docs/WRITING_STYLE.md) (project-local; prose-first, humor when it fits, CTAs in footer only).

These drafts live outside `content/posts` until promoted. The blog manifest generator
includes scheduled drafts in the build artifact; runtime hides them until `publishedAt`.

## Publishing cadence

| Date (08:00 UTC) | Part | Slug |
|------------------|------|------|
| 2026-06-03 | 1 | `agentic-design-systems-need-operating-models-not-more-components` |
| 2026-06-07 | 2 | `tools-harnesses-and-skills-the-missing-model-for-design-systems` |
| 2026-06-11 | 3 | `component-contracts-are-where-taste-becomes-infrastructure` |
| 2026-06-15 | 4 | `the-minimum-viable-agent-ready-design-system` |
| 2026-06-19 | 5 | `from-designops-to-agentops` |

## Positioning

**Theory → operations:**

- [Design systems for bots](https://www.petrilahdelma.com/writing/design-systems-for-bots) — maturity model (readability / executability / survivability)
- [From Tokens to Thinking Systems](/blog/from-tokens-to-thinking-systems-making-ai-native-design-systems-actually-work) — what to encode
- [Figma MCP](/blog/figma-mcp-design-systems) — one tool surface
- **This series** — how teams operate when agents, linters, and humans share a repo

Suggested opener for Part 1 (included in draft): *Tokens* = encode; *Figma MCP* = tool; series = operate with CI evidence.

## Honesty: v1 vs v2 contracts

Council review (May 2026) flagged aspirational JSON in early drafts. Current drafts distinguish:

- **v1 structural (shipped)** — `validate:components` on 127 `.contract.json` files: props/CVA, required stories, a11y flags, tokens
- **v2 semantic (target)** — `forbiddenUse`, action hierarchy, composition lint — documented, migrating into checks

Blog examples labeled `.target.json` or “target schema” are design direction, not current CI failures.

## Series navigation

Each post includes Part N of 5 footer with prev/next links. Part 5 links back to Part 1.

## Cross-links and tooling

- npm: `@petritapanilahdelma/llm-component-contracts`, `llm-component-cli`
- Repo: `docs/LLM_COMPONENT_GENERATION_RULES.md`, `npm run validate:components`
- Agent skills: `/.well-known/agent-skills/index.json`
- https://projectspine.dev (harness packaging, external)

### Figma agent surfaces (external)

| Surface | Author | Links |
|---------|--------|-------|
| Official Figma MCP | Figma | [Intro](https://www.figma.com/blog/introducing-figma-mcp-server/) · [Site post](/blog/figma-mcp-design-systems) |
| Figma Console MCP | TJ Pitre | [GitHub](https://github.com/southleft/figma-console-mcp) · [Docs](https://docs.figma-console-mcp.southleft.com/) |
| figma-cli | Sil Bormüller | [GitHub](https://github.com/silships/figma-cli) · [Tutorial](https://www.intodesignsystems.com/blog/claude-code-figma-no-mcp) |

Part 2 draft includes intros for Console MCP and figma-cli under **Three Figma surfaces (not interchangeable)**.

## Hero & illustration assets (series-only)

| Asset | Path | Source |
|-------|------|--------|
| Heroes (1536×1024 PNG) | `public/blog/agentic-design-systems/hero-0N-*.png` | Codex `$imagegen` (May 2026) |
| Inline figures (1200×800 PNG) | `public/blog/agentic-design-systems/fig-*.png` | Codex `$imagegen` |
| Legacy SVG (reference) | `hero-*.svg`, `*.svg` diagrams | Pre-Codex; keep for diff only |

Art direction: [`VISUAL_BRIEF.md`](VISUAL_BRIEF.md). Regenerate prompts: [`codex-prompts/`](codex-prompts/). Workflow: [`docs/CODEX_IMAGE_GENERATION.md`](../../../docs/CODEX_IMAGE_GENERATION.md).

Draft MDX `mainImageUrl` points at **PNG heroes**. Do not reuse Sanity assets from other published articles. Before launch, optionally export WebP/OG 1200×630 to Sanity and update `mainImageUrl`.

Token lint in this repo: `stylelint-declaration-strict-value` (not Rhythmguard).

## CTA pattern (post-council)

- Part 1: services contact
- Part 2: tooling links + soft contact
- Part 3: tooling links + soft contact
- Parts 4–5: editorial closing questions (no services pitch)

## Scheduling

- `status: "draft"` — unpublished
- `status: "scheduled"` + future `publishedAt` — bundled, hidden until date
- Preview (pick one):
  - **`npm run dev:drafts`** — sets env, regenerates blog manifest, starts dev (port **3001**)
  - **`/blog?preview=drafts`** — cookie toggle (no env edit); turn off with `/blog?preview=off`
  - `.env.local`: `NEXT_PUBLIC_SHOW_UNPUBLISHED_POSTS=true` then restart `npm run dev`
- After MDX edits: `npm run generate:blog` (no longer runs on every `npm run dev`)

To promote: move MDX to `content/posts/` or adjust pipeline when ready.
