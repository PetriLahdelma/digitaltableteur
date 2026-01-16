# SAP Build Apps Portfolio Page

## What This Is

Update the SAP Build Apps case study page with accurate, fact-checked content and real source images. This is a portfolio piece showcasing nearly 4 years of design system leadership at SAP, properly attributing the work and avoiding unverifiable claims.

## Core Value

**Tell the true story.** Accurately represent the design system work — what was built, who it served, and the real impact — without overclaiming or violating NDA constraints.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Fix inaccurate claims (team size, remove 60% metric, correct duration)
- [ ] Update hero description and metadata with accurate framing
- [ ] Add missing Data Components section (Tables & Data Visualization)
- [ ] Process and add source images from Portfolio content folder
- [ ] Update image captions and alt text for accuracy
- [ ] Clarify role attribution (led small DS team, system served 300+ people)
- [ ] Remove or verify IDC MarketScape and Joule AI references
- [ ] Ensure all content is NDA-compliant

### Out of Scope

- Redesigning the page layout/patterns — using existing ProjectDetailLayout
- Adding new component patterns — using existing StoryBlock, GridBlock, ProcessBlock
- Creating new images — only processing/optimizing existing source files
- Other portfolio pages — this is SAP Build Apps only

## Context

**Existing codebase:** This is a brownfield project. The portfolio site already exists with:
- Page route: `app/work/sap-build-apps/page.tsx`
- Page component: `nextjs-app/shared/components/pages/Work/SapBuildApps/SapBuildAppsPage.tsx`
- Project data: `nextjs-app/shared/data/projects.ts`
- Existing images in `public/images/portfolio/sap-build-apps/`

**Source content:**
- JSON spec: `/Users/petrilahdelma/Documents/_WORK/Portfolio content/website-json/sap-build-apps-design-system.json`
- Source images: `/Users/petrilahdelma/Documents/_WORK/Portfolio content/Projects/SAP-Build-Apps-Design-System/assets/`
- Documentation images: `.../assets/documentation/`

**Key facts (verified by user):**
- Duration: March 2022 – February 2026 (nearly 4 years)
- Role: Design System Lead
- Team: Small team (user + a few people) building the DS
- Served: 300+ developers and designers worldwide
- Components: 100+ (confident)
- User contributed: UI design, user research, team leadership, direct code contributions, all tokens

**Claims to remove/modify:**
- "200+ developers" → "serving 300+ developers and designers"
- "60% reduction in development time" → remove (unverifiable)
- Duration in JSON was wrong (said 2021-2023) → use March 2022 – February 2026

**NDA considerations:**
- Can show design artifacts (tokens, components, workflows)
- Need accurate technical terminology
- Proper attribution (user's role vs team contributions)

## Constraints

- **Tech stack**: Next.js 15, React, TypeScript, CSS Modules — existing patterns only
- **Images**: Must process source PNGs to web-optimized formats (WebP preferred)
- **Image dimensions**: Follow existing pattern (738x506 for grid, 1200x600 for hero/single)
- **Translations**: EN/FI/SV coverage if any translatable strings added
- **Accessibility**: Alt text required for all images

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use existing layout patterns | No need to create new components, faster execution | — Pending |
| Remove 60% claim | Cannot verify, better to understate than overclaim | — Pending |
| Reframe team size | Accurate: small DS team serving 300+ | — Pending |

---
*Last updated: 2026-01-16 after initialization*
