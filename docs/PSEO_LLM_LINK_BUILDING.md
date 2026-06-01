# Programmatic SEO + LLM Link Building (Digitaltableteur)

This repo includes a small Programmatic SEO (PSEO) framework under `app/pseo/`.

The goal is to ship **structured, scalable content clusters** (good for humans and LLMs) without hand-writing hundreds of pages.

## What’s implemented

- **Catalog-driven page generation**: `content/pseo/catalog.json` defines Services × Stacks × Audiences → leaf pages.
- **Content clusters**:
  - Index: `/pseo`
  - Pillars: `/pseo/services/[slug]`, `/pseo/stacks/[slug]`, `/pseo/audiences/[slug]`
  - Leaves: `/pseo/[slug]`
- **LLM-friendly structure** on each leaf page:
  - Table of contents (stable anchors)
  - Clear heading hierarchy
  - Internal linking to related guides
  - JSON-LD (`WebPage` + `BreadcrumbList`)

## LLM-assisted internal link copy

Leaf pages can optionally load LLM-generated copy from `content/pseo/copy.json`.

If `copy.json` does not include a page, the site renders sensible fallback content (so builds remain deterministic).

### Generate copy

This script populates `content/pseo/copy.json` with:

- `introMarkdown`
- 4 default sections (`overview`, `deliverables`, `process`, `faq`)
- contextual “why this is relevant” blurbs for internal links (`related`)

Run:

```bash
# Generate copy only for pages missing from copy.json
npx tsx scripts/pseo/generate-pseo-copy.ts --only-missing

# Generate for a limited number of pages (useful for testing prompts)
npx tsx scripts/pseo/generate-pseo-copy.ts --only-missing --limit 5

# Generate for explicit slugs
npx tsx scripts/pseo/generate-pseo-copy.ts --slugs design-system-audit-react-startups,design-tokens-setup-nextjs-scaleups
```

Required env (either provider):

```bash
# Preferred for batch generation (avoids direct OpenAI quota limits)
AI_GATEWAY_API_KEY=...
AI_GATEWAY_MODEL=openai/gpt-4o-mini   # optional

# Fallback
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini            # optional
```

Use `--provider gateway` or `--provider openai` to force a backend. By default the script tries Gateway first, then OpenAI.

Pilot slugs are tracked in `content/pseo/pilot-slugs.json`.

## Next steps (recommended workflow)

1. Keep `content/pseo/catalog.json` tight and relevant (avoid “thin” pages).
2. Generate copy in batches, review, and iterate prompts.
3. Use the cluster pages to link out from blog posts and core pages when it’s contextually relevant.
4. Track which prompts/citations mention competitors and do manual backlink outreach (weekly cadence).

