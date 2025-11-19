# Sanity Blog Migration

This repo now ships with a full pipeline for exporting the legacy React/TSX blog posts into the `digitaltableteur-blog` Sanity dataset. The tooling automates parsing, transformation, asset handling, and upload so you can keep slugs and metadata intact.

## Scripts Overview

All scripts live under `scripts/sanity-migration/` and are exposed via npm commands:

| Command | Purpose |
| --- | --- |
| `npm run sanity:parse-posts` | Parses `src/pages/posts/**/*.tsx`, extracts metadata (titles, dates, authors, slugs) plus body content converted into a Portable Text-like structure. Output: `sanity-output/parsed-posts.json`. |
| `npm run sanity:convert` | Normalizes the parsed content into Sanity-compatible documents (slug objects, ISO dates, SEO fields) and writes both JSON + NDJSON payloads to `sanity-output/`. |
| `npm run sanity:cleanup-legacy` | Deletes any `blog.*` documents from the dataset to avoid conflicts with the new `post.*` IDs. |
| `npm run sanity:upload` | Uploads `sanity-output/sanity-documents.json` into the configured Sanity dataset. Handles image asset uploads, deduplicates by file path, provisions author documents, and preserves legacy URLs via `createOrReplace`. |
| `npm run sanity:sync-from-remote` | Pulls the latest Sanity `post` documents, converts Portable Text → MDX (`content/posts/<slug>.mdx`), generates `public/_redirects`, and archives any local posts that no longer exist upstream. |

Dependencies added:

- Parse/convert: `@babel/parser`, `@babel/traverse`, `he`, `@sanity/client`
- Sync-from-remote: `@portabletext/to-markdown`, `@sanity/image-url`

## Running the Migration

1. **Parse React posts into structured JSON**
   ```bash
   npm run sanity:parse-posts
   ```
   - Reads `src/pages/posts/index.ts` to capture metadata and component file paths.
   - Parses each article’s JSX tree (skipping layout components) to produce normalized Portable Text blocks, embed objects, and image placeholders (`assetPath` values point at the local image files).
   - Output saved to `sanity-output/parsed-posts.json`.

2. **Convert structured data into Sanity documents**
   ```bash
   npm run sanity:convert
   ```
   - Generates ISO `publishedAt` timestamps from the existing `date` strings.
   - Preserves slugs (strip `/blog/` prefix) and legacy URLs.
   - Copies SEO data from the translation keys (`post*MetaTitle` / `MetaDescription`).
   - Writes `sanity-output/sanity-documents.json` and `sanity-output/sanity-documents.ndjson` for reference/import.

3. **Upload into the `digitaltableteur-blog` dataset**
   ```bash
   export SANITY_PROJECT_ID=<id>
   export SANITY_DATASET=digitaltableteur-blog
   export SANITY_TOKEN=<api-token>
   npm run sanity:upload
   ```
   - Uploads any referenced images via `client.assets.upload`.
   - Replaces placeholder blocks (`assetPath`) with proper Sanity asset references.
   - Uses `client.createOrReplace` so reruns remain idempotent.

> Alternatively, you can import `sanity-output/sanity-documents.ndjson` manually via `sanity dataset import ...`, but the provided upload script handles asset references and author documents automatically.

4. **Sync authored content back into the repo (MDX)**
   ```bash
   npm run sanity:sync-from-remote
   ```
   - Fetches every `post` document via the Sanity API.
   - Converts Portable Text blocks (images, embeds, dividers, headings) into Markdown/MDX using `@portabletext/to-markdown`.
   - Writes `content/posts/<slug>.mdx` with YAML frontmatter (title, slug, readTime, dates, SEO, legacy URL).
   - Generates `public/_redirects` (legacy URL → `/blog/<slug>` 301).
   - Moves any `content/posts/*.mdx` files that are no longer in Sanity into `content/archive/posts/`.

## Schema Considerations

The generated documents expect the following schema helpers inside `digitaltableteur-blog`:

