---
phase: 04-understandable-fixes
plan: 03
subsystem: ui
tags: [i18n, accessibility, wcag, react, css-modules]

# Dependency graph
requires:
  - phase: 03-operable-fixes
    provides: Keyboard and focus management patterns
provides:
  - LanguageNotice component for multilingual content notices
  - Blog articles wrapped with lang="en" for screen readers
  - Translation keys for EN, FI, SV language names
affects: [07-page-verification, 08-final-verification]

# Tech tracking
tech-stack:
  added: []
  patterns: [lang attribute for content sections, localized language names]

key-files:
  created:
    - app/components/LanguageNotice/LanguageNotice.tsx
    - app/components/LanguageNotice/LanguageNotice.module.css
    - app/components/LanguageNotice/index.ts
  modified:
    - app/blog/[slug]/ClientArticle.tsx
    - nextjs-app/shared/locales/en/translation.json
    - nextjs-app/shared/locales/fi/translation.json
    - nextjs-app/shared/locales/sv/translation.json

key-decisions:
  - "Use locative case for Finnish language names (englanniksi, suomeksi, ruotsiksi)"
  - "Wrap entire article in lang='en' for consistent screen reader pronunciation"
  - "LanguageNotice styled with subtle muted italic text and left border indicator"

patterns-established:
  - "LanguageNotice pattern: Conditional rendering based on UI vs content language"
  - "lang attribute wrapper: Use <article lang='xx'> for content in different language"

# Metrics
duration: 4min
completed: 2026-01-30
---

# Phase 4 Plan 3: Language Notice and Content Language Markers Summary

**LanguageNotice component with conditional rendering when UI language differs from content, plus lang="en" wrapper for blog articles ensuring correct screen reader pronunciation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-30T13:39:01Z
- **Completed:** 2026-01-30T13:43:00Z
- **Tasks:** 2/2
- **Files modified:** 7

## Accomplishments
- Created LanguageNotice component with subtle, non-intrusive styling
- Wrapped blog articles in `<article lang="en">` for WCAG 3.1.2 compliance
- Added translation keys for content language notice in EN, FI, SV
- Added localized language names for all 3 supported languages

## Task Commits

Each task was committed atomically:

1. **Task 1: Create LanguageNotice component** - `ab0de841c` (feat)
2. **Task 2: Add translations and integrate into blog articles** - `0ee837c8e` (feat)

## Files Created/Modified
- `app/components/LanguageNotice/LanguageNotice.tsx` - Client component with conditional rendering
- `app/components/LanguageNotice/LanguageNotice.module.css` - Subtle styling with dark theme support
- `app/components/LanguageNotice/index.ts` - Barrel export
- `app/blog/[slug]/ClientArticle.tsx` - Added lang="en" wrapper and LanguageNotice
- `nextjs-app/shared/locales/en/translation.json` - Added contentLanguageNotice + languageName keys
- `nextjs-app/shared/locales/fi/translation.json` - Finnish translations (locative case)
- `nextjs-app/shared/locales/sv/translation.json` - Swedish translations

## Decisions Made
- Used Finnish locative case for language names (englanniksi, suomeksi, ruotsiksi) - grammatically correct for the sentence structure "available in X only"
- Styled notice with muted italic text and left border for subtle but visible indication
- Component renders nothing when UI language matches content language (no unnecessary notices)
- lang attribute on notice itself uses currentLang since the notice text is in UI language

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors in other files (app/dev/code-window, CodeBlockWindow, test files) - unrelated to this plan, did not block execution
- ESLint config ignores app/ directory files - no lint errors to fix

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- WCAG 3.1.2 (Language of Parts) addressed for blog articles
- LanguageNotice component available for reuse in other English-only content areas
- Ready for Phase 4 Plan 4 or page-level verification

---
*Phase: 04-understandable-fixes*
*Completed: 2026-01-30*
