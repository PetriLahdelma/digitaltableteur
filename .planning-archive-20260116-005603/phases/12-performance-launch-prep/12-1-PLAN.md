# Phase 12-1: Performance Optimization

> **Phase**: 12 (Performance & Launch Prep)
> **Plan**: 1 of 2
> **Tasks**: 10

---

## Objective

Optimize bundle size, image loading, and font performance to achieve Lighthouse Performance score ≥80. Set up performance monitoring and bundle analysis tooling for ongoing maintenance.

---

## Context

### Current State
- **No bundle analyzer** installed - cannot track bundle growth
- **Fonts**: Excellent setup with `next/font` (Syne + Satoshi), `display: "swap"`
- **Images**: NOT using Next.js Image component in production
- **MDX Images**: Raw `<img>` tags without optimization
- **Heavy Dependencies**: Chart.js (~100KB), Leaflet (~150KB), Mermaid (~300KB+), GSAP (~60KB)
- **Lighthouse CI**: Not configured (only manual commands)

### Key Files
- `next.config.ts` — Build configuration
- `app/fonts.ts` — Font loading configuration
- `package.json` — Dependencies
- `nextjs-app/shared/patterns/ArticlePageTemplate/ArticlePageTemplate.tsx` — MDX images

### Target Metrics (Lighthouse)
- Performance: ≥80 (currently unknown baseline)
- Accessibility: ≥90 (Phase 11 work should help)
- Best Practices: ≥90
- SEO: ≥90

### Dependencies
- Phase 11: Accessibility work (completed)

---

## Tasks

### Task 1: Install Bundle Analyzer
**Files**: `package.json`, `next.config.ts`

Set up bundle analysis tooling:
- Install `@next/bundle-analyzer`
- Add configuration to `next.config.ts`
- Create `npm run analyze` script
- Run initial analysis and document baseline

```bash
npm install --save-dev @next/bundle-analyzer
```

```typescript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

**Verification**: Run `npm run analyze` and save baseline report

---

### Task 2: Optimize Heavy Dynamic Imports
**Files**: Various component files

Add dynamic imports for heavy libraries:
- Leaflet map: Already dynamic, verify `ssr: false`
- Mermaid diagrams: Wrap in `dynamic()`
- Chart.js: Lazy load on visibility
- GSAP: Keep (used throughout, acceptable size)

```tsx
// Example: Mermaid
const Mermaid = dynamic(() => import("@/components/Mermaid"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse bg-gray-100" />,
});
```

**Verification**: Run `npm run analyze` and compare to baseline

---

### Task 3: Create Optimized MDX Image Component
**Files**: `nextjs-app/shared/components/MdxImage/MdxImage.tsx`, `nextjs-app/shared/components/MdxImage/index.ts`

Replace raw `<img>` in MDX with optimized component:
- Use Next.js Image component
- Add responsive srcset
- Add blur placeholder support
- Handle external URLs (Sanity, etc.)
- Support lazy loading

```tsx
import Image from "next/image";

interface MdxImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function MdxImage({ src, alt, width = 800, height = 400 }: MdxImageProps) {
  const isExternal = src.startsWith("http");

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      placeholder={isExternal ? "empty" : "blur"}
      className="rounded-lg"
    />
  );
}
```

**Verification**: Blog images load with proper optimization

---

### Task 4: Update MDX Configuration to Use MdxImage
**Files**: `nextjs-app/shared/patterns/ArticlePageTemplate/ArticlePageTemplate.tsx`

Replace raw `img` mapping with MdxImage:
- Update MDX component mappings
- Test with existing blog posts
- Ensure backwards compatibility

```tsx
const mdxComponents = {
  img: (props: any) => <MdxImage {...props} />,
  // ... other mappings
};
```

**Verification**: All blog posts render images correctly

---

### Task 5: Add Font Preload Hints
**Files**: `app/layout.tsx`

Optimize font loading with preload hints:
- Add `<link rel="preload">` for critical fonts
- Move font initialization to layout head
- Document font loading strategy

```tsx
// In layout.tsx head
<link
  rel="preload"
  href="/fonts/Satoshi-Variable.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

**Verification**: Fonts appear in Network tab with "preload" initiator

---

### Task 6: Implement Image Optimization for Static Assets
**Files**: Various page files

Replace `<img>` tags with Next.js Image:
- Audit all static images in pages
- Convert to Image component
- Add width/height for CLS prevention
- Use appropriate `priority` for above-fold images

Priority pages:
- Homepage hero images
- About page team photos
- Work page thumbnails

**Verification**: No raw `<img>` tags in production pages

---

### Task 7: Configure Lighthouse CI
**Files**: `lighthouserc.js` (new), `package.json`

Set up Lighthouse CI with budgets:
- Install `@lhci/cli`
- Create configuration file
- Set performance budgets
- Add CI script

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000/", "http://localhost:3000/about"],
      startServerCommand: "npm run build && npm run start",
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
```

**Verification**: `npm run lighthouse:ci` passes with score ≥80

---

### Task 8: Run Initial Lighthouse Audit
**Files**: `docs/LIGHTHOUSE_BASELINE.md` (new)

Document baseline performance:
- Run Lighthouse on key pages (/, /about, /work, /blog, /contact)
- Record scores for Performance, A11y, Best Practices, SEO
- Identify top 5 performance issues
- Create tracking document

**Verification**: Baseline documented, issues prioritized

---

### Task 9: Fix Top 5 Lighthouse Issues
**Files**: Various (based on audit results)

Address critical performance issues identified in Task 8:
- Typical issues: LCP, CLS, unused JavaScript, render-blocking resources
- Focus on issues with biggest score impact
- Document fixes made

**Verification**: Re-run Lighthouse, score improved

---

### Task 10: Create Performance Monitoring Documentation
**Files**: `docs/PERFORMANCE_MONITORING.md` (new)

Document performance practices:
- How to run bundle analysis
- Lighthouse CI usage
- Performance budget explanation
- Image optimization guidelines
- Font loading best practices
- Code splitting patterns

**Verification**: Documentation is complete and actionable

---

## Success Criteria

- [ ] Bundle analyzer installed and baseline recorded
- [ ] Heavy libraries dynamically imported
- [ ] MdxImage component created and integrated
- [ ] Font preload hints added
- [ ] Static images using Next.js Image
- [ ] Lighthouse CI configured with budgets
- [ ] Lighthouse baseline documented
- [ ] Top 5 performance issues fixed
- [ ] Performance score ≥80 achieved
- [ ] Performance monitoring documented

---

## Output

```
Config:
  next.config.ts (bundle analyzer)
  lighthouserc.js (new)
  package.json (scripts)

Components:
  MdxImage/MdxImage.tsx (new)
  MdxImage/index.ts (new)

Patterns:
  ArticlePageTemplate/ArticlePageTemplate.tsx (updated)

Pages:
  app/layout.tsx (font preload)
  Various pages (Image optimization)

Docs:
  LIGHTHOUSE_BASELINE.md (new)
  PERFORMANCE_MONITORING.md (new)
```

---

## Notes

- **Pre-existing blocker**: Production build blocked by Sanity/React 19 issue
  - May need workaround for Lighthouse testing
  - Dev server should work for optimization testing
- **Bundle size priorities**: Focus on user-facing pages first
- **Image optimization**: Sanity images handled by their CDN, focus on static assets
- **Font subsetting**: Out of scope (Satoshi already ~43KB, acceptable)

---

*Created: 2026-01-14*
