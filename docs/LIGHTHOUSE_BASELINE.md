# Lighthouse Performance Baseline

> **Created**: 2026-01-14
> **Phase**: 12-1 (Performance Optimization)

## Overview

This document tracks Lighthouse performance baselines and improvements for key pages.

## Known Blockers

- **Production build blocked**: Sanity/React 19 `useEffectEvent` compatibility issue
- **Workaround**: Run Lighthouse against dev server or after Sanity dependency update
- **Issue reference**: `digitaltableteur-blog/node_modules/sanity` requires React upgrade

## Target Metrics

| Category | Target | Minimum |
|----------|--------|---------|
| Performance | >= 80 | >= 70 |
| Accessibility | >= 90 | >= 85 |
| Best Practices | >= 90 | >= 80 |
| SEO | >= 90 | >= 80 |

## Key Pages to Audit

1. **Homepage** (`/`)
   - Hero section with animations
   - Services grid
   - Work preview section
   - CTA section

2. **About** (`/about`)
   - Team section with images
   - Story blocks
   - Timeline content

3. **Work** (`/work`)
   - Project grid with images
   - Filter functionality
   - Dynamic content

4. **Blog** (`/blog`)
   - Article cards with thumbnails
   - Pagination
   - Author avatars

5. **Contact** (`/contact`)
   - Form validation
   - Leaflet map (lazy loaded)
   - CV download section

## Optimizations Implemented (Phase 12-1)

### Bundle Optimizations

- [x] Bundle analyzer installed (`npm run analyze`)
- [x] MapSection dynamically imported with `ssr: false`
- [x] Heavy libraries (Leaflet, Chart.js, Mermaid) in devDependencies

### Image Optimizations

- [x] MdxImage component using Next.js Image
- [x] Remote patterns configured for Sanity CDN
- [x] AVIF/WebP format conversion enabled
- [x] Responsive srcset configured

### Font Optimizations

- [x] next/font for automatic font optimization
- [x] display: swap for FOIT prevention
- [x] Variable fonts for weight flexibility

### Lighthouse CI

- [x] @lhci/cli installed
- [x] lighthouserc.js configured with budgets
- [x] Scripts added: `npm run lighthouse:ci`

## Running Lighthouse Locally

### Option 1: Lighthouse CI (Recommended)

```bash
# After build completes (requires Sanity fix)
npm run build && npm run lighthouse:ci
```

### Option 2: Manual Lighthouse

```bash
# Start dev server
npm run dev

# In another terminal, run Lighthouse
npm run lighthouse:full  # Opens HTML report
npm run lighthouse:a11y  # Accessibility only
```

### Option 3: Chrome DevTools

1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select categories and device
4. Click "Analyze page load"

## Baseline Results (To Be Updated)

Run Lighthouse after Sanity dependency update and record results here:

### Homepage (/)

| Category | Score | Notes |
|----------|-------|-------|
| Performance | - | Pending Sanity fix |
| Accessibility | - | - |
| Best Practices | - | - |
| SEO | - | - |

### About (/about)

| Category | Score | Notes |
|----------|-------|-------|
| Performance | - | Pending Sanity fix |
| Accessibility | - | - |
| Best Practices | - | - |
| SEO | - | - |

### Work (/work)

| Category | Score | Notes |
|----------|-------|-------|
| Performance | - | Pending Sanity fix |
| Accessibility | - | - |
| Best Practices | - | - |
| SEO | - | - |

### Blog (/blog)

| Category | Score | Notes |
|----------|-------|-------|
| Performance | - | Pending Sanity fix |
| Accessibility | - | - |
| Best Practices | - | - |
| SEO | - | - |

### Contact (/contact)

| Category | Score | Notes |
|----------|-------|-------|
| Performance | - | Pending Sanity fix |
| Accessibility | - | - |
| Best Practices | - | - |
| SEO | - | - |

## Common Performance Issues to Watch

Based on typical Next.js applications:

1. **Largest Contentful Paint (LCP)**
   - Hero images should use `priority` prop
   - Critical fonts should load early

2. **Cumulative Layout Shift (CLS)**
   - Images need explicit width/height
   - Fonts use display: swap

3. **First Input Delay (FID) / Total Blocking Time**
   - Heavy JavaScript should be code-split
   - Third-party scripts use `strategy="afterInteractive"`

4. **Unused JavaScript**
   - Dynamic imports for heavy components
   - Tree-shaking for icon libraries

5. **Render-Blocking Resources**
   - CSS extracted and critical-path optimized
   - Fonts preloaded by next/font

## Next Steps

1. Update Sanity to React 19 compatible version
2. Run production build successfully
3. Execute `npm run lighthouse:ci`
4. Record baseline scores in this document
5. Address top 5 issues identified
6. Re-run and record improved scores

---

*Last updated: 2026-01-14*
