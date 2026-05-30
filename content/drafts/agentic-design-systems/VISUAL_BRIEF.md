# Agentic Design Systems — visual brief (Codex imagegen)

**Goal:** Editorial, craft-forward art for five draft posts. Avoid vibe-coded AI tropes (neon gradients, purple haze, 3D glass, stock photos, cute robots).

## Brand palette (use sparingly)

| Token | Hex | Use |
|-------|-----|-----|
| Ink | `#041b23` | Backgrounds, lines |
| Paper | `#f4f1ea` | Light areas |
| Teal | `#85b5bd` | Secondary shapes |
| Violet | `#812eff` | Single accent only |
| Cyan | `#71efff` | Rare highlight |

## Style rules (all assets)

- Print/editorial illustration or restrained geometric collage — Monocle / Stripe Press / design-engineering blog, not Dribbble AI.
- Max 4–5 flat colors + subtle grain; no glow, no lens flare, no “futuristic HUD.”
- **No readable text** in raster heroes (MDX supplies titles).
- Landscape **1536×1024** for heroes; optional **1200×630** OG crops later.
- Abstract systems thinking — diagrams as *objects*, not UI screenshots.

## Heroes (replace `hero-0N-*.svg`)

| File | Concept |
|------|---------|
| `hero-01-operating-models.png` | Circular **operating loop** as a physical dial or orbit diagram on paper: intent → rules → output → evidence → better rules. Feels like an operations map, not a SaaS infographic. |
| `hero-02-tools-harness-skills.png` | Three stacked **layers** (tool / harness / skill) as cut paper or architectural section — workspace at bottom, boundary frame middle, playbook cards top. |
| `hero-03-contracts.png` | **Contract** as infrastructure: documentation sheet fading into enforced grid/lint marks — taste becoming structure. Split or layered composition. |
| `hero-04-mvp.png` | **Minimum stack** — six thin horizontal slabs (tokens, components, stories, contracts, CI, review) like a museum specimen or engineering stack, modest scale. |
| `hero-05-agentops.png` | **Bridge** from DesignOps (process nodes) to AgentOps (context operator) — elegant span or arch, human scale, not org-chart clipart. |

## Inline illustrations (optional in-article)

| File | Concept |
|------|---------|
| `fig-operating-loop.png` | Simpler loop diagram for Part 1 body |
| `fig-tools-layers.png` | Three-layer model for Part 2 |
| `fig-contract-v1-v2.png` | Two-tier contract layers for Part 3 |
| `fig-mvp-stack.png` | Six-layer stack for Part 4 |
| `fig-agentops-bridge.png` | DesignOps → AgentOps bridge for Part 5 |

Keep inline figures smaller in composition (more margin, single focal object).

## In-article layout (MDX)

Use `data-layout` on `<figure>` (rendered by `MdxFigure`):

| Value | Use when |
|-------|----------|
| `data-layout="full"` | Wide section diagrams — image spans prose width |
| `data-layout="center"` | Focal/circular diagrams — image capped at `max-w-3xl`, centered |

Captions are always centered below. Series assignment: Part 1 center, 2–3 full, 4 center, 5 full.
