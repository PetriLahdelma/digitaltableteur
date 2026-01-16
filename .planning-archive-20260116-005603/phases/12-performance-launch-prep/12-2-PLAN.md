# Phase 12-2: Launch Preparation

> **Phase**: 12 (Performance & Launch Prep)
> **Plan**: 2 of 2
> **Tasks**: 10

---

## Objective

Complete i18n coverage, establish visual regression baselines, verify all functionality, and prepare for production deployment with comprehensive QA and documentation.

---

## Context

### Current State
- **Translation Coverage**: EN 882 keys, FI 866 keys (16 missing), SV 872 keys (20 missing)
- **Visual Regression**: 816 snapshots in `__visual__/snapshots/`
- **Test Coverage**: 92% component coverage, Playwright installed
- **Build Status**: Blocked by Sanity/React 19 issue (pre-existing)
- **Pre-existing TypeScript errors**: 537 (documented in CONCERNS.md)

### Key Files
- `nextjs-app/shared/locales/en/translation.json` — 882 keys
- `nextjs-app/shared/locales/fi/translation.json` — 866 keys (16 missing)
- `nextjs-app/shared/locales/sv/translation.json` — 872 keys (20 missing)
- `__visual__/snapshots/` — Visual regression baselines
- `scripts/run-visual-tests.mjs` — Visual test runner

### Dependencies
- Phase 12-1: Performance optimization (should be complete)

---

## Tasks

### Task 1: Complete Finnish (FI) Translations
**Files**: `nextjs-app/shared/locales/fi/translation.json`

Add missing 16 translation keys:
- Review EN translation file for missing keys
- Add Finnish translations for each
- Maintain consistent terminology

Missing keys to find:
```bash
# Run to find missing keys
diff <(jq -r 'paths | join(".")' en/translation.json | sort) \
     <(jq -r 'paths | join(".")' fi/translation.json | sort)
```

**Verification**: Count of keys matches EN (882)

---

### Task 2: Complete Swedish (SV) Translations
**Files**: `nextjs-app/shared/locales/sv/translation.json`

Add missing 20 translation keys:
- Review EN translation file for missing keys
- Add Swedish translations for each
- Maintain consistent terminology

**Verification**: Count of keys matches EN (882)

---

### Task 3: Create Translation Validation Script
**Files**: `scripts/validate-translations.mjs` (new), `package.json`

Automate translation coverage checking:
- Compare all language files against EN
- Report missing keys per language
- Exit with error if coverage < 100%
- Add to pre-commit or CI

```javascript
// scripts/validate-translations.mjs
import { readFileSync } from "fs";

const en = JSON.parse(readFileSync("nextjs-app/shared/locales/en/translation.json"));
const fi = JSON.parse(readFileSync("nextjs-app/shared/locales/fi/translation.json"));
const sv = JSON.parse(readFileSync("nextjs-app/shared/locales/sv/translation.json"));

function getAllKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === "object" && v !== null
      ? getAllKeys(v, key)
      : [key];
  });
}

const enKeys = new Set(getAllKeys(en));
const fiKeys = new Set(getAllKeys(fi));
const svKeys = new Set(getAllKeys(sv));

const missingFi = [...enKeys].filter(k => !fiKeys.has(k));
const missingSv = [...enKeys].filter(k => !svKeys.has(k));

if (missingFi.length > 0 || missingSv.length > 0) {
  console.error("Missing translations:");
  if (missingFi.length) console.error("FI:", missingFi);
  if (missingSv.length) console.error("SV:", missingSv);
  process.exit(1);
}

console.log("✓ All translations complete!");
```

**Verification**: `npm run validate:translations` passes

---

### Task 4: Update Visual Regression Baselines
**Files**: `__visual__/snapshots/` (updated)

Refresh visual regression snapshots:
- Run visual tests with update flag
- Review changes for intentional vs unintentional
- Commit updated baselines
- Document any breaking visual changes

```bash
npm run test:visual:update
```

**Verification**: `npm run test:visual` passes with no diffs

---

### Task 5: Create E2E Critical Path Tests
**Files**: `e2e/critical-paths.spec.ts` (new)

