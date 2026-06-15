# Next.js Migration Plan: Parallel Hybrid Approach

> **Current truth (2026):** Production runs **Next.js 16.2.x** at the **repo root** (`app/`, `next.config.ts`). Vite remains in `vite-app/` for legacy/Storybook-adjacent workflows. This document describes the **historical** Vite → Next migration; for the 15 → 16 bump see [`NEXTJS_16_UPGRADE_PLAN.md`](NEXTJS_16_UPGRADE_PLAN.md).

**Status:** Largely complete (production on root App Router)  
**Start Date:** November 2025  
**Strategy:** Zero-downtime incremental migration  
**Risk Level:** Minimal (instant rollback capability)

---

## Executive Summary

This document outlines a **parallel migration strategy** from Vite SPA to Next.js 16 App Router. The core principle: **keep the existing Vite app running in production while gradually introducing Next.js routes alongside it**. This approach eliminates migration risk and enables instant rollback.

### Why Parallel Migration?

1. ✅ **Zero Downtime** - Vite app remains production-ready throughout
2. ✅ **Instant Rollback** - Remove Next.js folder to revert (< 5 minutes)
3. ✅ **Incremental Validation** - Test each route in isolation before switching traffic
4. ✅ **Proof of Value** - Demonstrate SEO improvements before full commitment
5. ✅ **Team Velocity** - No deadline pressure, learn gradually

---

## Architecture Overview

### Final Structure

```
digitaltableteur/
├── src/                    # Existing Vite app (untouched during migration)
├── nextjs-app/            # New Next.js 16 app
│   ├── app/               # App router
│   ├── providers/         # Next.js-specific providers
│   ├── components/        # Next.js-specific wrappers
│   └── package.json
├── shared/                # Shared logic (symlinked)
│   ├── components/        → ../src/components
│   ├── hooks/             → ../src/hooks
│   ├── styles/            → ../src/styles
│   └── locales/           → ../src/locales
├── package.json           # Root workspace
├── vercel.json            # Routing configuration
└── vite.config.ts         # Unchanged
```

### Routing Strategy

**Phase 1-7:** Use Vercel rewrites to route specific paths to Next.js

```json
{
  "rewrites": [
    { "source": "/about", "destination": "https://nextjs-app.vercel.app/about" }
  ]
}
```

**Phase 8 (Final Cutover):** Default to Next.js, fallback to Vite

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "https://nextjs-app.vercel.app/$1" }
  ],
  "fallback": {
    "destination": "https://digitaltableteur.github.io/$1"
  }
}
```

---

## Phase 1: Foundation Setup (Week 1-2)

### Step 1.1: Create Next.js App

```bash
# In project root
npx create-next-app@latest nextjs-app --typescript --tailwind=no --app --no-src-dir
cd nextjs-app && rm -rf .git
```

### Step 1.2: Setup Workspace

**Root `package.json`:**

```json
{
  "name": "digitaltableteur-monorepo",
  "private": true,
  "workspaces": [".", "nextjs-app"],
  "scripts": {
    "dev:vite": "vite",
    "dev:next": "cd nextjs-app && npm run dev",
    "build:vite": "vite build",
    "build:next": "cd nextjs-app && npm run build",
    "deploy:vite": "npm run build:vite && gh-pages -d dist",
    "deploy:hybrid": "./scripts/deploy-hybrid.sh"
  }
}
```

### Step 1.3: Create Shared Logic via Symlinks

```bash
mkdir -p shared
cd shared
ln -s ../src/components components
ln -s ../src/hooks hooks
ln -s ../src/styles styles
ln -s ../src/locales locales
ln -s ../src/data data
```

**Why symlinks?** Changes to shared code immediately reflect in both apps without manual synchronization.

### Step 1.4: Install Dependencies

**`nextjs-app/package.json` additions:**

```json
{
  "dependencies": {
    "i18next": "^25.6.1",
    "react-i18next": "^15.7.4",
    "i18next-browser-languagedetector": "^7.2.0",
    "@phosphor-icons/react": "^2.1.10",
    "@sentry/nextjs": "^10.23.0"
  }
}
```

---

## Phase 2: Theme System Migration (Week 2)

### Step 2.1: Port ThemeProvider to Next.js

**`nextjs-app/providers/ThemeProvider.tsx`:**

```tsx
"use client";

import { useEffect } from "react";
import { ThemeProvider as SharedThemeProvider } from "../../shared/components/ThemeProvider";

