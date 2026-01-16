# Phase 02 Research: Typography & Font System

> **Research Date**: 2026-01-14
> **Domain**: Web Typography, Variable Fonts, Next.js Font Optimization
> **Confidence**: High (well-documented ecosystem)

---

## Executive Summary

Modern web typography in 2026 centers on **variable fonts** for performance and flexibility, **`next/font`** for automatic optimization, and **bold/maximalist display typography** for creative studio sites. The project's current fonts (TiemposHeadline + Moderat) can be replaced with equally distinctive alternatives that offer variable font benefits and are either free or more cost-effective.

**Recommended Direction**: Bold display font for headings + clean geometric/humanist sans-serif for body, leveraging `next/font` with CSS variables for Tailwind integration.

---

## Current State Analysis

### Existing Typography Stack
| Role | Font | Type | License | Notes |
|------|------|------|---------|-------|
| Headings | TiemposHeadline-Regular | Serif | Klim Type Foundry (premium) | Elegant, editorial feel |
| Body | Moderat | Sans-serif | Tighttype (premium) | Clean, readable |
| Body (secondary) | TiemposText-Regular | Serif | Klim Type Foundry | Long-form content |

### Issues with Current Setup
1. **No variable font support** — Multiple weight files increase load
2. **Static font files** — Not using `next/font` optimization
3. **Premium licenses** — Ongoing cost considerations
4. **Limited weights** — Cannot smoothly animate weight transitions

---

## 2026 Typography Trends

### Creative Studio Direction

Based on research of 40+ design studios (Typewolf, Fonts In Use):

1. **Bold/Maximalist Typography** — Moving away from minimal neo-grotesques
2. **Variable Fonts** — Standard for performance and flexibility
3. **Expressive Display Types** — Distinctive character for headings
4. **Kinetic Typography** — Animation-ready variable fonts
5. **Heritage + Modern Mix** — Serif warmth + sans-serif clarity

> "The rigid, hyper-minimalist era defined by uniform sans-serif branding is giving way to typography with real personality."
> — Creative Bloq, Typography Trends 2026

### Common Studio Font Pairings (Typewolf Analysis)

| Display/Heading | Body/Text | Usage |
|-----------------|-----------|-------|
| Founders Grotesk | Apercu | 4+ studios |
| Saol Display | Untitled Sans | 3+ studios |
| Tiempos Headline | Colfax | 3+ studios |
| GT America | Mono variants | 2+ studios |

---

## Font Recommendations

### Option A: Free Variable Fonts (Recommended)

**Heading**: Syne (Google Fonts)
**Body**: Satoshi or General Sans (Fontshare)

| Font | Type | Weights | Variable | License | Best For |
|------|------|---------|----------|---------|----------|
| **Syne** | Display Sans | 400-800 | Yes | OFL (free) | Bold headings, experimental feel |
| **Satoshi** | Geometric Sans | 300-900 | Yes | Free (commercial) | Body text, UI elements |
| **General Sans** | Geometric Sans | 200-700 | Yes | Free (commercial) | Body text, dense UI |

**Why This Pairing**:
- Syne's widening weight system creates drama at display sizes
- Satoshi's clean geometry provides excellent body readability
- Both are variable fonts with full weight range
- Free for commercial use
- Distinct studio aesthetic without being generic

### Option B: Google Fonts Only

**Heading**: Syne or Space Grotesk
**Body**: Inter or Outfit

| Font | Type | Weights | Variable | Notes |
|------|------|---------|----------|-------|
| **Syne** | Display | 400-800 | Yes | Experimental, creative |
| **Space Grotesk** | Grotesk | 300-700 | Yes | Quirky monospace details |
| **Inter** | Humanist Sans | 100-900 | Yes | Industry standard UI font |
| **Outfit** | Geometric Sans | 100-900 | Yes | Modern, flexible |

**Why This Option**:
- Zero licensing concerns
- Native `next/font/google` integration
- Excellent documentation and support
- Wide language support

