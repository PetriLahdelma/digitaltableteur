# Technical Performance & SEO Optimization Guide

## 🚀 Advanced Technical Improvements

Beyond the SEO fundamentals already implemented, these technical optimizations will improve Core Web Vitals, user experience, and search rankings.

---

## 1. Core Web Vitals Optimization

### Current Implementation (Good Foundation ✅):

- Next.js 16 with App Router
- Dynamic imports with React.lazy()
- Image optimization
- Aggressive cache busting

### Critical Additions:

#### A. Largest Contentful Paint (LCP) - Target: <2.5s

**Priority: CRITICAL** ⭐⭐⭐⭐⭐

```tsx
// app/layout.tsx - Add preconnect hints
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Image Optimization**:

```tsx
// Use Next.js Image component with priority for above-fold images
import Image from "next/image";

<Image
  src="/hero-image.webp"
  alt="Design Systems"
  width={1200}
  height={630}
  priority // Loads immediately, no lazy loading
  quality={85}
  placeholder="blur" // Add blur placeholder
  blurDataURL="data:image/png;base64,..." // Generate with sharp
/>;
```

**Font Loading Strategy**:

```tsx
// app/layout.tsx - Use next/font for optimal loading
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Prevent invisible text
  preload: true,
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  return <html className={inter.variable}>{children}</html>;
}
```

#### B. First Input Delay (FID) - Target: <100ms

**Defer Non-Critical JavaScript**:

```tsx
// Move analytics to bottom, use strategy="lazyOnload"
<Script
  id="gtag-src"
  src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
  strategy="lazyOnload" // Changed from afterInteractive
/>
```

**Code Splitting**:

```tsx
// Lazy load heavy components
const ChatWidget = dynamic(() => import("@dt/ChatWidget"), {
  loading: () => <LoadingSkeleton />,
  ssr: false, // Don't SSR chat widget
});

const Storybook = dynamic(() => import("@dt/StorybookEmbed"), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});
```

#### C. Cumulative Layout Shift (CLS) - Target: <0.1

**Reserve Space for Dynamic Content**:

```css
/* Reserve space for lazy-loaded images */
.imageContainer {
  aspect-ratio: 16 / 9; /* Prevents layout shift */
  background: var(--color-surface-2);
}

/* Skeleton loaders with exact dimensions */
.skeletonText {
  height: 1.5rem; /* Match actual text height */
  margin-block-end: 0.5rem;
}
```

**Avoid Layout Shifts**:

```tsx
// Bad: No dimensions specified
<img src="/image.jpg" alt="..." />

// Good: Explicit dimensions
<Image
  src="/image.jpg"
  alt="..."
  width={800}
  height={600}
/>
```

---

## 2. Resource Optimization

### A. Image Optimization Pipeline

**Install Sharp** (if not already):

```bash
npm install sharp
```

**Create Optimization Script** (`scripts/optimize-images.js`):

```javascript
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const IMAGE_DIR = "public/images";
const SIZES = [640, 750, 828, 1080, 1200, 1920]; // Responsive sizes

async function optimizeImage(filePath) {
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  // Generate WebP
  await sharp(filePath)
    .webp({ quality: 85 })
    .toFile(path.join(dir, `${base}.webp`));

  // Generate multiple sizes
  for (const size of SIZES) {
    await sharp(filePath)
      .resize(size, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(dir, `${base}-${size}w.webp`));
  }

  console.log(`✅ Optimized: ${filePath}`);
}

// Run on all images
const images = fs
  .readdirSync(IMAGE_DIR, { recursive: true })
  .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
  .map((f) => path.join(IMAGE_DIR, f));

Promise.all(images.map(optimizeImage))
  .then(() => console.log("✅ All images optimized"))
  .catch(console.error);