export function NextThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Prevent flash of unstyled content
    document.documentElement.classList.add("theme-hydrated");
  }, []);

  return <SharedThemeProvider>{children}</SharedThemeProvider>;
}
```

### Step 2.2: Root Layout Configuration

**`nextjs-app/app/layout.tsx`:**

```tsx
import { NextThemeProvider } from "../providers/ThemeProvider";
import "../../shared/styles/variables.css";
import "../../shared/styles/index.css";

export const metadata = {
  title: "Digitaltableteur",
  description: "Design Systems & AI-Powered DesignOps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextThemeProvider>{children}</NextThemeProvider>
      </body>
    </html>
  );
}
```

### Step 2.3: Theme Cookie Persistence

**Critical:** Theme state must persist across Vite ↔ Next.js navigation.

**Validation:**

1. Set theme in Vite app → Cookie written
2. Navigate to Next.js route → Cookie read, theme applied
3. Change theme in Next.js → Cookie updated
4. Navigate back to Vite → Theme persists

**Implementation:** Reuse existing `setThemeCookie()` and `getThemeFromCookie()` from `ThemeProvider.tsx`.

---

## Phase 3: Internationalization Migration (Week 2-3)

### Step 3.1: i18next Configuration

**`nextjs-app/i18n/config.ts`:**

```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import shared translations
import enTranslation from "../../nextjs-app/shared/locales/en/translation.json";
import fiTranslation from "../../nextjs-app/shared/locales/fi/translation.json";
import svTranslation from "../../nextjs-app/shared/locales/sv/translation.json";

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: enTranslation },
        fi: { translation: fiTranslation },
        sv: { translation: svTranslation },
      },
      fallbackLng: "en",
      supportedLngs: ["en", "fi", "sv"],
      detection: {
        order: ["cookie", "localStorage", "navigator"],
        caches: ["cookie", "localStorage"],
      },
      react: {
        useSuspense: false, // Critical for Next.js App Router
      },
    });
}

export default i18n;
```

### Step 3.2: I18n Provider

**`nextjs-app/providers/I18nProvider.tsx`:**

```tsx
"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "../i18n/config";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
```

Update `layout.tsx` to wrap children:

```tsx
<NextThemeProvider>
  <I18nProvider>{children}</I18nProvider>
</NextThemeProvider>
```

### Step 3.3: Language Cookie Persistence

**Validation:**

1. Change language in Vite app → Cookie written (`i18next=fi`)
2. Navigate to Next.js route → Cookie read, language applied
3. Change language in Next.js → Cookie updated
4. Navigate back to Vite → Language persists

---

## Phase 4: First Route Migration (Week 3-4)

### Target: `/about` (Simplest, Low-Traffic)

### Step 4.1: Extract Shared Component

**Before:** `src/pages/About.tsx` contains JSX + Helmet metadata

**After - Create Pure Component:**

**`shared/components/pages/AboutPage/AboutPage.tsx`:**

```tsx
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./AboutPage.module.css";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className={styles.about}>
      <h1>{t("aboutTitle")}</h1>
      {/* All existing JSX logic */}
    </div>
  );
}
```

**`shared/components/pages/AboutPage/AboutPage.module.css`:**

```css
/* Move styles from src/pages/About.module.css */
```

**`shared/components/pages/AboutPage/index.ts`:**

```tsx
export { AboutPage } from "./AboutPage";
```

### Step 4.2: Update Vite Wrapper

**`src/pages/About.tsx` (now a wrapper):**

```tsx
import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { AboutPage } from "../../../shared/components/pages/AboutPage";

export default function About() {
  const { t } = useTranslation();

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t("aboutMetaTitle")}</title>
          <meta name="description" content={t("aboutMetaDescription")} />
          <meta property="og:title" content={t("aboutMetaTitle")} />
          <meta property="og:image" content="/logo512.png" />
        </Helmet>
      </HelmetProvider>
      <AboutPage />
    </>
  );
}
```

### Step 4.3: Create Next.js Route

**`nextjs-app/app/about/page.tsx`:**

```tsx
import { Metadata } from "next";
import { AboutPage } from "../../../shared/components/pages/AboutPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About | Digitaltableteur",
    description:
      "Learn about Digitaltableteur design studio specializing in Design Systems and AI-powered DesignOps",
    openGraph: {
      title: "About | Digitaltableteur",
      description: "Learn about Digitaltableteur design studio",
      images: ["/logo512.png"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "About | Digitaltableteur",
      description: "Learn about Digitaltableteur design studio",
      images: ["/logo512.png"],
    },
  };
}

