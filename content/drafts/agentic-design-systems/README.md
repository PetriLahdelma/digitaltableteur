# Agentic Design Systems Draft Series

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

Token lint in this repo: `stylelint-declaration-strict-value` (not Rhythmguard).

## CTA pattern (post-council)

- Part 1: services contact
- Part 2: tooling links + soft contact
- Part 3: tooling links + soft contact
- Parts 4–5: editorial closing questions (no services pitch)

## Scheduling

- `status: "draft"` — unpublished
- `status: "scheduled"` + future `publishedAt` — bundled, hidden until date
- Preview: `SHOW_UNPUBLISHED_POSTS=true` or `NEXT_PUBLIC_SHOW_UNPUBLISHED_POSTS=true`

To promote: move MDX to `content/posts/` or adjust pipeline when ready.
