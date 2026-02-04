# Image Accessibility Audit (PERC-01)

**Audit Date:** 2026-01-28
**Standard:** WCAG 2.1 AA (1.1.1 Non-text Content)
**Status:** PASSING

---

## Executive Summary

The image accessibility audit confirms that the Digitaltableteur website meets WCAG 2.1 AA requirements for image accessibility. All automated tests pass with zero violations across 11 public pages. The codebase demonstrates consistent patterns for handling informative, decorative, and functional images.

---

## Automated Scan Results

### axe-core Image Rules Tested

| Rule | Description | Violations |
|------|-------------|------------|
| `image-alt` | Images must have alt attributes | 0 |
| `image-redundant-alt` | Alt text should not duplicate nearby text | 0 |
| `input-image-alt` | Image buttons need alternative text | 0 |
| `role-img-alt` | Elements with role="img" need accessible names | 0 |
| `svg-img-alt` | SVGs with role="img" need accessible names | 0 |

### Results by Page

| Page | URL | Violations | Passes |
|------|-----|------------|--------|
| Home | / | 0 | 2 |
| About | /about | 0 | 2 |
| Work | /work | 0 | 2 |
| Blog | /blog | 0 | 2 |
| Contact | /contact | 0 | 2 |
| Work - SAP Build Apps | /work/sap-build-apps | 0 | 2 |
| Work - Helsinki Design System | /work/helsinki-design-system | 0 | 2 |
| Privacy Policy | /privacy-policy | 0 | 2 |
| Accessibility | /accessibility | 0 | 2 |
| AI Use | /ai-use | 0 | 2 |
| 404 | /this-page-does-not-exist-404 | 0 | 2 |

**Total: 0 violations across 11 pages**

---

## Component Analysis

### Image Component Usage (28 files)

The `<Image>` component from Next.js is used throughout the codebase with consistent alt text patterns:

| Component | File | Alt Text Pattern | Status |
|-----------|------|------------------|--------|
| MdxImage | `MdxImage.tsx` | Defaults to `alt=""`, accepts custom alt | OK |
| EnhancedAuthorCard | `EnhancedAuthorCard.tsx` | Uses `alt={name}` | OK |
| Logo | `Logo.tsx` | Uses `alt="Digitaltableteur logo"` | OK |
| LogoReveal | `LogoReveal.tsx` | Uses props `logoAlt`, `wordmarkAlt` | OK |
| PersonCard | `PersonCard.tsx` | Uses `alt={imageAlt}` prop | OK |
| Gallery | `Gallery.tsx` | Uses `alt={img.alt}` from data | OK |
| LinkedInQuoteCard | `LinkedInQuoteCard.tsx` | Uses contextual alt like `Portrait of {name}` | OK |
| EnhancedArticleCard | `EnhancedArticleCard.tsx` | Uses `alt={image.alt}` from data | OK |
| Lightbox | `Lightbox.tsx` | Uses `alt={currentImage?.alt ?? ""}` | OK |
| ProjectCard | `ProjectCard.tsx` | Uses `alt={title}` | OK |
| Avatar | `Avatar.tsx` | Uses `alt={name}` or translated fallback | OK |
| Testimonial | `Testimonial.tsx` | Uses `Portrait of {name}` pattern | OK |
| EnhancedPersonCard | `EnhancedPersonCard.tsx` | Uses `alt={imageAlt}` prop | OK |
| ProjectGallery | `ProjectGallery.tsx` | Uses `alt={image.alt}` from data | OK |

### Native img Element Usage (17 files)

Native `<img>` elements are used in specific contexts:

| Component | Usage Context | Alt Text Pattern | Status |
|-----------|---------------|------------------|--------|
| Header | Logo image | Has alt text | OK |
| MdxImage | Fallback on error | Preserves original alt | OK |
| EmailSignatureGenerator | Generated signature | Company name as alt | OK |
| KnobSmithAudioPage | Project images | Descriptive alt | OK |
| VertaaUXPage | Project images | Descriptive alt | OK |
| SapBuildAppsPage | Project images | Descriptive alt | OK |
| IllustrationsPage | Artwork images | Descriptive alt | OK |
| NotFound | 404 page image | Descriptive alt | OK |