export default function About() {
  return <AboutPage />;
}
```

### Step 4.4: Test Locally

```bash
# Terminal 1: Run Vite
npm run dev:vite

# Terminal 2: Run Next.js
npm run dev:next

# Test both:
# http://localhost:5173/about (Vite)
# http://localhost:3000/about (Next.js)
```

**Validation Checklist:**

- [ ] Visual appearance identical
- [ ] Theme switcher works
- [ ] Language switcher works
- [ ] CSS Modules load correctly
- [ ] All images display
- [ ] Links navigate correctly
- [ ] No console errors

---

## Phase 5: Routing Configuration (Week 4)

### Step 5.1: Vercel Deployment Setup

**Deploy Next.js app to Vercel:**

```bash
cd nextjs-app
vercel --prod
# Note the deployment URL: https://digitaltableteur-next.vercel.app
```

### Step 5.2: Configure Rewrites

**`vercel.json` (root):**

```json
{
  "rewrites": [
    {
      "source": "/about",
      "destination": "https://digitaltableteur-next.vercel.app/about"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Step 5.3: Deploy Configuration

```bash
# Deploy Vite app with new routing
npm run deploy:vite
```

**Test:**

- Visit `https://digitaltableteur.com/about`
- Should serve Next.js version
- Check network tab for proxy headers
- Validate theme/language persistence

---

## Phase 6: Testing & Validation Protocol

### Pre-Migration Checklist (Per Route)

**1. Visual Regression Testing**

```bash
npx playwright test --project=chromium --grep="about page"
```

**2. Accessibility Testing**

```bash
npm run test:a11y -- --grep="About"
```

**3. SEO Metadata Validation**

```bash
# Check server-rendered metadata
curl -s https://digitaltableteur.com/about | grep -A 5 '<head>'

# Validate Open Graph tags
curl -s https://digitaltableteur.com/about | grep 'og:'
```

**4. Lighthouse Audit**

```bash
npx lighthouse https://digitaltableteur.com/about \
  --only-categories=seo,performance,accessibility \
  --output=json \
  --output-path=./lighthouse-about.json
```

**5. Theme Persistence**

- Set theme to "dark" in header
- Navigate to Next.js route
- Verify theme is "dark"
- Change to "hcb"
- Navigate back to Vite route
- Verify theme is "hcb"

**6. i18n Persistence**

- Set language to "fi"
- Navigate to Next.js route
- Verify UI displays Finnish
- Navigate back to Vite route
- Verify UI still Finnish

**7. CSS Modules**

- Inspect element styles
- Verify scoped class names (e.g., `AboutPage_about_xyz123`)
- Check for style conflicts/missing styles

**8. Component Props**

- If route uses shared components with props
- Verify all props work identically in Next.js
- Test edge cases (empty states, loading states)

---

## Phase 7: Incremental Route Migration Schedule

### Migration Priority Order

| Week   | Routes                                                                       | Complexity       | Dependencies   | Risk   |
| ------ | ---------------------------------------------------------------------------- | ---------------- | -------------- | ------ |
| **5**  | `/about`, `/ai-use`                                                          | Low (static)     | None           | Low    |
| **6**  | `/cookie-policy-full-en`, `/cookie-policy-full-fi`, `/cookie-policy-full-sv` | Low (static)     | None           | Low    |
| **7**  | `/contact`                                                                   | Medium (form)    | EmailJS API    | Medium |
| **8**  | `/work/new-things-co`, `/work/illustrations`, `/work/garage-junction`        | Medium (static)  | None           | Low    |
| **9**  | `/blog`, `/blog/[slug]`                                                      | High (dynamic)   | Sanity CMS     | High   |
| **10** | `/blog/authors/[slug]`                                                       | High (dynamic)   | Sanity CMS     | Medium |
| **11** | `/work`                                                                      | High (portfolio) | Work data      | Medium |
| **12** | `/` (Homepage)                                                               | Critical         | All components | High   |

### Per-Route Migration Steps

**For each route:**

1. **Extract to Shared Component**

   ```bash
   # Create shared/components/pages/[RouteName]/
   mkdir -p shared/components/pages/[RouteName]
   # Move logic from src/pages/[RouteName].tsx
   # Create index.ts, .module.css
   ```

2. **Create Vite Wrapper**

   ```tsx
   // Keep Helmet metadata
   // Import and render shared component
   ```

3. **Create Next.js Route**

   ```tsx
   // app/[route]/page.tsx
   // Add generateMetadata()
   // Import and render shared component
   ```

4. **Test Locally**

   ```bash
   npm run dev:vite  # Terminal 1
   npm run dev:next  # Terminal 2
   # Compare side-by-side
   ```

5. **Run Validation Protocol**
   - Execute all checks from Phase 6
   - Document any regressions
   - Fix before proceeding

6. **Deploy Next.js Route**

   ```bash
   cd nextjs-app && vercel --prod
   ```

7. **Update Routing Configuration**

   ```json
   // Add to vercel.json rewrites
   { "source": "/[route]", "destination": "https://..../[route]" }
   ```

8. **Monitor Production**
   - Check Sentry for errors
   - Monitor analytics for drop-offs
   - Validate SEO metadata rendering
   - Check social media preview cards

---

## Phase 8: Final Cutover (Week 13+)

### Prerequisites

- [ ] 80%+ routes migrated and validated
- [ ] SEO improvements measurable and documented
- [ ] No critical regressions detected
- [ ] Team confident in Next.js stability
- [ ] Rollback procedure tested in staging

### Step 8.1: Switch Default Routing

**`vercel.json` (final configuration):**

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "https://digitaltableteur-next.vercel.app/$1"
    }
  ],
  "fallback": {
    "destination": "https://digitaltableteur.github.io/$1"
  }
}
```

**Effect:** All traffic routes to Next.js by default. If Next.js fails, automatic fallback to Vite (GitHub Pages).

### Step 8.2: Monitor Cutover

**First 24 hours:**

- [ ] Monitor Sentry error rates
- [ ] Check Vercel logs for 5xx errors
- [ ] Validate analytics tracking
- [ ] Test theme/language persistence
- [ ] Verify all critical user flows
- [ ] Check social media preview cards

**First week:**

- [ ] Compare SEO metrics (Search Console)
- [ ] Monitor organic traffic trends
- [ ] Check Core Web Vitals (CrUX)
- [ ] Validate Lighthouse scores
- [ ] Collect user feedback

### Step 8.3: Decommission Vite (Optional)

**Only after 2+ weeks of stable Next.js operation:**

```bash
# Archive Vite app
git checkout -b archive/vite-app
git add src/ vite.config.ts
git commit -m "Archive: Vite SPA (pre-Next.js migration)"
git push origin archive/vite-app

