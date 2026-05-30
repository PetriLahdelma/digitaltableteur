# Sanity CMS & blog

> **Scope:** `digitaltableteur-blog/` (studio) + blog routing in `app/blog/`  
> **Skill:** [`.claude/skills/dt-sanity-cms/SKILL.md`](../.claude/skills/dt-sanity-cms/SKILL.md)

---

## Identity

Sanity Studio for blog content. Published posts flow into `nextjs-app/shared/data/blogManifest.ts` for Next.js routes.

---

## Commands

```bash
npm run sanity:dev       # Studio locally
npm run sanity:publish   # Publish + refresh blog manifest
node scripts/generate-blog-manifest.mjs   # Manual manifest regen
```

**Build depends on manifest** — `npm run build` triggers generation pre-build.

---

## Key paths

| Path | Purpose |
|------|---------|
| `digitaltableteur-blog/sanity.config.ts` | Studio config |
| `digitaltableteur-blog/schemaTypes/` | post, author, category, blockContent |
| `app/blog/[slug]/page.tsx` | Dynamic post route |
| `app/blog/postMetadata.ts` | Generated post metadata |
| `nextjs-app/shared/data/blogManifest.ts` | Generated manifest |

---

## Writing voice

Long-form blog and draft MDX: read **[`docs/WRITING_STYLE.md`](../docs/WRITING_STYLE.md)** before editing prose. That guide is **scoped to this repository** — do not copy to llm-wiki or global agent skills. UI microcopy stays in [`.claude/agents/copywriting-lead.md`](../.claude/agents/copywriting-lead.md).

Raster heroes / OG images: **[`docs/CODEX_IMAGE_GENERATION.md`](../docs/CODEX_IMAGE_GENERATION.md)** + [`docs/OG_IMAGE_GENERATION_GUIDE.md`](../docs/OG_IMAGE_GENERATION_GUIDE.md).

---

## Publishing workflow

1. Edit content in Sanity Studio
2. Run `npm run sanity:publish` (or `scripts/publish-from-sanity.sh`)
3. Manifest regenerates → commit if changed
4. Verify `/blog` and individual slugs locally

---

## OG / metadata

- Posts: hero image when available; else colocated `opengraph-image.tsx`
- Authors: profile photo or generated OG card
- Do not hardcode `logo512.png` in metadata

---

## MUST NOT

- Edit `blogManifest.ts` or `postMetadata.ts` by hand (generated)
- Ship without regenerating manifest after CMS publish

---

## Quick find

```bash
rg -n "sanity" package.json scripts/
ls digitaltableteur-blog/schemaTypes/
```
