# Hero Pattern

A comprehensive, reusable page hero component for creating impactful header sections with flexible layouts, multiple background styles, and accessible markup.

## Features

- ✅ **Multiple Layout Variants**: Default, Centered, Split, Minimal
- ✅ **Background Styles**: Light, Dark, Gradient, Image
- ✅ **Flexible Content**: Title, Subtitle, Description, Image, CTA Buttons
- ✅ **Responsive Design**: Mobile-first with progressive enhancement
- ✅ **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- ✅ **TypeScript**: Full type safety with comprehensive prop types
- ✅ **CSS Modules**: Scoped styling with design tokens
- ✅ **Next.js Image Optimization**: Built-in support for optimized images

## Usage

### Basic Hero

```tsx
import Hero from "@dt/Hero";

<Hero
  title="Welcome to Digitaltableteur"
  subtitle="Creative Development & Design"
  description="Building digital experiences that combine aesthetic excellence with functional innovation."
/>;
```

### Hero with CTA Buttons

```tsx
<Hero
  title="Get Started Today"
  subtitle="Transform Your Digital Presence"
  variant="centered"
  background="gradient"
  actions={[
    {
      key: "primary",
      label: "Start a Project",
      href: "/contact",
      variant: "primary",
      size: "l",
      inverse: true,
    },
    {
      key: "secondary",
      label: "View Our Work",
      href: "/work",
      variant: "secondary",
      size: "l",
      inverse: true,
    },
  ]}
/>
```

### Split Layout with Image

```tsx
<Hero
  title="Design That Speaks"
  subtitle="Creative Excellence"
  description="We craft digital experiences that tell your story."
  imageSrc="/images/hero-image.jpg"
  imageAlt="Design portfolio showcase"
  variant="split"
  maxWidth="xl"
  actions={[
    {
      key: "explore",
      label: "Explore Projects",
      href: "/work",
      variant: "primary",
      size: "l",
    },
  ]}
/>
```

## Props

### Core Props

| Prop          | Type                         | Default      | Description               |
| ------------- | ---------------------------- | ------------ | ------------------------- |
| `title`       | `string`                     | **required** | Hero title text           |
| `titleLevel`  | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `1`          | Semantic heading level    |
| `subtitle`    | `string`                     | `undefined`  | Optional subtitle text    |
| `description` | `string`                     | `undefined`  | Optional body description |

### Image Props

| Prop          | Type     | Default     | Description                           |
| ------------- | -------- | ----------- | ------------------------------------- |
| `imageSrc`    | `string` | `undefined` | Hero image URL                        |
| `imageAlt`    | `string` | `title`     | Image alt text (accessibility)        |
| `imageWidth`  | `number` | `1200`      | Image width for Next.js optimization  |
| `imageHeight` | `number` | `600`       | Image height for Next.js optimization |

### Layout Props

| Prop         | Type                                                    | Default         | Description           |
| ------------ | ------------------------------------------------------- | --------------- | --------------------- |
| `variant`    | `"default" \| "centered" \| "split" \| "minimal"`       | `"default"`     | Layout variant        |
| `background` | `"light" \| "dark" \| "gradient" \| "image"`            | `"light"`       | Background style      |
| `align`      | `"left" \| "center" \| "right"`                         | `"left"`        | Content alignment     |
| `maxWidth`   | `"sm" \| "md" \| "lg" \| "xl" \| "full"`                | `"lg"`          | Maximum content width |
| `spacing`    | `"compact" \| "default" \| "comfortable" \| "spacious"` | `"comfortable"` | Vertical spacing      |

### Action Props

| Prop      | Type           | Default     | Description       |
| --------- | -------------- | ----------- | ----------------- |
| `actions` | `HeroAction[]` | `undefined` | CTA buttons array |

#### HeroAction Interface

```typescript
interface HeroAction {
  key: string; // Unique identifier
  label: string; // Button label
  onClick?: () => void; // Click handler (for buttons)
  href?: string; // URL (for links)
  variant?: "primary" | "secondary" | "tertiary";
  size?: "s" | "m" | "l";
  inverse?: boolean; // Inverse color scheme
}
```

