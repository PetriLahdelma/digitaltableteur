# Roadmap: SAP Build Apps Portfolio Page

## Overview

Update the SAP Build Apps case study with accurate, fact-checked content and real source images. Six phases take us from processing raw images through content fixes, image integration, new sections, metadata updates, and final verification — resulting in a portfolio piece that accurately represents nearly 4 years of design system leadership.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Image Processing** — Convert source images to web-optimized WebP at correct sizes ✓
- [x] **Phase 2: Content Accuracy** — Fix inaccurate claims (team size, duration, 60% metric) ✓
- [x] **Phase 3: Image Integration** — Replace placeholders, add new images with proper captions ✓
- [x] **Phase 4: Data Components** — Add Tables & Data Visualization section ✓
- [x] **Phase 5: Metadata & SEO** — Update projects.ts, page SEO, OpenGraph ✓
- [x] **Phase 6: Verification & Outcomes** — Verify claims, NDA review, outcomes section ✓

## Phase Details

### Phase 1: Image Processing
**Goal**: Source images converted to web-optimized formats at correct dimensions
**Depends on**: Nothing (first phase)
**Requirements**: IMG-01, IMG-02
**Success Criteria** (what must be TRUE):
  1. All source PNGs converted to WebP format
  2. Grid images sized at 738x506px
  3. Hero/single images sized at 1200x600px
  4. Processed images stored in public/images/portfolio/sap-build-apps/
**Research**: Unlikely (standard image processing with sharp)
**Plans**: TBD

### Phase 2: Content Accuracy
**Goal**: All inaccurate claims corrected in the page content
**Depends on**: Phase 1 (images available for references)
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-06
**Success Criteria** (what must be TRUE):
  1. Team size shows "serving 300+ developers and designers"
  2. 60% development time claim removed entirely
  3. Duration shows "March 2022 – February 2026" (nearly 4 years)
  4. Role attribution clarifies "led small DS team"
  5. Hero description accurately frames the work
**Research**: Unlikely (content defined in PROJECT.md)
**Plans**: TBD

### Phase 3: Image Integration
**Goal**: Processed images integrated into the page with proper metadata
**Depends on**: Phase 1 (processed images), Phase 2 (content context)
**Requirements**: IMG-03, IMG-04, IMG-05, IMG-06, IMG-07, IMG-08
**Success Criteria** (what must be TRUE):
  1. Placeholder images replaced with real source images
  2. Typography image appears in design tokens section
  3. Button construction image appears in components section
  4. Table component image added to page
  5. Data visualization image added to page
  6. All alt text and captions accurate and descriptive
**Research**: Unlikely (React component updates using existing patterns)
**Plans**: TBD

### Phase 4: Data Components
**Goal**: New section for Data Components (Tables & Data Visualization) added
**Depends on**: Phase 3 (images for section available)
**Requirements**: CONT-05, CONT-07
**Success Criteria** (what must be TRUE):
  1. Data Components section exists in page structure
  2. Tables subsection explains the table component work
  3. Data visualization subsection added with content
  4. Story blocks throughout page are factually accurate
**Research**: Unlikely (following existing StoryBlock patterns)
**Plans**: TBD

### Phase 5: Metadata & SEO
**Goal**: All metadata reflects accurate content
**Depends on**: Phase 2 (content finalized), Phase 4 (all sections complete)
**Requirements**: META-01, META-02, META-03
**Success Criteria** (what must be TRUE):
  1. projects.ts entry has accurate description matching page content
  2. Page SEO metadata (title, description) updated
  3. OpenGraph image and description set correctly
  4. Duration consistent across projects.ts, page component, and metadata
**Research**: Unlikely (standard Next.js metadata patterns)
**Plans**: TBD

### Phase 6: Verification & Outcomes
**Goal**: All claims verified, outcomes section accurate
**Depends on**: All previous phases (final verification pass)
**Requirements**: VERF-01, VERF-02, VERF-03, OUTC-01, OUTC-02
**Success Criteria** (what must be TRUE):
  1. IDC MarketScape claim verified with source or removed
  2. Joule AI reference verified with source or removed
  3. All content passes NDA compliance review
  4. Impact metrics show verified data (100+ components, 300+ served, WCAG 2.1)
  5. Outcomes visual uses real source images
**Research**: Unlikely (verification of existing claims)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Image Processing | 1/1 | Complete | 2026-01-16 |
| 2. Content Accuracy | 1/1 | Complete | 2026-01-16 |
| 3. Image Integration | 1/1 | Complete | 2026-01-16 |
| 4. Data Components | 1/1 | Complete | 2026-01-16 |
| 5. Metadata & SEO | 1/1 | Complete | 2026-01-16 |
| 6. Verification & Outcomes | 1/1 | Complete | 2026-01-16 |

---
*Roadmap created: 2026-01-16*
