# Layout & Grid System Documentation

## Overview

The Digitaltableteur layout system provides a comprehensive, responsive framework for consistent page layouts and grid-based designs. The system is built on CSS custom properties and follows mobile-first responsive design principles.

## Design Tokens

### Breakpoints

```css
--breakpoint-mobile: 480px
--breakpoint-tablet: 768px
--breakpoint-desktop: 1024px
--breakpoint-wide: 1440px
--breakpoint-ultra: 1920px
```

### Container Max-Widths

```css
--container-sm: 640px   /* Small content blocks, forms */
--container-md: 960px   /* Standard content width */
--container-lg: 1200px  /* Wide content areas */
--container-xl: 1440px  /* Extra wide layouts */
--container-full: 100%  /* Full bleed sections */
```

### Grid System

The grid automatically adapts across breakpoints:

- **Mobile (<768px)**: 4 columns, 16px gap
- **Tablet (768-1023px)**: 8 columns, 24px gap
- **Desktop (≥1024px)**: 12 columns, 32px gap

```css
--grid-columns-mobile: 4
--grid-columns-tablet: 8
--grid-columns-desktop: 12

--grid-gap-mobile: 16px
--grid-gap-tablet: 24px
--grid-gap-desktop: 32px
```

### Page Margins

Responsive edge spacing for consistent breathing room:

```css
--page-margin-mobile: 16px
--page-margin-tablet: 32px
--page-margin-desktop: 48px
--page-margin-wide: 64px
```

## Typography

### Line Heights

Optimized for readability across content types:

```css
--line-height-tight: 1.2      /* Large headings */
--line-height-snug: 1.375     /* Medium headings */
--line-height-normal: 1.5     /* Body text and UI */
--line-height-relaxed: 1.625  /* Long-form content */
--line-height-loose: 1.75     /* Maximum readability */
```

### Application

- **h1**: Line-height 1.2 (tight)
- **h2-h3**: Line-height 1.375 (snug)
- **h4-h6**: Line-height 1.5 (normal)
- **Paragraphs**: Line-height 1.625 (relaxed)
- **Articles**: Line-height 1.75 (loose)

### Vertical Rhythm

All margin and padding values use the spacing system to maintain consistent vertical rhythm:

```css
--rhythm-base: 0.5rem  /* 8px base unit */
```

## PageLayout Component

### Basic Usage

```tsx
import PageLayout from "@dt/PageLayout";

<PageLayout maxWidth="lg" spacing="comfortable">
  <h1>Page Title</h1>
  <p>Content goes here...</p>
</PageLayout>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxWidth` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'lg'` | Maximum width constraint |
| `spacing` | `'compact' \| 'default' \| 'comfortable' \| 'spacious'` | `'default'` | Vertical spacing |
| `grid` | `boolean` | `false` | Enable 12-column grid |
| `columns` | `number` | `undefined` | Custom column count (overrides responsive) |
| `withMargins` | `boolean` | `true` | Apply page margins |
| `as` | `'div' \| 'main' \| 'section' \| 'article'` | `'div'` | Semantic HTML element |
| `className` | `string` | `''` | Additional CSS class |
| `role` | `string` | `undefined` | ARIA role |
| `ariaLabel` | `string` | `undefined` | ARIA label |

### Grid Examples

#### Two-Column Layout

```tsx
<PageLayout grid maxWidth="lg">
  <div style={{ gridColumn: 'span 6' }}>
    Left column content
  </div>
  <div style={{ gridColumn: 'span 6' }}>
    Right column content
  </div>
</PageLayout>
```

#### Asymmetric Layout

```tsx
<PageLayout grid maxWidth="xl">
  <main style={{ gridColumn: 'span 8' }}>
    Main content
  </main>
  <aside style={{ gridColumn: 'span 4' }}>
    Sidebar
  </aside>
