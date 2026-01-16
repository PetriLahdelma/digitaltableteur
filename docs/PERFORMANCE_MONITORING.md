# Performance Monitoring Guide

> **Created**: 2026-01-14
> **Phase**: 12-1 (Performance Optimization)

This guide documents performance practices, monitoring tools, and optimization patterns for the Digitaltableteur codebase.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Bundle Analysis](#bundle-analysis)
3. [Lighthouse CI](#lighthouse-ci)
4. [Image Optimization](#image-optimization)
5. [Font Loading](#font-loading)
6. [Code Splitting](#code-splitting)
7. [Performance Budgets](#performance-budgets)
8. [Monitoring Checklist](#monitoring-checklist)

---

## Quick Reference

```bash
# Bundle analysis
npm run analyze

# Lighthouse (local)
npm run lighthouse:full    # Full audit with HTML report
npm run lighthouse:a11y    # Accessibility only

# Lighthouse CI (automated)
npm run lighthouse:ci      # Full CI run with assertions
npm run lighthouse:ci:collect  # Collect metrics only
npm run lighthouse:ci:assert   # Check against budgets
```

---

## Bundle Analysis

### Running Analysis

```bash
# Generate bundle analysis reports
npm run analyze

# Reports are saved to:
# - .next/analyze/client.html (client bundles)
# - .next/analyze/nodejs.html (server bundles)
# - .next/analyze/edge.html (edge runtime)
```

### What to Look For

1. **Large dependencies**: Any single package > 100KB gzipped
2. **Duplicate packages**: Same library bundled multiple times
3. **Unused code**: Libraries imported but not tree-shaken
4. **Route-specific bloat**: Code that should be lazy loaded

### Common Offenders

| Package | Typical Size | Solution |
|---------|--------------|----------|
| Leaflet | ~150KB | Dynamic import with `ssr: false` |
| Chart.js | ~100KB | devDependency (Storybook only) |
| Mermaid | ~300KB | devDependency (Storybook only) |
| GSAP | ~60KB | Keep (used for animations) |

### Configuration

Bundle analyzer is configured in `next.config.ts`:

```typescript
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});
```

---

## Lighthouse CI

### Local Testing

```bash
# Start production server
npm run build && npm run start

# Run full Lighthouse audit
npm run lighthouse:full
```

### CI Configuration

Configuration is in `lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/about",
        // ... more pages
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.7 }],
        "categories:accessibility": ["error", { minScore: 0.85 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
      },
    },
  },
};
```

### Target Scores

| Category | Target | Minimum |
|----------|--------|---------|
| Performance | >= 80 | >= 70 |
| Accessibility | >= 90 | >= 85 |
| Best Practices | >= 90 | >= 80 |
| SEO | >= 90 | >= 80 |

---

## Image Optimization

### Using Next.js Image Component

```tsx
import Image from "next/image";

// Local images (automatic width/height)
<Image
  src="/images/hero.jpg"
  alt="Description"
  width={1200}
  height={600}
  priority  // Use for above-fold images
/>

// Remote images (requires configured domain)
<Image
  src="https://cdn.sanity.io/images/..."
  alt="Description"
  width={800}
  height={400}
  loading="lazy"
/>
```

### MDX Images

Use the `MdxImage` component for blog content:

```tsx
// Automatically optimized in MDX
![Alt text](/images/photo.jpg)

// Component handles:
// - Next.js Image optimization
// - Responsive srcset
// - Lazy loading
// - Error fallback
```

### Configuration

Remote patterns are configured in `next.config.ts`:

```typescript
images: {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  remotePatterns: [
    { protocol: "https", hostname: "cdn.sanity.io" },
    { protocol: "https", hostname: "*.sanity.io" },
    { protocol: "https", hostname: "images.unsplash.com" },
  ],
}
```

### Best Practices

1. **Always add width/height** to prevent CLS
2. **Use `priority`** for hero/above-fold images
3. **Use `loading="lazy"`** for below-fold images
4. **Use `sizes` attribute** for responsive behavior
5. **Prefer AVIF/WebP** (automatic with Next.js)

---

## Font Loading

### Configuration

Fonts are configured in `app/fonts.ts`:

```typescript
// Google Font (Syne)
export const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

// Local Font (Satoshi)
export const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-Variable.woff2", style: "normal" },
    { path: "./fonts/Satoshi-VariableItalic.woff2", style: "italic" },
  ],
  variable: "--font-body",
  display: "swap",
});
```

### Best Practices

1. **Use `display: "swap"`** for FOUT prevention
2. **Subset fonts** to only needed characters
3. **Use variable fonts** for multiple weights
4. **Preconnect** to external font domains

### Preconnects

Added in `app/layout.tsx`:

```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

---

## Code Splitting

### Dynamic Imports

Use `next/dynamic` for heavy components:

```tsx
import dynamic from "next/dynamic";

// Lazy load with SSR disabled (for browser-only libraries)
const MapSection = dynamic(
  () => import("../MapSection").then(mod => mod.MapSection),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-muted" />,
  }
);

// Lazy load with SSR enabled
const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <p>Loading chart...</p>,
});
```

### When to Dynamic Import

1. **Heavy libraries** (> 50KB gzipped)
2. **Browser-only code** (uses `window`, `document`)
3. **Below-fold content** (not needed for initial render)
4. **Conditional features** (not used by all users)

### Route Splitting

Next.js automatically code-splits by route. Each `page.tsx` creates its own chunk.

---

## Performance Budgets

### JavaScript Budget

- **Initial bundle**: < 200KB (gzipped)
- **Per-route chunk**: < 100KB (gzipped)
- **Third-party scripts**: < 100KB total

### Image Budget

- **Hero images**: < 200KB (optimized)
- **Thumbnails**: < 50KB
- **Icons/logos**: < 10KB (SVG preferred)

### Core Web Vitals Targets

| Metric | Target | Poor |
|--------|--------|------|
| LCP | < 2.5s | > 4.0s |
| FID | < 100ms | > 300ms |
| CLS | < 0.1 | > 0.25 |
| INP | < 200ms | > 500ms |

---

## Monitoring Checklist

### Before Each Release

- [ ] Run `npm run analyze` and check for new large dependencies
- [ ] Run `npm run lighthouse:full` on key pages
- [ ] Verify Core Web Vitals in Chrome DevTools
- [ ] Check for console warnings about performance
- [ ] Review any new third-party scripts

### Monthly Review

- [ ] Compare bundle size to previous month
- [ ] Review Lighthouse score trends
- [ ] Check for deprecated dependencies
- [ ] Audit third-party script usage
- [ ] Review image optimization opportunities

### Performance Red Flags

1. **Performance score < 70**: Investigate immediately
2. **Bundle > 300KB**: Review code splitting
3. **LCP > 3s**: Check hero images and fonts
4. **CLS > 0.1**: Audit layout shifts
5. **FID > 150ms**: Review JavaScript execution

---

## Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Lighthouse CI Docs](https://github.com/GoogleChrome/lighthouse-ci)
- [Core Web Vitals](https://web.dev/vitals/)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

---

*Last updated: 2026-01-14*
