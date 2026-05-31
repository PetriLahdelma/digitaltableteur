# Blog SEO & AEO Audit — Digitaltableteur

**Date:** 2026-05-28  
**Scope:** `/blog`, `/blog/[slug]`, `/blog/authors/[slug]`, discovery surfaces (sitemap, robots, RSS, llms.txt)

---

## Executive summary

The blog was **partially invisible** to crawlers and AI systems because article **body content was client-rendered only**. Metadata, JSON-LD, and sitemap entries existed, but the initial HTML for articles did not contain the MDX body — only a client shell that hydrated after JavaScript.

This audit identified **12 issues** (4 critical, 5 high, 3 medium). **8 fixes shipped in this pass**; **4 items remain** as follow-up (content/ops, not code).

| Severity | Issue | Status |
|----------|-------|--------|
| **Critical** | Article MDX body client-only (empty HTML for non-JS crawlers) | **Fixed** — `ServerArticleContent` SSR |
| **Critical** | Canonical URL www vs non-www split | **Fixed** — `app/lib/siteUrl.ts` |
| **High** | No RSS/Atom feed | **Fixed** — `/blog/feed.xml` |
| **High** | Blog index missing CollectionPage JSON-LD | **Fixed** |
| **High** | Author pages missing canonical + Person schema | **Fixed** |
| **High** | Author pages absent from sitemap | **Fixed** |
| **High** | Footer missing internal link to `/blog` | **Fixed** |
| **Medium** | Blog index UI paginated client-side | **Mitigated** — sr-only full index retained |
| **Medium** | 5 scheduled posts hidden until publish date | **Open** — content ops |
| **Medium** | Homepage visible UI lacks `/blog` link | **Open** — Wave 1 IA |
| **Low** | No hreflang on blog (EN-only content) | **Acceptable** |
| **Low** | Legacy `nextjs-app/app/blog/` mirror | **Open** — cleanup |

---

## Architecture (baseline)

```
Sanity CMS → content/posts/*.mdx
           → scripts/generate-blog-manifest.mjs → blogManifest.ts
           → scripts/update-post-metadata.ts    → app/blog/postMetadata.ts

Routes:
  /blog              app/blog/page.tsx (ISR 600s)
  /blog/[slug]       app/blog/[slug]/page.tsx (ISR 600s + static params)
  /blog/authors/*    app/blog/authors/[slug]/page.tsx
  /blog/feed.xml     app/blog/feed.xml/route.ts (NEW)
```

**Visible posts:** 12 published (as of audit date). **5 scheduled** agentic-design-systems posts with `status: "scheduled"` and future `publishedAt` — correctly excluded from sitemap, RSS, and public index until dates pass.

---

## Crawlability

### What worked before

- `robots.txt` allows `/blog` (disallows only `/api`, `/studio`)
- `sitemap.xml` included `/blog` and published post URLs
- Blog index had **sr-only** flat link list (crawler aid for paginated client UI)
- Per-article `BlogPosting` JSON-LD on server
- `llms.txt` / `llms-full.txt` list blog index + featured posts
- Middleware does not block blog routes

### Root cause: client-only article body

`app/blog/[slug]/page.tsx` rendered `<ClientArticle />` → `BlogArticlePage` → `ArticlePageTemplate` (all `"use client"`). Server response contained JSON-LD + empty article shell until hydration.

**Impact:**
- Bing, social scrapers, some AI crawlers saw title/meta but **no article text**
- Slower/fragile indexing even for Googlebot (render budget)
- Poor **AEO citability** — answer engines need extractable passages in HTML

### Fix shipped

- **`ServerArticleContent`** — server-rendered hero, MDX body, author aside, share links, related posts
- **`ClientArticleChrome`** — client-only nav + language notice (no duplicate body)
- **`generateStaticParams`** for visible slugs + `revalidate = 600`

---

## On-page SEO

| Element | Blog index | Article | Author |
|---------|------------|---------|--------|
| `<title>` / description | Yes | Yes | Yes |
| Canonical | `/blog` | Absolute URL | **Added** |
| Open Graph | Yes | Yes + article type | Yes |
| Twitter card | Yes | Yes | Yes |
| JSON-LD | **CollectionPage added** | BlogPosting | **Person added** |
| RSS alternate | **Added** | — | — |

### Canonical URL consistency