</PageLayout>
```

#### Complex Grid

```tsx
<PageLayout grid maxWidth="xl" spacing="comfortable">
  {/* Full-width header */}
  <header style={{ gridColumn: 'span 12' }}>
    Hero section
  </header>
  
  {/* Three equal columns */}
  <div style={{ gridColumn: 'span 4' }}>Feature 1</div>
  <div style={{ gridColumn: 'span 4' }}>Feature 2</div>
  <div style={{ gridColumn: 'span 4' }}>Feature 3</div>
  
  {/* Two unequal columns */}
  <article style={{ gridColumn: 'span 8' }}>Article</article>
  <aside style={{ gridColumn: 'span 4' }}>Related</aside>
</PageLayout>
```

## Spacing System

### Internal (Component) Spacing

Use for padding, gaps within components:

```css
--space-internal-0: 0
--space-internal-2: 2px
--space-internal-4: 4px
--space-internal-6: 6px
--space-internal-8: 8px
--space-internal-12: 12px
--space-internal-16: 16px
--space-internal-24: 24px
--space-internal-32: 32px
```

### Layout (Outer) Spacing

Use for margins, section spacing, grid gaps:

```css
--space-layout-0: 0
--space-layout-4: 4px
--space-layout-6: 6px
--space-layout-8: 8px
--space-layout-16: 16px
--space-layout-24: 24px
--space-layout-32: 32px
--space-layout-40: 40px
--space-layout-48: 48px
--space-layout-64: 64px
--space-layout-80: 80px
--space-layout-96: 96px
```

## Best Practices

### When to Use Each Container Size

- **`sm` (640px)**: Blog posts, focused forms, narrow content
- **`md` (960px)**: Documentation, articles, standard pages
- **`lg` (1200px)**: Dashboards, product pages, multi-column layouts
- **`xl` (1440px)**: Wide desktops, complex data displays
- **`full`**: Hero sections, galleries, immersive experiences

### Spacing Guidelines

- **Compact**: Dense interfaces, components managing own spacing
- **Default**: Standard pages, balanced layout
- **Comfortable**: Premium feel, generous breathing room
- **Spacious**: Landing pages, marketing content

### Grid Usage

1. **Always use grid for multi-column layouts** instead of manual flexbox
2. **Leverage responsive behavior** - grid automatically adapts to device
3. **Use span notation** for column widths: `gridColumn: 'span 6'`
4. **Combine with spacing** for consistent vertical rhythm

### Accessibility

- Use semantic HTML elements (`as="main"`, `as="section"`)
- Provide ARIA labels for landmark regions
- Maintain proper heading hierarchy
- Ensure sufficient color contrast

### Progressive Enhancement

The grid system uses `@supports` queries for modern CSS features:

```css
@supports (gap: 1rem) {
  .grid {
    display: grid;
    gap: var(--grid-gap-desktop);
  }
}
```

Fallbacks are provided for older browsers.

## Migration Guide

### Converting Existing Layouts

**Before:**
```tsx
<div style={{ 
  maxWidth: '1200px', 
  margin: '0 auto', 
  padding: '0 2rem' 
}}>
  <h1>Title</h1>
  <p>Content</p>
</div>
```

**After:**
```tsx
<PageLayout maxWidth="lg" spacing="default">
  <h1>Title</h1>
  <p>Content</p>
</PageLayout>
```

### Converting Custom Grids

**Before:**
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(12, 1fr)',
  gap: '2rem'
}}>
  <div style={{ gridColumn: 'span 6' }}>Left</div>
  <div style={{ gridColumn: 'span 6' }}>Right</div>
</div>
```

**After:**
```tsx
<PageLayout grid maxWidth="xl">
  <div style={{ gridColumn: 'span 6' }}>Left</div>
  <div style={{ gridColumn: 'span 6' }}>Right</div>
</PageLayout>
```

## Testing

The PageLayout component includes comprehensive unit tests covering:

- All max-width variants
- All spacing options
- Grid behavior
- Semantic HTML rendering
- Accessibility attributes
- Custom styling

Run tests with: `npm test PageLayout`

View Storybook examples: `npm run storybook`

## Related Documentation

- [Design System Report](./design-system-report.json)
- [Typography Guide](../docs/TYPOGRAPHY.md) (to be created)
- [Spacing System](../docs/SPACING.md) (to be created)
- [Component Guidelines](../README.md)