# Clean up main branch
git checkout main
rm -rf src/pages  # Keep src/components (now symlinked)
# Remove Vite-specific configs
```

**Keep Vite infrastructure until:**

- Next.js proven stable for 1+ month
- All critical business metrics stable/improved
- Team comfortable with Next.js DX

---

## Emergency Rollback Procedure

### Scenario: Critical Issue in Next.js

**Rollback Time: < 5 minutes**

### Step 1: Revert Routing Configuration

```bash
# Restore previous vercel.json
git revert <commit-hash-of-vercel-json-change>
git push origin main

# Immediate effect: Traffic routes back to Vite
```

### Step 2: Redeploy Vite Configuration

```bash
npm run deploy:vite
# Or via Vercel CLI:
vercel --prod
```

### Step 3: Verify Rollback

```bash
# Check production
curl -I https://digitaltableteur.com
# Should return Vite app headers

# Test critical paths
curl https://digitaltableteur.com/about
curl https://digitaltableteur.com/contact
```

### Step 4: Investigate Next.js Issue

```bash
# Check Next.js logs
cd nextjs-app
vercel logs --prod

# Check Sentry
# Visit Sentry dashboard for error details
```

### Step 5 (Optional): Remove Next.js Temporarily

```bash
# If issue requires extensive debugging
git checkout -b fix/nextjs-critical-issue
rm -rf nextjs-app/
git add .
git commit -m "Temporary: Remove Next.js for investigation"
git push
```

**Re-introduce Next.js when issue resolved.**

---

## Critical Gotchas & Solutions

### 1. CSS Modules Import Paths

**Issue:** Webpack (Next.js) vs Vite resolve CSS differently

**Solution:**

```tsx
// ✅ Works in both
import styles from "./Component.module.css";

// ❌ Avoid absolute paths
import styles from "@/styles/Component.module.css";
```

### 2. Environment Variables

**Issue:** `import.meta.env.VITE_*` not available in Next.js

**Solution:** Create adapter layer

**`shared/config/env.ts`:**

```typescript
const isVite =
  typeof import.meta !== "undefined" && typeof import.meta.env !== "undefined";

const env = isVite ? import.meta.env : process.env;

