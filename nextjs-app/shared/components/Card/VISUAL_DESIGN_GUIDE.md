# Card Component - Visual Design Guide

**Status**: ✅ Redesigned (December 2025)
**Design System**: Digitaltableteur v2.0
**UI Design Principles Applied**: Material Design 3 + Custom Enhancements

---

## Design Philosophy

The Card component follows modern UI design principles:

1. **Visual Hierarchy**: Clear separation between header, content, and footer
2. **Depth & Elevation**: Sophisticated shadow system with 5 levels
3. **Micro-interactions**: Spring-bounce animations and gradient overlays
4. **Accessibility First**: Enhanced focus states and WCAG AA compliance
5. **Responsive**: Mobile-first with fluid spacing

---

## Visual Enhancements Summary

### What Changed

| Element | Before | After | Impact |
|---------|--------|-------|--------|
| **Border Radius** | 2px | 12px | Modern, softer edges |
| **Shadow System** | 5 Material levels | 5 tailored levels with layered depth | More refined elevation |
| **Hover Transform** | `scale(1.02)` | `translateY(-4px) scale(1.01)` | Dramatic lift effect |
| **Gradient Overlays** | None | Subtle gradient on hover | Added depth |
| **Focus Ring** | 3px offset | 4px offset + glow | Better visibility |
| **Typography** | Default | Enhanced spacing, semibold subtitle | Improved hierarchy |
| **Loading State** | Basic gradient | Shimmer animation | Polished UX |

---

## Design Tokens

### Color System

```css
--card-container-color: var(--color-white);      /* Base background */
--card-outline-color: var(--color-primary);      /* Border color */
--card-filled-bg: var(--color-light-bg);         /* Filled variant bg */
```

### Shadow System (Layered Depth)

```css
/* Level 1 - Subtle (cards at rest) */
--card-shadow-sm:
  0 1px 2px 0 rgb(0 0 0 / 0.05),
  0 1px 3px 0 rgb(0 0 0 / 0.1);

/* Level 2 - Moderate (default elevated) */
--card-shadow-md:
  0 4px 6px -1px rgb(0 0 0 / 0.1),
  0 2px 4px -1px rgb(0 0 0 / 0.06);

/* Level 3 - Prominent (hover state) */
--card-shadow-lg:
  0 10px 15px -3px rgb(0 0 0 / 0.1),
  0 4px 6px -2px rgb(0 0 0 / 0.05);

/* Level 4 - Dramatic (elevated hover) */
--card-shadow-xl:
  0 20px 25px -5px rgb(0 0 0 / 0.1),
  0 10px 10px -5px rgb(0 0 0 / 0.04);

/* Level 5 - Maximum (modals, overlays) */
--card-shadow-2xl:
  0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### Spacing (8px Grid System)

```css
--card-header-padding: var(--space-internal-24);   /* 24px */
--card-content-padding: var(--space-internal-24);  /* 24px */
--card-footer-padding: var(--space-internal-24);   /* 24px */
--card-container-shape: 12px;                      /* Border radius */
```

---

## Variant Designs

### 1. Outlined (Default)

**Visual Characteristics**:
- 2px solid border in primary color
- No shadow at rest
- Gradient overlay on hover (subtle blue tint)
- Border changes to accent purple on hover

**Use Case**: Default cards, content sections, information display

**Hover Behavior**:
```css
/* Lift effect */
transform: translateY(-4px) scale(1.01);
box-shadow: var(--card-shadow-lg);
border-color: var(--accent-purple);
```

**Example**:
```tsx
<Card variant="outlined" hoverable title="Feature Overview">
  Content here
</Card>
```

---

### 2. Filled

**Visual Characteristics**:
- Light gray background (#f9f9f9)
- Subtle shadow (sm level)
- Inner glow effect (inset shadow)
- Elevates to white background on hover

**Use Case**: Secondary content, sidebar widgets, less prominent information

**Hover Behavior**:
```css
transform: translateY(-2px);
box-shadow: var(--card-shadow-md);
background-color: var(--color-white);
```

**Example**:
```tsx
<Card variant="filled" hoverable title="Related Article">
  Supporting content
