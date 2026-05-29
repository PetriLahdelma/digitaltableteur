---
name: dt-sanity-cms
description: >-
  Publishes and edits Digitaltableteur blog content via Sanity CMS, regenerates
  blog manifest, and verifies blog routes. Use when the user says "Sanity",
  "publish blog", "sanity:publish", "blog post", "blog manifest", "schemaTypes",
  or edits digitaltableteur-blog/ or app/blog/. Do NOT use for generic Next.js
  pages outside blog (dt-nextjs-app) or component work (dt-design-system).
metadata:
  version: 1.1.0
  category: cms
---

# Sanity CMS and blog workflow

## Instructions

### Step 1: Load context

Read [`references/area-guide.md`](references/area-guide.md) and [`digitaltableteur-blog/AGENTS.md`](../../digitaltableteur-blog/AGENTS.md).

Schema types: `digitaltableteur-blog/schemaTypes/`

### Step 2: Publish content

```bash
npm run sanity:dev          # optional local studio preview
npm run sanity:publish      # publish + refresh manifest
```

Alternative: `scripts/publish-from-sanity.sh`

Expected: updates to `nextjs-app/shared/data/blogManifest.ts` and/or `app/blog/postMetadata.ts`.

### Step 3: After publish

1. Inspect git diff for generated manifest files
2. Commit generated changes if intentional
3. Verify routes locally:

```bash
npm run dev
# /blog, /blog/[slug], /blog/authors/[slug]
```

### Step 4: Schema changes

When editing `schemaTypes/`:

1. Update app TypeScript types if referenced
2. `npm run sanity:dev` — confirm studio loads
3. Republish sample content to validate GROQ queries

CRITICAL: never hand-edit generated manifest files.

---

## Examples

### Example 1: New blog post live

User says: "I published an article in Sanity, make it show on the site"

Actions:

1. Run `npm run sanity:publish`
2. Commit manifest diff if changed
3. Verify `/blog/[slug]` renders with correct metadata and OG image

### Example 2: Author page OG wrong

User says: "Author OG uses old logo"

Actions:

1. Check `app/blog/authors/[slug]/` for `opengraph-image.tsx`
2. Prefer profile photo; fallback to generated card
3. Remove any hardcoded `logo512.png` from metadata

---

## Troubleshooting

### Build fails: missing post in manifest

Cause: manifest not regenerated after CMS publish.

Solution: `npm run sanity:publish` or `node scripts/generate-blog-manifest.mjs`

### Studio won't start

Cause: missing Sanity env vars or wrong project ID.

Solution: ask user to verify `.env.local` Sanity credentials; do not commit them.

### Slug 404 after publish

Cause: post not in manifest or visibility flag excludes it.

Solution: check `getVisiblePosts()` / manifest entry and post status in Sanity.

---

## Boundaries

- MUST NOT hand-edit `blogManifest.ts` or `postMetadata.ts`
- Ask before bulk delete or destructive CMS operations