Article metadata defaulted to `https://digitaltableteur.com` while sitemap/layout used `https://www.digitaltableteur.com`. Consolidated via **`getSiteUrl()`** in `app/lib/siteUrl.ts`.

**Action:** Ensure `NEXT_PUBLIC_SITE_URL=https://www.digitaltableteur.com` in Vercel (production).

---

## AEO / GEO (AI search)

| Signal | Before | After |
|--------|--------|-------|
| Article text in initial HTML | No | **Yes** |
| `llms.txt` blog links | Yes | Yes + RSS URL |
| BlogPosting schema | Yes | Yes |
| CollectionPage on hub | No | **Yes** |
| Person schema on author | No | **Yes** |
| RSS for syndication | No | **Yes** |
| Passage-level headings in HTML | After JS | **H1 + MDX h2/h3 in SSR** |

### Remaining AEO recommendations

1. **Publish the agentic design systems series** — 5 scheduled posts are the strongest topical cluster; until live, blog looks thin for “agentic design systems” queries.
2. **Add FAQ schema** on pillar posts where Q&A sections exist (use `getFaqSchema()` — already in codebase).
3. **Homepage internal link** to `/blog` in visible hero or featured-articles block (nav link alone is weak equity).
4. **Request indexing** in GSC for `/blog` and top 5 posts after deploy.

---

## Internal linking

| Source | Links to blog |
|--------|----------------|
| Header nav | Yes |
| Footer | **Added** |
| Homepage JSON-LD ItemList | Yes |
| Homepage visible UI | No (open) |
| Work / pricing pages | Minimal |
| Article related posts | **SSR list added** |

---

## Discovery feeds

| Feed | URL | Notes |
|------|-----|-------|
| Sitemap | `/sitemap.xml` | Blog + posts + **authors** |
| RSS | `/blog/feed.xml` | **New** — linked from blog metadata |
| llms.txt | `/llms.txt` | Updated with RSS |
| robots.txt | `/robots.txt` | Points to sitemap + llms.txt |

---

## Follow-up backlog (prioritized)

1. **Publish or demote** — Either ship the 5 scheduled posts on their dates (automate `sanity:publish` cron) or temporarily demote Blog in nav until the cluster is live.
2. **Homepage featured articles** — Visible block linking to 2–3 best posts (not Medium).
3. **GSC monitoring** — Track impressions/clicks for `/blog/*` after SSR deploy.
4. **Remove legacy mirror** — `nextjs-app/app/blog/` duplicates to avoid confusion.
5. **Author profile SSR** — Author body still client-heavy; lower priority than articles.

---

## Verification checklist

After deploy:

```bash
# View-source / curl — article body should contain <h1> and paragraph text
curl -s https://www.digitaltableteur.com/blog/figma-mcp-design-systems | rg '<h1|Model Context'

# RSS
curl -sI https://www.digitaltableteur.com/blog/feed.xml

# Sitemap includes authors
curl -s https://www.digitaltableteur.com/sitemap.xml | rg 'blog/authors'

# Canonical consistency
curl -s https://www.digitaltableteur.com/blog/figma-mcp-design-systems | rg 'canonical'
```

---

## Files changed (this pass)

| File | Change |
|------|--------|
| `app/blog/[slug]/ServerArticleContent.tsx` | SSR article body |
| `app/blog/[slug]/ServerRelatedPosts.tsx` | SSR related links |
| `app/blog/[slug]/ClientArticle.tsx` | Chrome only (nav, language notice) |
| `app/blog/[slug]/page.tsx` | Static params, ISR, unified URLs |
| `app/blog/page.tsx` | CollectionPage JSON-LD, RSS alternate |
| `app/blog/authors/[slug]/page.tsx` | Canonical + Person JSON-LD |
| `app/blog/feed.xml/route.ts` | RSS feed |
| `app/lib/siteUrl.ts` | Canonical origin helper |
| `app/lib/blog/rss.ts` | RSS builder |
| `app/sitemap.ts` | Author URLs |
| `app/lib/structuredData.ts` | Uses shared site URL |
| `app/llms.txt/route.ts` | RSS link |
| `nextjs-app/shared/patterns/SiteFooter/SiteFooter.tsx` | Blog link |
| `nextjs-app/shared/components/ArticleContent/articleProseClasses.ts` | Shared prose tokens |
