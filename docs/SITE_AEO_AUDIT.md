# Site-wide AEO & GEO Audit — Digitaltableteur

**Date:** 2026-05-28  
**Scope:** Full site answer-engine optimization (AEO) and generative-engine optimization (GEO)  
**Related:** [BLOG_SEO_AEO_AUDIT.md](./BLOG_SEO_AEO_AUDIT.md) (blog-specific crawlability fixes)

---

## Executive summary

Answer Engine Optimization (AEO) is the practice of making content **extractable, trustworthy, and machine-readable** so AI systems (ChatGPT, Perplexity, Google AI Overviews, Claude) can cite your site accurately. GEO extends this to brand visibility in generative search.

Digitaltableteur already had **strong agent infrastructure** (llms.txt, MCP, `.well-known/*`, SSR blog bodies). This pass closes **site-wide gaps** in structured data, E-E-A-T signals, AI crawler policy, and llms.txt curation.

| Area | Before | After this pass |
|------|--------|-----------------|
| FAQ schema | Homepage only | + Pricing, About, Contact |
| WebPage schema | Homepage, blog hub | + About, Pricing, Sitemap |
| BreadcrumbList | Pricing, Contact | + About, Sitemap, blog articles |
| Organization `sameAs` | GitHub only | Full social graph (6 profiles) |
| Person `sameAs` | GitHub only | LinkedIn, X, Medium, Instagram |
| robots.txt AI crawlers | Implicit allow | Explicit GPTBot, PerplexityBot, etc. |
| llms.txt | Missing pricing/sitemap | + Pricing, Sitemap, Colophon, RSS |
| Article freshness | JSON-LD only | Visible `<time>` + OG `modifiedTime` |

---

## 2026 AEO research — what matters

Sources synthesized: Google Search Central, Perplexity publisher docs, Ahrefs/SE Ranking AEO guides, llms.txt spec discussions, and practitioner GEO checklists (2025–2026).

### High impact (implemented or already strong)

1. **Server-rendered, answer-first HTML** — Question-shaped headings + concise lead paragraphs. Blog bodies now SSR ([BLOG_SEO_AEO_AUDIT.md](./BLOG_SEO_AEO_AUDIT.md)).
2. **Structured data** — `Organization`, `WebSite`, `BlogPosting`, `FAQPage`, `BreadcrumbList`, `ContactPage`, `Person`. Rich types help both Google and third-party extractors map entities.
3. **E-E-A-T** — Named author, author pages, `Person` schema, visible publish/update dates, portfolio proof.
4. **Canonical URLs** — Single host via `app/lib/siteUrl.ts`.
5. **RSS + sitemap** — `/blog/feed.xml`, `/sitemap.xml`, human `/sitemap`.
6. **llms.txt** — Curated ~40 links (not a dump); points agents to services, proof, and policies.
7. **AI crawler access** — Explicit `Allow` for major bots; `Content-Signal: ai-train=no, search=yes, ai-input=yes`.

### Medium impact (partial / follow-up)

1. **Visible FAQ blocks on pages** — JSON-LD added; matching visible Q&A sections on Pricing/About would strengthen human + bot alignment (content design task).
2. **Homepage visible `/blog` link** — Still nav/footer only; Wave 1 IA item.
3. **Author page SSR** — Author bios still client-heavy; lower priority than article bodies.
4. **Speakable schema** — Optional for voice/AI snippets; not yet adopted.
5. **Citation-friendly passages** — Blog editorial guideline: 40–60 word definitional leads under H2/H3.

### Lower impact / contested

1. **FAQ rich results** — Google has tightened FAQ rich-result eligibility; JSON-LD still helps LLM entity mapping even when rich results don't show.
2. **llms.txt as ranking factor** — Not a Google ranking signal; valuable for agent discovery and developer-brand sites like ours.
3. **Keyword stuffing for AI** — Harmful; factual density and clear structure win.

---

## Current AEO asset inventory