- Document type `post` with at least: `title`, `slug`, `excerpt`, `readTime`, `publishedAt`, `author` (reference to `author`), `body`, `legacy`, `seo`.
- Portable Text `body` array supporting:
  - Blocks with styles `normal`, `h2`, `h3`, `blockquote`.
  - Custom `divider` block (simple object with `_type: "divider"`).
  - Custom `embed` object with `provider`, `url`, `title`.
  - `image` type with `asset`, `alt`, `caption`.

Adjust the schema to map these shapes as needed (or tweak the scripts if you prefer different type names).

## Keeping URLs & Metadata

- **Slugs**: derived directly from the existing `link` field (e.g. `/blog/figma-mcp-design-systems` → `figma-mcp-design-systems`). This maintains existing routes and allows redirects to stay intact.
- **Legacy URL**: stored in `legacy.url` for downstream redirects.
- **Authors**: pulled from each article’s `<Author name="..." />` usage (defaults to “Digitaltableteur” if absent).
- **Images**: resolved from the TSX import graph so relative asset paths stay connected to the correct post.
- **SEO**: pulled from the English translations (e.g. `postDesigning2025MetaTitle`), ensuring parity with the current meta tags.

If you hit edge cases (e.g., additional custom JSX components or new fields), update `parsePosts.js`/`syncFromSanity.js` handlers. Because both pipelines operate on structured ASTs/Portable Text, it’s easy to extend support for new tags/components without rewriting everything.

## Two-way Sync & Automation Ideas

You now have both directions covered:

- **Local → Sanity**: `sanity:parse-posts` → `sanity:convert` → `sanity:upload` (plus `sanity:cleanup-legacy` if you need to reset IDs).
- **Sanity → Local**: `sanity:sync-from-remote` writes MDX files + `_redirects`, making it easy to redeploy the static blog from canonical CMS content.

To keep things in sync automatically:

1. **Editing in Sanity updates the site**
   - Configure a Sanity webhook (e.g., trigger on `post` mutations) that hits a Vercel build hook or GitHub Action.
   - The hook can run `npm run sanity:sync-from-remote` before building to refresh `content/posts`.
   - Commit the resulting MDX files (if desired) or treat them as build artifacts.

2. **Editing locally updates Sanity**
   - Run the existing migration pipeline after modifying TSX/MDX content locally (or author new MDX, convert to TSX, and re-run `sanity:upload`).
   - For a more automated approach, add a GitHub Action that watches `content/posts/*.mdx` (or new MDX sources), converts them to Portable Text, and runs `sanity:upload`.

3. **Conflict resolution**
   - Treat Sanity as the source of truth and only allow `sanity:upload` in CI when you explicitly intend to push local changes.
   - Include the document `_rev` in future scripts if you want optimistic concurrency (skip uploads when the remote revision is newer).

4. **Hourly/on-demand sync**
   - Schedule a GitHub Action or cron job that runs `npm run sanity:sync-from-remote` hourly.
   - Pair it with the webhook-driven build to ensure the deployed site always reflects the latest Sanity edits.

With these scripts + hooks, you can iterate in either environment (Sanity Studio or the repo) and keep URLs, slugs, redirects, and metadata intact.

### GitHub Action + Sanity Webhook

- `.github/workflows/sanity-sync.yml` runs on demand (`workflow_dispatch`), hourly (CRON), or when a `repository_dispatch` with `event_type: sanity-update` is received. It installs dependencies, runs `npm run sanity:sync-from-remote`, and auto-commits updates (`content/posts/**`, `content/archive/posts/**`, `public/_redirects`).
- Create a Sanity webhook (triggered on `post` publish/update) that POSTs to GitHub’s Repository Dispatch API:
  ```
  POST https://api.github.com/repos/<org>/<repo>/dispatches
  Headers: Authorization: Bearer <GitHub PAT>, Accept: application/vnd.github+json
  Body: { "event_type": "sanity-update" }
  ```
  This notifies the Action that new content is ready.
- Store `SANITY_PROJECT_ID`, `SANITY_DATASET`, and `SANITY_TOKEN` as GitHub secrets so the workflow can authenticate with Sanity. The sync script already moves removed posts into `content/archive/posts/` (tracked via `.gitkeep`), so nothing is lost when a document is deleted upstream.

Once this webhook is active, Sanity edits automatically trigger MDX regeneration + redirects, keeping the deployed blog in step with the CMS without manual intervention.
