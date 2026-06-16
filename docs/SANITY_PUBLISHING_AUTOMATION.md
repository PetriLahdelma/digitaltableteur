# Automated Sanity Publishing Workflow

This guide explains how to automatically publish articles from Sanity CMS to your Next.js blog with full routing integration.

## Quick Start

### Publish All Articles (Full Sync)

```bash
npm run sanity:publish
```

This will:

1. Sync all published articles from Sanity
2. Update blog metadata and routing
3. Generate `postMetadata.ts` with all articles

### Publish Single Article (Recommended)

```bash
npm run sanity:publish-single <article-slug>
```

**Example:**

```bash
npm run sanity:publish-single the-evolutionary-difference-between-constructive-and-constrictive-criticism
```

This will:

1. Sync only the specified article from Sanity
2. Update blog metadata and routing
3. Show direct link to the published article

## What Gets Automated

The publishing process handles:

1. **Content Sync** (`scripts/sanity-migration/syncFromSanity.js`)
   - Fetches article(s) from Sanity CMS
   - Converts to MDX format
   - Saves to `content/posts/`

2. **Metadata Generation** (`scripts/update-post-metadata.ts`)
   - Scans all MDX files in `content/posts/`
   - Extracts frontmatter (title, slug, publishedAt, etc.)
   - Generates `app/blog/postMetadata.ts` (production Next.js App Router)

3. **Routing Setup** (automatic via Next.js)
   - MDX files are automatically imported via `import.meta.glob` in `nextjs-app/shared/data/blogPosts.ts`
   - Blog pages use `getBlogPosts()` and `getBlogPostBySlug()`
   - Routes available at `/blog/<slug>`

## Zero Manual Configuration Required ✨

**All article imports are now automatic!** The blog system uses `import.meta.glob` to dynamically discover and import all MDX files from `content/posts/`. When you publish a new article, it's automatically available without any code changes.

## Removing Unpublished Articles

If you unpublish an article in Sanity:

1. **Delete the MDX file:**

   ```bash
   rm content/posts/article-slug.mdx
   ```

2. **Regenerate metadata:**
   ```bash
   npm run sanity:publish
   ```

That's it! The glob import will automatically exclude the deleted file.

## Workflow Best Practices

### Development Workflow

1. Write and preview article in Sanity Studio (`npm run sanity:dev`)
2. Publish in Sanity when ready
3. Run automated publish script:
   ```bash
   npm run sanity:publish-single <article-slug>
   ```
4. Verify at `http://localhost:3000/blog/<article-slug>`

### Production Deployment

Option A: **Manual Trigger**

```bash
npm run sanity:publish           # Sync all articles
git add content/posts app/blog/postMetadata.ts
git commit -m "feat: publish new article(s)"
git push
```

Option B: **Webhook Automation** (Advanced)

- Set up Sanity webhook for `post.publish` events
- Trigger GitHub Action or Vercel deploy hook
- Run `npm run sanity:publish` in CI/CD pipeline

## Troubleshooting

### Article Not Appearing

1. Check MDX file exists: `ls -lh content/posts/<slug>.mdx`
2. Verify metadata generated: `grep "<slug>" app/blog/postMetadata.ts`
3. Check browser console for import errors
4. Restart dev server: `npm run dev`

### Stale Content

If you see old content after publishing:

```bash
# Clear Next.js cache
rm -rf .next/cache

# Restart dev server
npm run dev
```

### Metadata Out of Sync

Regenerate metadata:

```bash
npx tsx scripts/update-post-metadata.ts
```

## Files Modified by Automation

| File                                  | Purpose                | Auto-Updated |
| ------------------------------------- | ---------------------- | ------------ |
| `content/posts/*.mdx`                 | Article content        | ✅ Yes       |
| `app/blog/postMetadata.ts`            | Blog routing metadata  | ✅ Yes       |
| `nextjs-app/shared/data/blogPosts.ts` | MDX imports (fallback) | ❌ Manual    |

## Environment Variables

Required in `.env.local`:

```bash
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_TOKEN=your-read-token
```

## Related Scripts

| Script          | Command                                                         | Use Case             |
| --------------- | --------------------------------------------------------------- | -------------------- |
| Full sync       | `npm run sanity:publish`                                        | Sync all articles    |
| Single sync     | `npm run sanity:publish-single <slug>`                          | Publish one article  |
| Sanity Studio   | `npm run sanity:dev`                                            | Edit articles in CMS |
| Manual sync     | `node scripts/sanity-migration/syncFromSanity.js --slug=<slug>` | Debug sync issues    |
| Manual metadata | `npx tsx scripts/update-post-metadata.ts`                       | Regenerate routing   |

## Future Enhancements

Potential improvements:

- [x] ~~Automatic import generation~~ **✅ IMPLEMENTED** via `import.meta.glob`
- [ ] Sanity webhook → GitHub Action integration
- [ ] Draft preview mode (sync drafts to separate directory)
- [ ] Incremental sync (only changed articles)
- [ ] Article unpublish detection (auto-remove from routing)

---

**Last Updated:** December 3, 2025  
**Maintained By:** Petri Lahdelma