export const ENV = {
  SENTRY_DSN: env?.VITE_SENTRY_DSN ?? env?.NEXT_PUBLIC_SENTRY_DSN,
  EMAILJS_SERVICE_ID:
    env?.VITE_EMAILJS_SERVICE_ID ?? env?.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
};
```

**Update `.env.local` for Next.js:**

```bash
# Duplicate all VITE_* vars with NEXT_PUBLIC_* prefix
NEXT_PUBLIC_SENTRY_DSN=...
NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
```

### 3. Dynamic Imports

**Issue:** `React.lazy()` syntax differs

**Vite:**

```tsx
const Component = React.lazy(() => import("./Component"));
```

**Next.js:**

```tsx
import dynamic from "next/dynamic";
const Component = dynamic(() => import("./Component"), { ssr: false });
```

**Solution:** Use Next.js syntax in Next.js routes, keep React.lazy in Vite.

### 4. Asset Paths

**Issue:** Public folder resolution

**Solution:** Both frameworks serve from `/public`, so paths like `/images/logo.png` work identically. **Test all image loads after migration.**

### 5. Router Navigation

**Issue:** Different router APIs

**Vite (React Router):**

```tsx
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();
navigate("/about");
```

**Next.js:**

```tsx
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/about");
```

**Solution:** Keep navigation in route-specific code, not shared components. Use `<Link>` from respective frameworks.

### 6. Hydration Mismatches

**Issue:** Theme/language applied client-side causes mismatch

**Solution:** Use `suppressHydrationWarning` on `<html>` tag

```tsx
<html lang="en" suppressHydrationWarning>
```

### 7. Middleware Conflicts

**Issue:** Vercel Edge middleware for i18n conflicts with rewrites

**Solution:** Avoid Next.js middleware for i18n. Use client-side detection (existing pattern).

### 8. MDX / Sanity-to-MDX Workflow (Blog)

- Next is configured with `@next/mdx` + `@mdx-js/loader`, `remark-frontmatter`, `remark-mdx-frontmatter`, and `remark-gfm` in `nextjs-app/next.config.ts` (pageExtensions include md/mdx).
- Shared loader `src/data/blogPosts.ts` now falls back to explicit MDX imports when `import.meta.glob` is unavailable (Next). **When adding a new post, also add an explicit import to that fallback map** until we introduce an automated manifest step.
- Blog/article rendering in Next currently uses client wrappers (`app/blog/[slug]/ClientArticle.tsx`, `ClientAuthor.tsx`) to dodge server MDX typing issues; metadata for posts is basic. Improve later by revisiting server MDX once types are stable.
- Rewrites for `/blog`, `/blog/:slug`, `/blog/authors/:slug` point to the placeholder Next URL—replace with the real deployment URL before shipping.
- Automation: run `npm run sync:blog-metadata` after adding/updating MDX posts (from Sanity export or manual edits). The script reads `content/posts/*.mdx` frontmatter and regenerates `nextjs-app/app/blog/postMetadata.ts` (slug/title/description/publishedAt/image) so `generateMetadata` stays in sync without loading MDX on the server.

---

## Success Metrics

### Track Before/After Migration

| Metric                         | Vite Baseline | Next.js Target | Measurement Tool      |
| ------------------------------ | ------------- | -------------- | --------------------- |
| **SEO**                        |
| Lighthouse SEO Score           | ~70           | 95+            | Lighthouse CI         |
| Crawlable Pages                | 0%            | 100%           | Google Search Console |
| Social Share Previews          | ❌            | ✅             | Facebook Debugger     |
| **Performance**                |
| LCP (Largest Contentful Paint) | 2.5s          | <1.8s          | Chrome DevTools       |
| FCP (First Contentful Paint)   | 1.8s          | <1.2s          | Chrome DevTools       |
| TTI (Time to Interactive)      | 3.2s          | <2.5s          | Lighthouse            |
| **Business**                   |
| Organic Traffic                | Baseline      | +50% QoQ       | Google Analytics      |
| Bounce Rate                    | Baseline      | -15%           | Google Analytics      |
| Avg Session Duration           | Baseline      | +20%           | Google Analytics      |
| Qualified Leads                | 3-5/quarter   | 15-20/year     | CRM                   |

### Monitoring Dashboard

Create Vercel Analytics dashboard tracking:

- Page load times (per route)
- Error rates (4xx, 5xx)
- Cache hit rates
- Edge function execution time

---

## Team Responsibilities

| Role               | Responsibilities                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **Lead Developer** | - Execute migration phases<br>- Code reviews<br>- Testing oversight                         |
| **Designer**       | - Visual regression validation<br>- Theme consistency checks<br>- Component prop validation |
| **SEO/Marketing**  | - Metadata validation<br>- Social preview testing<br>- Analytics monitoring                 |
| **Stakeholder**    | - Approve cutover timing<br>- Review success metrics<br>- Rollback authorization            |

---

## Communication Plan

### Weekly Status Updates

**Every Friday:** Post to team channel:

```
📊 Next.js Migration Update - Week X

✅ Completed:
- Route X migrated and deployed
- Y tests passing

🚧 In Progress:
- Extracting Route Z to shared component

📈 Metrics:
- Lighthouse SEO: 85 (+15 from baseline)
- LCP: 2.1s (-0.4s improvement)

⚠️ Blockers: None
```

### Stakeholder Milestones

- **Week 4:** First route live (demo SEO improvements)
- **Week 8:** 50% routes migrated (review metrics)
- **Week 12:** 80% routes migrated (cutover decision)
- **Week 13:** Cutover complete (celebrate!)

---

## Appendix A: Deployment Scripts

### `scripts/deploy-hybrid.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Hybrid Vite + Next.js Setup"

# Build Vite app
echo "📦 Building Vite app..."
npm run build:vite

# Build Next.js app
echo "📦 Building Next.js app..."
npm run build:next

# Deploy Next.js to Vercel
echo "☁️ Deploying Next.js to Vercel..."
cd nextjs-app
vercel --prod --yes
NEXT_URL=$(vercel ls --prod | grep -o 'https://[^ ]*' | head -1)
cd ..

# Update vercel.json with Next.js URL
echo "📝 Updating routing configuration..."
# (Script to programmatically update vercel.json)

# Deploy Vite to GitHub Pages
echo "📤 Deploying Vite to GitHub Pages..."
npm run deploy:vite

echo "✅ Deployment complete!"
echo "Next.js URL: $NEXT_URL"
```

### `scripts/test-migration-route.sh`

```bash
#!/bin/bash
# Test a migrated route for parity

ROUTE=$1
VITE_BASE="http://localhost:5173"
NEXT_BASE="http://localhost:3000"

echo "🧪 Testing $ROUTE"

# Visual comparison (requires Playwright)
npx playwright test --grep="$ROUTE" --project=chromium

# Performance comparison
echo "📊 Performance: Vite"
npx lighthouse "$VITE_BASE$ROUTE" --quiet --only-categories=performance

echo "📊 Performance: Next.js"
npx lighthouse "$NEXT_BASE$ROUTE" --quiet --only-categories=performance

# Accessibility check
echo "♿ Accessibility: Next.js"
npx lighthouse "$NEXT_BASE$ROUTE" --quiet --only-categories=accessibility
```

---

## Appendix B: Risk Assessment

| Risk                                 | Impact   | Probability | Mitigation                                         |
| ------------------------------------ | -------- | ----------- | -------------------------------------------------- |
| **Theme not persisting across apps** | High     | Medium      | Extensive cookie testing; fallback to localStorage |
| **i18n mismatch**                    | High     | Low         | Shared translation files; validation tests         |
| **CSS conflicts**                    | Medium   | Medium      | Scoped modules; visual regression tests            |
| **Performance regression**           | High     | Low         | Lighthouse CI; rollback if scores drop             |
| **SEO metadata missing**             | Critical | Low         | Automated tests; manual preview checks             |
| **Vercel routing errors**            | Critical | Medium      | Staging environment testing; instant rollback      |
| **Component prop regressions**       | High     | Low         | Comprehensive unit tests; PropTypes validation     |
| **Asset loading failures**           | Medium   | Low         | Test asset paths in both environments              |

---

## Appendix C: Reference Links

### Documentation

- [Next.js 16 App Router](https://nextjs.org/docs/app)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Vercel Rewrites](https://vercel.com/docs/projects/project-configuration#rewrites)
- [i18next React](https://react.i18next.com/)

### Tools

- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Playwright](https://playwright.dev/)
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Internal Docs

- `docs/LLM_COMPONENT_GENERATION_RULES.md` - Component standards
- `docs/2026_PRD.md` - Migration objectives
- `docs/LAYOUT_GRID_SYSTEM.md` - Design system reference

---

## Changelog

| Date       | Change               | Author         |
| ---------- | -------------------- | -------------- |
| 2025-11-21 | Initial plan created | Migration Team |

---

**Next Steps:** Begin Phase 1 (Foundation Setup) upon approval.
