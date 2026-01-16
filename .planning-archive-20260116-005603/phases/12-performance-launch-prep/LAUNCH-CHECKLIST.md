# Launch Checklist

**Project:** Digitaltableteur v2.0
**Phase:** 12-2 Launch Preparation
**Created:** January 2026

---

## Pre-Launch Verification

### Code Quality

- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] ESLint passes without errors (`npm run lint`)
- [ ] Stylelint passes without errors (`npm run lint:css`)
- [ ] All unit tests pass (`npm test`)
- [ ] Translation coverage 100% (`npm run validate:translations`)

### Accessibility

- [ ] axe-core audit passes on all pages
- [ ] Keyboard navigation verified on critical paths
- [ ] Screen reader testing completed (VoiceOver, NVDA)
- [ ] Focus management verified on modals and dialogs
- [ ] Skip links functional on all pages
- [ ] Color contrast meets WCAG 2.1 AA

### Performance

- [ ] Lighthouse Performance score >= 90
- [ ] Core Web Vitals pass (LCP, INP, CLS)
- [ ] Images optimized with Next.js Image
- [ ] Code splitting verified with bundle analyzer
- [ ] Critical CSS inlined

### SEO & Meta

- [ ] Meta titles on all pages
- [ ] Meta descriptions on all pages
- [ ] Open Graph tags verified
- [ ] Twitter Card tags verified
- [ ] Canonical URLs set correctly
- [ ] Sitemap generated and accessible at `/sitemap.xml`
- [ ] Robots.txt configured correctly at `/robots.txt`
- [ ] Structured data (JSON-LD) validated

### Security

- [ ] Content Security Policy configured
- [ ] HTTPS enforced (HSTS headers)
- [ ] API rate limiting enabled
- [ ] Input sanitization verified (DOMPurify)
- [ ] No secrets in client bundle
- [ ] Environment variables secured

### Internationalization

- [ ] English (EN) translations complete
- [ ] Finnish (FI) translations complete
- [ ] Swedish (SV) translations complete
- [ ] Language switcher functional
- [ ] RTL not required (EN/FI/SV only)

### Browser Testing

- [ ] Chrome latest (macOS, Windows)
- [ ] Firefox latest (macOS, Windows)
- [ ] Safari latest (macOS, iOS)
- [ ] Edge latest (Windows)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Content

- [ ] All pages have meaningful content
- [ ] Blog posts render correctly
- [ ] Images load with alt text
- [ ] Links don't 404
- [ ] Contact form submits successfully
- [ ] Privacy Policy updated with current date
- [ ] Accessibility Statement updated with current date

---

## Production Deployment

### Vercel Configuration

- [ ] Production environment variables set
- [ ] Domain configured (digitaltableteur.com)
- [ ] SSL certificate active
- [ ] Preview deployments working
- [ ] Build succeeds in CI

### Monitoring

- [ ] Sentry error tracking configured
- [ ] Google Analytics tracking code active
- [ ] Vercel Analytics enabled
- [ ] Speed Insights enabled

### DNS & Domain

- [ ] Domain DNS configured
- [ ] www redirect configured
- [ ] Email (MX records) verified

---

## Post-Launch Verification

### Smoke Tests

- [ ] Homepage loads in < 3s
- [ ] Navigation works
- [ ] Theme toggle works
- [ ] Language switcher works
- [ ] Contact form submits
- [ ] Blog posts accessible
- [ ] Work portfolio accessible

### Analytics Verification

- [ ] Google Analytics receiving events
- [ ] Vercel Analytics collecting data
- [ ] No console errors in production

### Backup & Recovery

- [ ] Database backup verified (MongoDB)
- [ ] Sanity CMS backup available
- [ ] Rollback procedure documented

---

## Blockers & Known Issues

1. **Production Build** - Sanity/React 19 peer dependency conflict
   - Status: Known blocker
   - Workaround: Use `--legacy-peer-deps` or wait for Sanity v3.x React 19 support
   - Tracking: See KNOWN-ISSUES.md

2. **Visual Regression Tests** - Browser connection flaky in CI
   - Status: Intermittent
   - Workaround: Re-run failed jobs

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Designer | | | |
| QA | | | |
| Product Owner | | | |

---

## Commands Reference

```bash
# Quality gates
npm run typecheck
npm run lint
npm test
npm run validate:translations

# Page verification (requires running server)
npm run dev &
npm run verify:pages

# Visual regression (requires Storybook)
npm run test:visual

# E2E tests (requires running server)
npx playwright test e2e/

# Production build
npm run build
```
