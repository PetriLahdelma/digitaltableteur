# Design system catalog policy

**Audience:** Humans and coding agents deciding whether a folder belongs in the agent catalog.

**Machine-readable list:** `nextjs-app/shared/foundations/dist/non-agent-surfaces.json` (regenerate with `npm run audit:catalog -- --emit`).

---

## What “in catalog” means

A component-shaped folder under `nextjs-app/shared/components` or `nextjs-app/shared/patterns` is **in catalog** when it has a `*.contract.json` with `status: beta` or `stable`, plus Storybook stories, MDX, and `spec.md`. Those entries appear in `agent-manifest.json` with generated `agent` blocks.

**Catalog completeness** target is **≥85%** of codebase component folders (see `npm run audit:catalog`). Page assemblies may remain `alpha` until full beta Storybook gates are met.

---

## Out-of-catalog buckets

| Bucket | Count (typical) | Agent rule |
|--------|-------------------|------------|
| **page-pattern** | ~33 | Route/page assemblies (`ArticleContent`, `BlogGrid`, pattern folders tied to one page). Compose UI from cataloged `@dt/*` primitives; do not invent parallel atoms. |
| **exempt** | ~20 | App infrastructure (`AppLoading`, `DonnyActionProvider`, `Prose`, embeds). Not reusable DS API; do not add to manifest without an ADR. |
| **enhanced-fork** | ~6 | Editorial or marketing forks (`Enhanced*`, `*Editorial`). Prefer the base catalog component unless the task names the fork. |
| **catalog-gap** | **0** (target) | Atoms/molecules that should be cataloged but are not. **File a contract before agent use.** CI keeps this at zero (`npm run check:catalog-coverage`). |

---

## Commands

```bash
npm run audit:catalog              # human report
npm run audit:catalog -- --json    # JSON to stdout
npm run audit:catalog -- --emit    # write non-agent-surfaces.json
npm run check:catalog-coverage     # CI gate (≥85%, catalog-gap = 0)
npm run catalog:backfill           # alpha contracts for page assemblies
npm run build:tokens               # manifest + catalog coverage block
```

---

## Related docs

- [AGENTIC_DS_OPERATING_MODEL.md](./AGENTIC_DS_OPERATING_MODEL.md) — agent workflow
- [PUBLIC_API.md](./PUBLIC_API.md) — `@dt/*` import policy
- [FIGMA_DESIGN_SYSTEM_SYNC.md](./FIGMA_DESIGN_SYSTEM_SYNC.md) — Figma loop (code → file)
