# Portfolio Case Studies

## What This Is

A collection of portfolio case study pages showcasing design and development work across multiple projects. Each page tells an accurate story with optimized imagery, verified facts, and NDA-compliant content. Currently expanding from SAP Build Apps to include VertaaUX, Finnish Transport Agency, Raw View, Tulli, and Intrum.

## Core Value

**Tell true stories with unique compositions.** Each project deserves accurate representation with its own layout personality — not cookie-cutter templates.

## Current Milestone: v1.1 Portfolio Expansion

**Goal:** Build 5 additional portfolio pages with rich content and varied layouts.

**Target features:**
- VertaaUX Portfolio Page
- Finnish Transport Agency Portfolio Page
- Raw View Portfolio Page
- Tulli Portfolio Page
- Intrum Portfolio Page
- Layout system extension (new block types as needed)

## Requirements

### Validated

- ✓ Fix inaccurate claims (team size, remove 60% metric, correct duration) — v1.0
- ✓ Update hero description and metadata with accurate framing — v1.0
- ✓ Add missing Data Components section (Tables & Data Visualization) — v1.0
- ✓ Process and add source images from Portfolio content folder — v1.0
- ✓ Update image captions and alt text for accuracy — v1.0
- ✓ Clarify role attribution (led small DS team, system served 300+ people) — v1.0
- ✓ Remove or verify IDC MarketScape and Joule AI references — v1.0
- ✓ Ensure all content is NDA-compliant — v1.0

### Active

- [ ] VertaaUX case study with copywriting from user facts, verified images, unique layout
- [ ] Finnish Transport Agency case study with copywriting from user facts, verified images, unique layout
- [ ] Raw View case study with copywriting from user facts, verified images, unique layout
- [ ] Tulli case study with copywriting from user facts, verified images, unique layout
- [ ] Intrum case study with copywriting from user facts, verified images, unique layout
- [ ] Layout block extensions as needed (timeline, comparison, before/after, etc.)

### Out of Scope

- Donny Chat Portfolio CTA — deferred to v1.2
- Scroll-triggered animations — deferred to v1.2
- Performance optimization (Core Web Vitals) — deferred to v1.2
- Mobile experience improvements — deferred to v1.2
- Accessibility audit (WCAG compliance) — deferred to v1.2

## Context

**v1.0 established patterns:**
- Page route pattern: `app/work/[project-slug]/page.tsx`
- Page component pattern: `nextjs-app/shared/components/pages/Work/[ProjectName]/[ProjectName]Page.tsx`
- Image optimization: WebP format, 738x506 for grid, 1200x600 for hero
- Full SEO metadata with OpenGraph and Twitter cards
- Layout components: ProjectDetailLayout, StoryBlock, GridBlock, ProcessBlock

**v1.1 workflow:**
- User provides JSON/facts and source images for each project
- AI drafts copywriting based on provided facts (no invented claims)
- On-demand visual verification: view images, write content, propose placement
- Each project gets unique layout composition
- Content must be accurate and NDA-compliant

**Existing partial work visible in git status for:**
- Finnish Transport Agency, Intrum, Knobsmith Audio, Raw View, Tulli, VertaaUX

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use existing layout patterns | No need to create new components, faster execution | ✓ Good |
| Remove 60% claim | Cannot verify, better to understate than overclaim | ✓ Good |
| Reframe team size | Accurate: small DS team serving 300+ | ✓ Good |
| Sharp from Next.js dependency | No new install needed | ✓ Good |
| WebP quality 80 | Good size/quality balance, 88% reduction | ✓ Good |
| Hero image for OpenGraph | Better social preview than generic logo | ✓ Good |
| Removed Gartner 70% statistic | Outdated year prediction | ✓ Good |
| On-demand visual verification | Keep context tight, decisions in the moment | — Pending |
| Unique layouts per project | Avoid cookie-cutter feel | — Pending |

## Constraints

- **Tech stack**: Next.js 16, React, TypeScript, CSS Modules
- **Images**: WebP format, quality 80
- **Image dimensions**: 738x506 for grid, 1200x600 for hero/single
- **Content**: User-provided facts only, no invented claims
- **Layout**: Each project must have unique composition

---
*Last updated: 2026-01-19 after v1.1 milestone start*
