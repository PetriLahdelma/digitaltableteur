# Known Issues - Launch v2.0

**Phase:** 12-2 Launch Preparation
**Last Updated:** January 2026

---

## Critical / Blocking

*No critical blocking issues at this time.*

---

## High Priority

### 2. Visual Regression Tests Flaky in CI

**Status:** OPEN
**Severity:** High
**Component:** Testing / Vitest / Playwright

**Description:**
Browser-based visual regression tests intermittently fail with "Browser connection was closed while running tests" error. This appears to be a race condition in Vitest browser mode.

**Error:**
```
Error: [vitest] Browser connection was closed while running tests.
Was the page closed unexpectedly?
```

**Workarounds:**
1. Re-run failed CI jobs (usually passes on retry)
2. Run visual tests locally instead
3. Skip browser tests in CI with `SKIP_BROWSER_TESTS=true`

**Root Cause:**
Vitest browser mode with Storybook test runner has timing issues when optimizing dependencies on first run.

**Resolution:**
- Add dependencies to `optimizeDeps.include` in vitest config
- Consider migrating to Playwright component testing

---

### 3. Storybook Accessibility Addon Performance

**Status:** MONITORING
**Severity:** Medium
**Component:** Storybook / @storybook/addon-a11y

**Description:**
Accessibility addon can cause significant slowdown when rendering stories with many DOM nodes (>1000 elements). This affects development experience but not production.

**Workaround:**
Disable addon during intensive development sessions via Storybook toolbar.

---

## Medium Priority

### 4. Theme Flicker on Initial Load

**Status:** KNOWN LIMITATION
**Severity:** Medium
**Component:** Theme System / next-themes

**Description:**
Brief flash of light theme before dark theme applies on initial page load when user prefers dark mode. This is a common SSR hydration issue.

**Workaround:**
- `suppressHydrationWarning` on `<html>` tag (implemented)
- CSS blocking script in `<head>` (considered too invasive)

**Technical Details:**
Server renders with default theme, client hydrates and applies user preference. The gap between render and hydration causes the flash.

---

### 5. Google Analytics Consent Mode v2 Integration

**Status:** PLANNED
**Severity:** Medium
**Component:** Analytics / GDPR

**Description:**
Current implementation uses basic consent banner. Google Analytics Consent Mode v2 (required for EU) needs deeper integration for proper consent signal handling.

**Resolution:**
Implement in post-launch update. Current implementation is functional but not optimal for ad personalization signals.

---

## Low Priority

### 6. Safari iOS Animation Jank

**Status:** MONITORING
**Severity:** Low
**Component:** Framer Motion / CSS Animations

**Description:**
Some complex animations (parallax, morph transitions) exhibit slight jank on older iOS devices (iPhone 11 and earlier).

**Workaround:**
- `will-change: transform` on animated elements (implemented)
- Reduce animation complexity for mobile via media queries

---

### 7. Swedish Translation Extra Keys

**Status:** INFORMATIONAL
**Severity:** Low
**Component:** i18n

**Description:**
Swedish translation file has 10 extra keys not present in English source. These are legacy keys that should be cleaned up but don't affect functionality.

**Extra Keys:**
- privacyPolicyMetaTitle, privacyPolicyMetaDescription
- privacyPolicyContactFormItem1-4
- privacyPolicyComplaintsTitle/Body
- accessibilityMetaTitle/Description

**Resolution:**
Clean up in future maintenance sprint. No functional impact.

---

## Resolved in This Phase

### Fixed: Sanity/React 19 useEffectEvent Build Error

**Status:** RESOLVED (commit c20bca9bb)
**Description:** Production build failed with "useEffectEvent is not exported from react" when Sanity v5 packages tried to import the hook during webpack compilation.
**Resolution:**
1. Upgraded sanity from 4.22.0 to 5.3.1
2. Created React wrapper (lib/react-with-use-effect-event.js) that re-exports React plus useEffectEvent ponyfill
3. Added webpack NormalModuleReplacementPlugin to redirect React imports from Sanity packages to the wrapper

---

### Fixed: TypeScript MdxImage Props Mismatch

**Status:** RESOLVED (commit 98efb2fcb)
**Description:** `MdxImageWrapper` had type mismatch between HTML img props and MdxImageProps.
**Resolution:** Explicitly extract and type-convert props in wrapper component.

### Fixed: E2E Tests Missing from tsconfig Exclude

**Status:** RESOLVED (commit 98efb2fcb)
**Description:** Playwright tests caused TypeScript errors because `@playwright/test` types weren't available.
**Resolution:** Added `e2e` to tsconfig exclude list (Playwright has its own tsconfig).

---

## Issue Template

```markdown
### [Issue Number]. [Title]

**Status:** [OPEN | MONITORING | PLANNED | RESOLVED]
**Severity:** [Critical | High | Medium | Low]
**Component:** [Affected area]

**Description:**
[What's happening]

**Workaround:**
[How to mitigate]

**Resolution:**
[Fix plan or resolution]
```