### Utility Props

| Prop        | Type     | Default                  | Description            |
| ----------- | -------- | ------------------------ | ---------------------- |
| `className` | `string` | `undefined`              | Custom CSS class       |
| `ariaLabel` | `string` | `"{title} hero section"` | ARIA label for section |

## Variants

### Default

Standard left-aligned layout with vertical content flow. Best for general page heroes.

```tsx
<Hero title="Default Layout" variant="default" />
```

### Centered

Centers all content horizontally and vertically. Perfect for landing pages.

```tsx
<Hero title="Centered Hero" variant="centered" align="center" />
```

### Split

Two-column grid layout on desktop (text left, image right). Ideal for showcasing visuals alongside content.

```tsx
<Hero
  title="Split Layout"
  imageSrc="/hero.jpg"
  imageAlt="Hero image"
  variant="split"
/>
```

### Minimal

Compact layout with reduced spacing. Best for secondary pages or minimal designs.

```tsx
<Hero title="Minimal Hero" variant="minimal" spacing="compact" />
```

## Background Styles

### Light

Default white/light background suitable for most contexts.

```tsx
<Hero title="Light Background" background="light" />
```

### Dark

Dark background with white text. Adds visual contrast.

```tsx
<Hero title="Dark Background" background="dark" />
```

### Gradient

Blue gradient background (uses primary color tokens). Creates bold, eye-catching heroes.

```tsx
<Hero
  title="Gradient Hero"
  background="gradient"
  actions={[
    { key: "cta", label: "Get Started", href: "/start", inverse: true },
  ]}
/>
```

### Image

Background image with dark overlay. Set via CSS custom properties or className.

```tsx
<Hero title="Image Background" background="image" className="custom-bg-image" />
```

## Alignment Options

- **Left** (`align="left"`): Default, content aligned to start
- **Center** (`align="center"`): Centered text and actions
- **Right** (`align="right"`): Content aligned to end

## Content Width

- **sm** (640px): Narrow, ideal for blog articles
- **md** (768px): Medium, good for general content
- **lg** (1024px): Large, standard hero size (default)
- **xl** (1280px): Extra large, for wide layouts
- **full**: Full viewport width

## Spacing Options

- **compact**: Minimal vertical padding
- **default**: Standard spacing
- **comfortable**: Extra padding (default)
- **spacious**: Maximum breathing room

## Accessibility

### Semantic HTML

- Uses `<section>` with `role="region"`
- Title rendered with proper heading level (`<h1>` - `<h6>`)
- Subtitle and description use `<Text>` component (semantic `<p>` tags)

### ARIA Labels

- Section has descriptive `aria-label` (auto-generated or custom)
- Images require `alt` text (uses title as fallback)
- Action links and buttons are keyboard accessible

### Keyboard Navigation

- All interactive elements (buttons, links) are keyboard focusable
- Tab order follows logical reading sequence

### Reduced Motion

- Respects `prefers-reduced-motion` media query
- Animations disabled for users who prefer reduced motion

### High Contrast Mode

- Increased font weights in high contrast mode
- Enhanced overlay opacity for image backgrounds

## Design Tokens

The Hero component uses design system tokens for consistency:

### Spacing

```css
--space-layout-16: 1rem;
--space-layout-24: 1.5rem;
--space-layout-32: 2rem;
--space-layout-48: 3rem;
```

### Colors

```css
--color-primary: Primary brand color --color-primary-dark: Dark variant
  --color-white: White text --color-background-light: Light background
  --color-background-dark: Dark background --color-text-primary: Primary text
  color --color-text-inverse: Inverse text color;
```

### Typography

```css
--line-height-relaxed: 1.7;
```

### Border Radius

```css
--radius-lg: 16px;
```

## Progressive Enhancement

The Hero component follows progressive enhancement principles:

### Gap Support