Test critical user flows:
- Homepage → Work → Project detail
- Homepage → Contact → Form submission (mock API)
- Homepage → Blog → Article → Share
- Language switching (EN → FI → SV)
- Theme switching (light → dark → HC)

```typescript
// e2e/critical-paths.spec.ts
import { test, expect } from "@playwright/test";

test("contact form submission flow", async ({ page }) => {
  await page.goto("/contact");
  await page.fill('input[name="fullName"]', "Test User");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('textarea[name="message"]', "Test message");
  await page.click('button[type="submit"]');
  await expect(page.locator(".success-message")).toBeVisible();
});
```

**Verification**: All critical path tests pass

---

### Task 6: Run Full Test Suite
**Files**: None (verification only)

Execute complete test suite:
- Unit tests: `npm test`
- Visual regression: `npm run test:visual`
- E2E tests: `npm run test:e2e`
- Accessibility: `npm run test:a11y`
- TypeScript: `npm run typecheck`
- Lint: `npm run lint`

Document results and fix any new failures.

**Verification**: All test categories pass (or known pre-existing failures documented)

---

### Task 7: Verify All Pages Render
**Files**: `scripts/verify-pages.mjs` (new)

Smoke test all routes:
- Fetch each page and check for 200 status
- Check for hydration errors in console
- Verify no JavaScript errors
- Test with JS disabled (progressive enhancement)

Routes to verify:
- `/` (home)
- `/about`
- `/work`
- `/work/helsinki-design-system`
- `/blog`
- `/blog/[any-post]`
- `/contact`
- `/pseo/*` (programmatic pages)

**Verification**: All pages return 200, no console errors

---

### Task 8: Create Launch Checklist Document
**Files**: `docs/LAUNCH_CHECKLIST.md` (new)

Comprehensive pre-launch checklist:
- Performance targets met
- Accessibility compliance verified
- i18n coverage 100%
- Visual regression baselines updated
- E2E tests passing
- Error monitoring configured (Sentry)
- Analytics working (GA4, Ahrefs)
- SEO metadata complete
- Security headers verified
- DNS/SSL configured
- Backup strategy documented

**Verification**: Checklist is complete and all items addressed

---

### Task 9: Document Known Issues
**Files**: `docs/KNOWN_ISSUES.md` (new or update existing)

Document outstanding issues for post-launch:
- Pre-existing TypeScript errors (537)
- Sanity/React 19 build blocker
- Any deferred Phase 12 items
- Performance optimization opportunities
- Technical debt priorities

**Verification**: All known issues documented with priorities

---

### Task 10: Create Release Notes
**Files**: `.planning/phases/12-performance-launch-prep/RELEASE_NOTES.md` (new)

Document v2.0 redesign release:
- Summary of all 12 phases completed
- New features and improvements
- Breaking changes (if any)
- Migration notes
- Performance improvements
- Accessibility enhancements
- Credits and acknowledgments

**Verification**: Release notes ready for publication

---

## Success Criteria

- [ ] Finnish translations 100% complete (882 keys)
- [ ] Swedish translations 100% complete (882 keys)
- [ ] Translation validation script created and passing
- [ ] Visual regression baselines updated
- [ ] E2E critical path tests created and passing
- [ ] Full test suite passes (or known failures documented)
- [ ] All pages verified rendering correctly
- [ ] Launch checklist created and completed
- [ ] Known issues documented
- [ ] Release notes created

---

## Output

```
Scripts:
  scripts/validate-translations.mjs (new)
  scripts/verify-pages.mjs (new)

Tests:
  e2e/critical-paths.spec.ts (new)

Translations:
  locales/fi/translation.json (updated - 16 keys)
  locales/sv/translation.json (updated - 20 keys)

Visual:
  __visual__/snapshots/ (updated baselines)

Docs:
  LAUNCH_CHECKLIST.md (new)
  KNOWN_ISSUES.md (new or updated)
  RELEASE_NOTES.md (new)
```

---

## Notes

- **Translation quality**: Use professional translation if available; AI translation acceptable for development
- **Visual baselines**: Review each changed snapshot before committing
- **E2E tests**: Mock external APIs to avoid flaky tests
- **Known issues**: Be honest about technical debt for future planning
- **Build blocker**: Sanity/React 19 issue should be tracked but is out of scope for this phase

---

*Created: 2026-01-14*
