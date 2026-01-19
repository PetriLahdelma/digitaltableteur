# SAP Build Apps Portfolio Page

## What This Is

A portfolio case study page showcasing nearly 4 years of design system leadership at SAP Build Apps (March 2022 – February 2026). The page accurately represents the work — 100+ components serving 300+ developers and designers — with optimized imagery, verified facts, and NDA-compliant content.

## Core Value

**Tell the true story.** Accurately represent the design system work — what was built, who it served, and the real impact — without overclaiming or violating NDA constraints.

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

(None — v1.0 complete)

### Out of Scope

- Redesigning the page layout/patterns — using existing ProjectDetailLayout
- Adding new component patterns — using existing StoryBlock, GridBlock, ProcessBlock
- Creating new images — only processing/optimizing existing source files
- Other portfolio pages — this is SAP Build Apps only

## Context

**Current codebase state:** Shipped v1.0 with:
- Page route: `app/work/sap-build-apps/page.tsx`
- Page component: `nextjs-app/shared/components/pages/Work/SapBuildApps/SapBuildAppsPage.tsx` (~500 LOC)
- 32 WebP images in `public/images/portfolio/sap-build-apps/`
- Full SEO metadata with OpenGraph and Twitter cards

**Key verified facts:**
- Duration: March 2022 – February 2026 (nearly 4 years)
- Role: Design System Lead
- Served: 300+ developers and designers worldwide
- Components: 100+ production-ready
- Compliance: WCAG 2.1 AA
- Design-to-code: 1:1 Figma-to-ReactTS parity

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

## Constraints

- **Tech stack**: Next.js 15, React, TypeScript, CSS Modules — existing patterns only
- **Images**: Processed source PNGs to WebP format
- **Image dimensions**: 738x506 for grid, 1200x600 for hero/single
- **Accessibility**: Alt text required for all images (9 images with descriptive alt text)

---
*Last updated: 2026-01-19 after v1.0 milestone*