Falls back to margin-based spacing when CSS `gap` is not supported:

```css
@supports not (gap: 1rem) {
  .heroContent > * + * {
    margin-block-start: var(--space-layout-32);
  }
}
```

### Modern Features

- Uses CSS logical properties (`margin-inline`, `padding-block`)
- Responsive typography with `clamp()`
- CSS Grid for split layout with flexbox fallback

## Testing

Comprehensive test coverage includes:

- ✅ Basic rendering (title, subtitle, description)
- ✅ Title semantic levels (h1-h6)
- ✅ Image rendering and alt text
- ✅ Action buttons and links
- ✅ Click handlers
- ✅ All variants (default, centered, split, minimal)
- ✅ All backgrounds (light, dark, gradient, image)
- ✅ All alignments (left, center, right)
- ✅ Accessibility (ARIA labels, roles, keyboard navigation)
- ✅ Custom styling (className)
- ✅ Default props
- ✅ Complex scenarios

Run tests:

```bash
npm test Hero.test.tsx
```

## Storybook

View all Hero variants in Storybook:

```bash
npm run storybook
```

Navigate to **Patterns → Hero** to see:

- Default
- Centered
- WithActions
- SplitWithImage
- DarkBackground
- GradientBackground
- Minimal
- ImageOnly
- RightAligned
- FullWidth
- SmallWidth
- CompactSpacing
- SpaciousLayout
- MultipleActions
- Real-world examples (Portfolio, Service Landing)

## Best Practices

### When to Use

✅ **Use Hero for:**

- Page headers and introductory sections
- Landing page hero sections
- Portfolio project intros
- Service/product feature highlights
- About page introductions

❌ **Don't Use Hero for:**

- Section headers within pages (use `Title` component)
- Repeated content blocks (use `Card` component)
- Navigation elements (use `Header` pattern)

### Content Guidelines

**Title:**

- Keep concise (3-8 words ideal)
- Use sentence case or title case consistently
- Make it descriptive and action-oriented

**Subtitle:**

- Supporting context or tagline
- 5-12 words recommended
- Complement, don't repeat the title

**Description:**

- 1-3 sentences maximum
- Provide value proposition or key information
- Avoid marketing jargon

**Actions:**

- 1-3 CTAs maximum (avoid decision paralysis)
- Primary action most prominent
- Clear, action-oriented labels ("Get Started" not "Click Here")

### Layout Selection

- **Default**: General-purpose hero for most pages
- **Centered**: Landing pages, promotional content
- **Split**: When showcasing a visual (project, product)
- **Minimal**: Secondary pages, content-focused pages

### Image Guidelines

- **Resolution**: 1200x600px minimum for split layout
- **Format**: WebP preferred, JPEG/PNG fallback
- **Alt text**: Descriptive, not decorative
- **File size**: Optimize for web (<200KB)

## Migration from Old Pattern

If migrating from the old Hero fragment:

### Before

```tsx
<PageLayout maxWidth="md" spacing="comfortable" as="section">
  <Title level={1}>Helsinki Design System</Title>
</PageLayout>
<div className={styles.heroContainer}>
  <Image src="/hero.png" alt="Hero" layout="responsive" width={1200} height={600} />
</div>
```

### After

```tsx
<Hero
  title="Helsinki Design System"
  imageSrc="/hero.png"
  imageAlt="Helsinki Design System showcase"
  maxWidth="md"
  spacing="comfortable"
/>
```

## Related Components

- **Title**: For standalone headings
- **Text**: For body text
- **Button**: For actions/CTAs
- **Card**: For content blocks
- **PageLayout**: For page-level layout

## Contributing

When extending the Hero component:

1. Add new props to `HeroProps` interface with JSDoc comments
2. Update CSS Module with new variant classes
3. Add Storybook story demonstrating the new feature
4. Write tests covering the new functionality
5. Update this README with usage examples
6. Ensure accessibility is maintained

## License

Part of the Digitaltableteur Design System.  
All rights reserved © 2025 Digitaltableteur