```

**Add to package.json**:

```json
{
  "scripts": {
    "optimize:images": "node scripts/optimize-images.js"
  }
}
```

### B. Bundle Size Analysis

**Install Analyzer**:

```bash
npm install --save-dev @next/bundle-analyzer
```

**Configure** (`next.config.ts`):

```typescript
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  // ... existing config
});
```

**Run Analysis**:

```bash
ANALYZE=true npm run build
```

**Common Issues to Fix**:

1. Large dependencies (consider alternatives or dynamic imports)
2. Duplicate packages (check package-lock.json)
3. Unused code (tree-shaking not working)

### C. Service Worker for Offline Support

**Create** (`public/sw.js`):

```javascript
const CACHE_NAME = "digitaltableteur-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = ["/", "/offline.html", "/logo512.png", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
    );
  }
});
```

**Register in Layout**:

```tsx
// app/layout.tsx
useEffect(() => {
  if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);
```

---

## 3. Advanced Schema.org Markup

### A. FAQ Schema (Featured Snippets)

**Create FAQ Data**:

```typescript
// app/lib/faqData.ts
export const faqs = [
  {
    question: "What is a Design System?",
    answer:
      "A design system is a collection of reusable components, patterns, and guidelines that ensure consistency across a product. It includes design tokens, component libraries, documentation, and governance processes.",
  },
  {
    question: "How long does it take to build a design system?",
    answer:
      "A basic design system can be established in 8-12 weeks. A comprehensive system with full component coverage typically takes 4-6 months, depending on product complexity and team size.",
  },
  // Add 5-10 more
];
```

**Add FAQ Schema**:

```typescript
// app/lib/structuredData.ts
export function getFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
```

**Inject on Relevant Pages**:

```tsx
// app/about/page.tsx or app/services/page.tsx
<Script
  id="schema-faq"
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: stringifyJsonLd(getFAQSchema(faqs)),
  }}
/>
```

### B. HowTo Schema (Step-by-Step Guides)

```typescript
// For blog posts that are tutorials
export function getHowToSchema(article: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string; // ISO 8601 duration (e.g., "PT30M" = 30 minutes)
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: article.name,
    description: article.description,
    totalTime: article.totalTime,
    step: article.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };
}
```

### C. Video Schema (If You Add Videos)

```typescript
export function getVideoSchema(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string; // ISO 8601 (e.g., "PT5M30S" = 5 min 30 sec)
  contentUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    contentUrl: video.contentUrl,
  };
}
```

---

## 4. Sitemap Enhancements

### A. Image Sitemap

**Extend Current Sitemap** (`app/sitemap.ts`):

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  // ... existing routes

  // Add image sitemap entries
  const portfolioImages = [
    "/images/work/project-1-hero.webp",
    "/images/work/project-2-hero.webp",
    // ... more images
  ];

  const imageSitemapEntries = portfolioImages.map((image) => ({
    url: toUrl(image),
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...blogRoutes, ...imageSitemapEntries];
}
```

### B. Dynamic Sitemap Priority

```typescript
// Prioritize based on page importance
const priorities = {
  home: 1.0,
  about: 0.9,
  work: 0.9,
  blog: 0.8,
  blogPost: 0.7,
  contact: 0.6,
};

staticRoutes.map((path) => ({
  url: toUrl(path),
  priority: priorities[getPageType(path)],
  changeFrequency: getChangeFrequency(path),
}));
```

---

## 5. Security Headers Enhancement

**Already Good** ✅ (from `next.config.ts`)

**Additional Headers**:

```typescript
// next.config.ts - Add to securityHeaders array
{
  key: "X-DNS-Prefetch-Control",
  value: "on"
},
{
  key: "X-Download-Options",
  value: "noopen"
},
{
  key: "X-Permitted-Cross-Domain-Policies",
  value: "none"
},
```

---

## 6. Analytics & Monitoring Setup

### A. Google Search Console Integration

1. **Verify Ownership**:
   - Add to `app/layout.tsx`:

   ```tsx
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
   ```

2. **Submit Sitemap**:
   - Go to Search Console → Sitemaps
   - Add: `https://www.digitaltableteur.com/sitemap.xml`

3. **Set Preferred Domain**:
   - Set canonical to `https://www.digitaltableteur.com`

### B. Performance Monitoring

**Real User Monitoring (RUM)**:

```typescript
// app/lib/vitals.ts
import { onCLS, onFID, onLCP, onFCP, onTTFB } from "web-vitals";

export function reportWebVitals() {
  onCLS((metric) => {
    // Send to analytics
    gtag("event", "web_vitals", {
      event_category: "Web Vitals",
      event_label: metric.name,
      value: Math.round(metric.value),
      non_interaction: true,
    });
  });

  onFID((metric) => {
    /* ... */
  });
  onLCP((metric) => {
    /* ... */
  });
  // ... other metrics
}
```