### Icon Component Usage (92 files)

The Icon component implements proper accessibility patterns:

**Implementation Details (Icon.tsx):**
```tsx
// Default: decorative if no ariaLabel provided
decorative = !ariaLabel

// Proper ARIA handling:
aria-hidden={decorative && !ariaLabel ? true : undefined}
aria-label={ariaLabel}
role={!decorative && ariaLabel ? "img" : undefined}

// SVG is always hidden from AT:
<IconComponent aria-hidden="true" focusable="false" />
```

**Pattern Analysis:**
- **Decorative icons**: Default behavior (`decorative=true`) - hidden from screen readers
- **Informative icons**: When `ariaLabel` is provided - exposed with `role="img"`
- **Inner SVG**: Always has `aria-hidden="true"` and `focusable="false"`

This is the correct pattern per WAI-ARIA APG.

### MdxImage Usage (3 files)

| File | Usage | Status |
|------|-------|--------|
| `ArticlePageTemplate.tsx` | Blog/article images | Uses MdxImage component |
| `MdxImage.tsx` | Component definition | Defaults `alt=""` |
| `MdxImage.test.tsx` | Test coverage | Tests alt text handling |

**Note:** MdxImage defaults to `alt=""` (empty string) which is valid for decorative images. For informative images, the MDX author must provide alt text in the markdown: `![Alt text](/image.jpg)`.

---

## Findings

### Passing

1. **All Next.js Image components have alt attributes** - Either explicit values or passed via props
2. **Icon component properly handles decorative vs informative icons** - Uses `aria-hidden` for decorative, `role="img"` + `aria-label` for informative
3. **Consistent patterns across components** - Name/title as alt for avatars, descriptive text for content images
4. **No redundant alt text violations** - Alt text appropriately differs from surrounding text
5. **SVGs properly marked** - Inner SVGs have `aria-hidden="true"` and `focusable="false"`

### Issues Found

**None.** The codebase demonstrates excellent image accessibility practices.

### Potential Improvements (Not Blocking)

1. **MdxImage fallback:** When `alt` is not provided, MdxImage defaults to empty string. This is correct for decorative images but relies on content authors to provide alt text for informative images. Consider adding documentation or warnings for MDX authors.

2. **Icon usage without ariaLabel:** Some icon usages may benefit from explicit `decorative={true}` for clarity, though the default behavior (no ariaLabel = decorative) is correct.

---

## PERC-01 Status

- [x] All informative images have descriptive alt text
- [x] All decorative images use `alt=""` or `aria-hidden`
- [x] All icon-only buttons have accessible names (verified in Phase 6 - 06-06)

**PERC-01 Requirement: COMPLETE**

---

## Verification Details

### Test Suite

Location: `tests/a11y/perceivable/image-alt-audit.spec.ts`

The test suite uses `@axe-core/playwright` with the following rules:
- `image-alt`
- `image-redundant-alt`
- `input-image-alt`
- `role-img-alt`
- `svg-img-alt`

Run command: `npm run test:a11y -- --grep "image"`

### Manual Verification Performed

1. Reviewed Image component implementations
2. Checked Icon component accessibility patterns
3. Verified MdxImage default behavior
4. Analyzed alt text patterns across 50+ usages

---

## Recommendation

**No fixes required.** PERC-01 image accessibility requirement is satisfied.

Continue to next PERC requirement (PERC-02: Color Contrast).

---

## Related Requirements

| Requirement | Status | Dependency |
|-------------|--------|------------|
| PERC-01 (Image alt text) | **Complete** | - |
| COMP-08 (Icon-only buttons) | Complete | Verified in Phase 6 |

---

*Audit completed: 2026-01-28*
*Test results: tests/a11y/audit-results/image-alt-audit-results.json*