| Asset | URL | Purpose |
|-------|-----|---------|
| llms.txt | `/llms.txt` | Curated agent orientation |
| llms-full.txt | `/llms-full.txt` | Deep context (services, OSS, PSEO) |
| Agent card | `/.well-known/agent-card.json` | A2A discovery |
| MCP card | `/.well-known/mcp/server-card.json` | Tooling discovery |
| API catalog | `/.well-known/api-catalog` | HTTP surface map |
| auth.md | `/auth.md` | Agent auth policy |
| RSS | `/blog/feed.xml` | Syndication + freshness |
| XML sitemap | `/sitemap.xml` | Crawl discovery |
| Human sitemap | `/sitemap` | Users + secondary crawl paths |
| Colophon | `/colophon` | Site scale / stack transparency |

---

## JSON-LD coverage by route

| Route | Schemas |
|-------|---------|
| `/` (layout) | Organization, WebSite |
| `/` (page) | WebPage, ItemList, FAQPage |
| `/about` | WebPage, Person, FAQPage, BreadcrumbList |
| `/pricing` | WebPage, FAQPage, BreadcrumbList |
| `/contact` | ContactPage, FAQPage, BreadcrumbList |
| `/blog` | CollectionPage, BreadcrumbList |
| `/blog/[slug]` | BlogPosting, BreadcrumbList |
| `/blog/authors/[slug]` | Person, BreadcrumbList |
| `/sitemap` | WebPage, BreadcrumbList |
| `/work/[slug]` | CreativeWork (where configured) |

FAQ content lives in `app/lib/aeoContent.ts` for reuse and consistency.

---

## robots.txt & AI crawlers

`app/lib/agent-discovery.ts` now documents explicit rules for:

- GPTBot, OAI-SearchBot, ChatGPT-User  
- ClaudeBot, anthropic-ai  
- PerplexityBot  
- Google-Extended, Applebot-Extended  
- Bytespider, CCBot, cohere-ai  
- FacebookBot, meta-externalagent  

Global policy: `Allow: /` with `Disallow` only for `/api` and `/studio`.  
`Content-Signal` declares training opt-out while allowing search and AI input.

---

## Remaining gaps (prioritized backlog)

| Priority | Item | Owner |
|----------|------|-------|
| P1 | Visible FAQ sections on Pricing/About matching JSON-LD | Content/UX |
| P1 | Publish 5 scheduled agentic-design-systems posts | Content ops |
| P2 | Homepage hero or services block linking to `/blog` | IA |
| P2 | Author page SSR for bio + article list | Engineering |
| P2 | Add `modifiedAt` to blog frontmatter when posts are updated | Editorial |
| P3 | `SpeakableSpecification` on key landing pages | Engineering |
| P3 | Monitor AI citation share (Perplexity/GSC AI reports) | Marketing |
| P3 | Legacy `nextjs-app/app/blog/` mirror cleanup | Engineering |

---

## Verification checklist

After deploy:

```bash
# Structured data sanity
curl -s https://www.digitaltableteur.com/pricing | rg 'FAQPage|WebPage'
curl -s https://www.digitaltableteur.com/robots.txt | rg 'GPTBot|PerplexityBot'
curl -s https://www.digitaltableteur.com/llms.txt | rg 'pricing|sitemap'

# Rich Results (manual)
# https://search.google.com/test/rich-results — test /, /pricing, /blog/[slug]
```

---

## Files changed in this pass

- `app/lib/aeoContent.ts` — shared FAQ entries  
- `app/lib/structuredData.ts` — Organization + Person `sameAs`  
- `app/lib/agent-discovery.ts` — AI crawler user-agents  
- `app/llms.txt/route.ts` — pricing, sitemap, colophon  
- `app/pricing/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx` — FAQ + WebPage schema  
- `app/sitemap/page.tsx` — WebPage + BreadcrumbList  
- `app/blog/[slug]/page.tsx` — BreadcrumbList, OG modifiedTime  
- `app/blog/[slug]/ServerArticleContent.tsx` — visible update date  

---

**End of site-wide AEO audit**