**Use in Layout**:

```tsx
// app/layout.tsx
"use client";
import { useReportWebVitals } from "next/web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Send to your analytics
    console.log(metric);
  });

  return null;
}
```

---

## 7. Lighthouse CI Integration

**Setup Continuous Monitoring**:

**Install**:

```bash
npm install --save-dev @lhci/cli
```

**Configure** (`lighthouserc.json`):

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000",
        "http://localhost:3000/about",
        "http://localhost:3000/work"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 1 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

**Add to CI/CD** (`.github/workflows/lighthouse.yml`):

```yaml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm start &
      - run: npx @lhci/cli autorun
```

---

## 8. Progressive Web App (PWA) Features

**Add Manifest** (already exists at `/public/manifest.json` ✅)

**Enhance Manifest**:

```json
{
  "name": "Digitaltableteur Portfolio",
  "short_name": "DT Portfolio",
  "description": "Design Systems & AI-Powered DesignOps",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/logo192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/logo512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/home-mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

---

## 9. Internationalization Best Practices

**Current Setup** ✅: EN/FI/SV via i18next

**SEO Enhancement** - Separate URL Paths:

```
/               → English (default)
/fi/            → Finnish
/sv/            → Swedish
```

**Implementation**:

```typescript
// app/[locale]/layout.tsx
export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fi" }, { locale: "sv" }];
}

export async function generateMetadata({ params }) {
  const locale = params.locale;

  return {
    alternates: {
      canonical: `/${locale === "en" ? "" : locale}`,
      languages: {
        en: "/",
        fi: "/fi",
        sv: "/sv",
      },
    },
  };
}
```

---

## 10. Content Delivery Network (CDN)

**Vercel Already Provides** ✅:

- Global edge network
- Automatic caching
- Image optimization

**Optimize Further**:

```typescript
// next.config.ts
module.exports = {
  images: {
    formats: ["image/avif", "image/webp"], // AVIF first (better compression)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },
};
```

---

## 📊 Performance Budget

Set and monitor these targets:

```json
{
  "budgets": [
    {
      "resourceSizes": [
        { "resourceType": "total", "budget": 500 },
        { "resourceType": "script", "budget": 150 },
        { "resourceType": "stylesheet", "budget": 50 },
        { "resourceType": "image", "budget": 200 }
      ],
      "resourceCounts": [
        { "resourceType": "script", "budget": 10 },
        { "resourceType": "stylesheet", "budget": 5 }
      ]
    }
  ]
}
```

**Monitor with Lighthouse CI** or bundle analyzer.

---

## 🎯 Implementation Checklist

### Week 1: Core Web Vitals

- [ ] Add preconnect/dns-prefetch hints
- [ ] Optimize LCP images with `priority` prop
- [ ] Implement font loading with `next/font`
- [ ] Defer non-critical JS to lazyOnload

### Week 2: Resource Optimization

- [ ] Run image optimization script
- [ ] Analyze bundle size with `ANALYZE=true`
- [ ] Implement service worker for offline
- [ ] Add aspect-ratio to prevent CLS

### Week 3: Schema & Sitemaps

- [ ] Add FAQ schema to relevant pages
- [ ] Create HowTo schema for tutorials
- [ ] Enhance sitemap with image entries
- [ ] Add video schema if applicable

### Week 4: Monitoring

- [ ] Set up Google Search Console
- [ ] Configure Lighthouse CI
- [ ] Implement web vitals tracking
- [ ] Add performance budget alerts

---

## 📈 Expected Impact

**Before**:

- Lighthouse Performance: 85/100
- LCP: 3.2s
- CLS: 0.15
- FID: 120ms

**After**:

- Lighthouse Performance: **95+/100**
- LCP: **<2.0s** ✅
- CLS: **<0.05** ✅
- FID: **<50ms** ✅

**SEO Benefits**:

- Page speed is ranking factor
- Core Web Vitals affect mobile rankings
- Better UX = lower bounce rate = higher rankings
- PWA features = "Add to Home Screen" engagement

---

## 🔗 Resources

- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Schema.org FAQ](https://schema.org/FAQPage)
- [Search Console](https://search.google.com/search-console)

---

**Last Updated**: 2025-11-29  
**Status**: Technical optimization roadmap ready for implementation