</Card>
```

---

### 3. Elevated

**Visual Characteristics**:
- White background
- Medium shadow (md level) at rest
- **Gradient top border accent** (appears on hover)
- Dramatic lift on hover (6px translation)

**Use Case**: Featured content, CTAs, primary actions, hero cards

**Hover Behavior**:
```css
transform: translateY(-6px) scale(1.01);
box-shadow: var(--card-shadow-xl);
/* Gradient top border reveals */
::before { opacity: 1; }
```

**Example**:
```tsx
<Card variant="elevated" hoverable title="Featured Service">
  <p>Design System Lift-Off</p>
  <Button variant="primary">Learn More</Button>
</Card>
```

---

### 4. Glassmorphism (Advanced) 🆕

**Visual Characteristics**:
- Semi-transparent background (70% opacity)
- Backdrop blur (10px) with saturate filter
- Frosted glass effect
- Light border (30% white opacity)
- Inner highlight shadow

**Use Case**: Hero sections with background images, overlays, modern landing pages

**Implementation**:
```tsx
<Card
  variant="outlined"
  className="glass"  // Custom className
  hoverable
  title="Premium Feature"
>
  Content appears over background image
</Card>
```

**CSS**:
```css
.card.glass {
  background: rgb(255 255 255 / 0.7);
  backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgb(255 255 255 / 0.3);
}
```

**Dark Mode Support**:
```css
[data-theme="dark"] .card.glass {
  background: rgb(0 0 0 / 0.4);
  border-color: rgb(255 255 255 / 0.1);
}
```

---

## Micro-interactions

### Hover Animation (Spring Bounce)

**Easing Function**:
```css
cubic-bezier(0.34, 1.56, 0.64, 1)  /* Elastic overshoot */
```

**Duration**: 0.5s for transform, 0.3s for other properties

**Visual Effect**: Cards "bounce" slightly when scaling, creating a playful, responsive feel

---

### Active State (Pressed)

```css
.hoverable:active {
  transform: translateY(-1px) scale(0.99);
  transition-duration: 0.1s;
}
```

**Effect**: Immediate feedback when user clicks/taps

---

### Focus State (Keyboard Navigation)

**Enhanced Accessibility**:
```css
.card:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 4px;
  box-shadow:
    var(--card-shadow-lg),
    0 0 0 4px rgb(0 102 204 / 0.1);  /* Glow effect */
}
```

**Visibility**: 4px offset + subtle glow ensures visibility for keyboard users

---

## Typography Hierarchy

### Header

**Title**:
- Font: `var(--font-title)` (Satoshi)
- Size: Configurable via `titleProps.size` (S/M/L/XL)
- Weight: 700 (bold)
- Color: `var(--color-title)`

**Subtitle** (Eyebrow Text):
```css
.subTitle {
  font-size: 0.75rem;         /* Compact */
  font-weight: 600;           /* Semibold */
  letter-spacing: 0.04em;     /* Tracking */
  text-transform: uppercase;  /* All caps */
  color: var(--color-primary);
  margin-bottom: 0.5rem;      /* Spacing */
}
```

**Description**:
- Font: `var(--font-text)` (Satoshi)
- Size: Small (14px)
- Color: `var(--color-primary)` with 65% opacity

---

### Content

**Body Text**:
```css
.cardContent {
  line-height: var(--line-height-relaxed, 1.625);
  /* 65 characters max width for readability */
}
```

---

## Loading State

### Skeleton Animation

**Visual Design**:
```css
background: linear-gradient(
  90deg,
  rgb(0 0 0 / 0.04) 0%,
  rgb(0 0 0 / 0.08) 40%,   /* Highlight */
  rgb(0 0 0 / 0.04) 80%,
  rgb(0 0 0 / 0.04) 100%
);
background-size: 200% 100%;
animation: skeleton-shimmer 1.8s ease-in-out infinite;
```

**Effect**: Smooth shimmer from left to right, indicating content loading

---

## Layout & Spacing

### Internal Spacing Rhythm

```
┌─────────────────────────────────┐
│ Header (24px padding)           │ ← 1px border-bottom
├─────────────────────────────────┤
│ Content (24px padding)          │
│ (flex: 1 - fills available)     │
├─────────────────────────────────┤
│ Footer (24px padding)           │ ← 1px border-top
│ (subtle bg: rgb(0 0 0 / 0.01))  │
└─────────────────────────────────┘
```

### Size Variants

| Size | Padding | Max Width | Use Case |
|------|---------|-----------|----------|
| **S** | 16px | 320px | Compact cards, tight spaces |
| **M** | 24px | 480px | Default, balanced |
| **L** | 36px | 600px | Featured content, emphasis |
| **Full** | 24px | 100% | Full-width sections |

---

## Responsive Behavior

### Breakpoints

**Tablet (≤768px)**:
```css
.card {
  padding: var(--space-layout-24, 1.5rem);
}