### Option C: Premium Alternatives (If Budget Allows)

**Heading**: Söhne (Klim) or GT America (Grilli Type)
**Body**: Söhne or Maison Neue

**Notes**: Premium foundry fonts like Söhne offer exceptional quality but require licensing. These are shown as reference for what the current TiemposHeadline aesthetic is comparable to.

---

## Technical Implementation

### Next.js Font Optimization (`next/font`)

**Key Benefits**:
- Automatic self-hosting (no external requests)
- Zero layout shift (built-in)
- CSS files downloaded at build time
- Privacy-preserving (no Google tracking)

**Implementation Pattern**:

```typescript
// app/fonts.ts
import { Syne } from 'next/font/google'
import localFont from 'next/font/local'

// Google Font (variable)
export const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: '400..800', // Variable font range
})

// Local Font (Satoshi from Fontshare)
export const satoshi = localFont({
  src: [
    { path: './fonts/Satoshi-Variable.woff2', style: 'normal' },
    { path: './fonts/Satoshi-VariableItalic.woff2', style: 'italic' },
  ],
  variable: '--font-body',
  display: 'swap',
})
```

**Root Layout Integration**:

```tsx
// app/layout.tsx
import { syne, satoshi } from './fonts'

export default function RootLayout({ children }) {
  return (
    <html className={`${syne.variable} ${satoshi.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### Tailwind CSS Integration

**With CSS Variables**:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

**Usage**:
```tsx
<h1 className="font-heading text-display font-bold">Bold Heading</h1>
<p className="font-body text-text-m">Body text here</p>
```

---

## Fluid Typography

### CSS `clamp()` Approach (Already in Use)

The project already uses `clamp()` for responsive typography in `variables.css`. This approach should be preserved and extended:

```css
/* Existing pattern - keep this */
--font-size-display: clamp(5rem, 10vw + 3rem, 8rem);
--font-size-title-xl: clamp(3.5rem, 6vw + 2.5rem, 5.5rem);
```

### Tailwind Fluid Typography Options

**Option 1: Keep CSS Variables (Recommended)**
- Already implemented
- Works with existing design tokens
- Theme-aware

**Option 2: Tailwind Plugin (`fluid-tailwind`)**
- Syntax: `~text-lg/xl` (fluid between breakpoints)
- Automatic WCAG compliance checks
- Additional dependency

**Recommendation**: Keep existing `clamp()` in CSS variables, reference via Tailwind config.

---

## Typography Scale

### Recommended Scale (Based on Current)

| Token | Role | Min | Preferred | Max |
|-------|------|-----|-----------|-----|
| `display` | Hero headlines | 80px | 10vw + 3rem | 128px |
| `title-xl` | Page titles | 56px | 6vw + 2.5rem | 88px |
| `title-l` | Section headers | 44px | 4vw + 1.75rem | 68px |
| `title-m` | Subsections | 32px | 2.8vw + 1.3rem | 48px |
| `title-s` | Minor headings | 24px | 2vw + 1.1rem | 36px |
| `text-l` | Large body | 18px | 0.8vw + 1rem | 24px |
| `text-m` | Body text | 16px | 0.6vw + 0.9rem | 20px |
| `text-s` | Small text | 12px | 0.4vw + 0.8rem | 17px |

### Line Height Tokens

| Token | Value | Use Case |
|-------|-------|----------|
| `tight` | 1.2 | Large display headings |
| `snug` | 1.375 | Medium headings |
| `normal` | 1.5 | Body text, UI |
| `relaxed` | 1.625 | Long-form content |
| `loose` | 1.75 | Maximum readability |

---

## Typography Components

### Recommended Primitives

1. **`Heading`** — h1-h6 with size/weight variants
2. **`Text`** — Paragraph with size/color variants
3. **`Display`** — Extra-large hero text
4. **`Label`** — Form labels, captions
5. **`Code`** — Inline code, code blocks

### Component API Pattern

```tsx
// Example Heading component API
<Heading
  as="h1"
  size="display"
  weight="bold"
  className="mb-layout-16"
>
  Bold Headline
</Heading>

// Example Text component API
<Text
  as="p"
  size="m"
  color="muted"
  className="max-w-prose"
>
  Body text content here.
</Text>
```

---

## Accessibility Considerations

### WCAG Requirements

1. **Resize Text (1.4.4)** — Text must scale to 200% without loss
2. **Contrast (1.4.3)** — Minimum 4.5:1 for body, 3:1 for large text
3. **Text Spacing (1.4.12)** — Support user stylesheet overrides

### Implementation Notes

- Use `rem` units (not `px`) for all typography
- `clamp()` with `rem` preserves user zoom preferences
- Test with 200% browser zoom
- Ensure high-contrast themes override font colors properly

---

## Common Pitfalls

### What NOT to Do

| Pitfall | Why | Solution |
|---------|-----|----------|
| Too many fonts | Performance, visual chaos | Max 2 families |
| Non-variable fonts | Multiple file loads | Use variable fonts |
| Hardcoded px sizes | Breaks zoom | Use rem + clamp |
| Missing fallbacks | FOUT issues | Define system fallbacks |
| Ignoring line-height | Poor readability | Match line-height to size |
| Over-customizing shadcn | Maintenance burden | Extend, don't replace |

### What NOT to Hand-Roll

1. **Font loading** — Use `next/font` (handles FOUT, preloading)
2. **Typography plugin** — Use `@tailwindcss/typography` for prose
3. **Accessibility testing** — Use axe-core, not manual checks
4. **Responsive breakpoints** — Use existing Tailwind config

---

## Implementation Checklist

### Phase 02 Should Include

- [ ] Download/configure new fonts (Syne + Satoshi or alternatives)
- [ ] Set up `next/font` with CSS variables
- [ ] Update Tailwind fontFamily config
- [ ] Create typography CSS variables (or update existing)
- [ ] Build `Heading` component
- [ ] Build `Text` component
- [ ] Build `Display` component (optional, for hero sections)
- [ ] Update existing components to use new type primitives
- [ ] Test across all 4 themes
- [ ] Verify accessibility (zoom, contrast)

### Dependencies

```json
{
  "devDependencies": {
    "@tailwindcss/typography": "^0.5.x"  // For prose styling
  }
}
```

---

## Resources

### Official Documentation
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts)
- [Tailwind Typography Plugin](https://github.com/tailwindlabs/tailwindcss-typography)

### Font Sources
- [Fontshare (ITF)](https://www.fontshare.com/) — Free quality fonts
- [Google Fonts](https://fonts.google.com/) — Variable fonts
- [Fonts In Use](https://fontsinuse.com/) — Real-world examples

### Typography Trends
- [Creative Bloq - Typography Trends 2026](https://www.creativebloq.com/design/fonts-typography/breaking-rules-and-bringing-joy-top-typography-trends-for-2026)
- [Typewolf - Design Studios](https://www.typewolf.com/design-studios)
- [Monotype Type Trends](https://www.monotype.com/type-trends)

### Tools
- [Type Scale Calculator](https://typescale.com/)
- [Fluid Typography Calculator](https://utopia.fyi/type/calculator/)

---

## Decision Required

Before planning Phase 02, choose font direction:

**A) Free Variable Fonts (Recommended)**
- Syne (heading) + Satoshi (body)
- Zero cost, excellent quality
- Distinct studio aesthetic

**B) Google Fonts Only**
- Syne + Inter or Space Grotesk + Outfit
- Simplest integration
- Most documentation

**C) Keep Current Fonts**
- Update to variable versions if available
- Maintain existing aesthetic
- May require license verification

---

*Research completed: 2026-01-14*
*Next step: `/gsd:plan-phase 02` after font selection*