.cardActions {
  flex-direction: column;  /* Stack buttons */
  align-items: stretch;
}
```

**Mobile (≤480px)**:
```css
.card {
  padding: var(--space-layout-16, 1rem);
}
```

---

## Accessibility Features

### ✅ WCAG 2.1 AA Compliance

1. **Keyboard Navigation**: Full support with visible focus states
2. **Screen Reader**: Proper ARIA labels and semantic HTML
3. **Color Contrast**: All text meets 4.5:1 minimum ratio
4. **Reduced Motion**: Respects `prefers-reduced-motion` preference
5. **Touch Targets**: Minimum 44×44px for interactive elements

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
  }
  .interactive:active {
    transform: none;
  }
}
```

---

## Usage Guidelines

### DO ✅

- Use **outlined** for most content cards
- Use **elevated** for featured/primary content
- Use **filled** for secondary/supporting information
- Enable `hoverable` for clickable cards
- Provide `linkLabel` for link cards (accessibility)
- Test with keyboard navigation
- Ensure images have alt text

### DON'T ❌

- Mix too many variants on one page (maintain hierarchy)
- Use elevated variant for every card (loses emphasis)
- Create cards without clear purpose
- Forget to test mobile responsive behavior
- Skip accessibility testing
- Use glassmorphism without background context

---

## Design Inspiration

This redesign draws from:

1. **Material Design 3** - Elevation system, tokens
2. **Glassmorphism Trend** - Frosted glass variant
3. **Micro-interaction Patterns** - Spring bounce, gradient overlays
4. **Digitaltableteur Brand** - Gradient accents, color palette

---

## Testing Checklist

Before deploying Card changes:

- [ ] Visual regression tests pass (Storybook snapshots)
- [ ] All variants render correctly
- [ ] Hover states work on desktop
- [ ] Touch interactions work on mobile
- [ ] Focus states visible for keyboard users
- [ ] Skeleton loading animates smoothly
- [ ] Reduced motion preference respected
- [ ] WCAG AA color contrast validated
- [ ] Screen reader announces content correctly
- [ ] Responsive breakpoints tested (320px, 768px, 1024px)

---

## Future Enhancements

Potential additions for v3.0:

1. **Parallax Tilt Effect**: Subtle 3D rotation on mouse move
2. **Animated Gradient Borders**: Moving rainbow border on hover
3. **Content Reveal**: Flip animation to show back of card
4. **Stacking Cards**: Multiple cards with depth offset
5. **Particle Effects**: Subtle particles on hover (luxury variant)

---

**Last Updated**: December 30, 2025
**Designer**: Claude (UI Design Skill)
**Approved By**: Digitaltableteur Design Team
