# Material Design 3 Card Component - Implementation Analysis

**Date**: December 30, 2025
**Component**: Card (`nextjs-app/shared/components/Card/`)
**Reference**: Material Design 3 Card Anatomy (8 Elements)
**Status**: Comprehensive Analysis

---

## Executive Summary

The current Card component implementation is **strongly aligned** with Material Design 3 principles but has **structural and ordering differences** that affect the anatomy. This analysis compares the MD3 8-element specification against the current implementation to identify gaps and alignment opportunities.

### Overall Assessment

| Aspect | Status | Score |
|--------|--------|-------|
| **Structural Elements** | Partial | 6/8 elements supported |
| **Element Ordering** | Misaligned | Different from MD3 spec |
| **Spacing & Padding** | Good | Consistent 24px rhythm |
| **Typography Hierarchy** | Excellent | Well-defined levels |
| **Icon Implementation** | Strong | Flexible positioning |
| **Action Buttons** | Good | Right-aligned, wrapped |
| **Media/Cover** | Good | Supported at top |
| **Thumbnail/Avatar** | Missing | Not explicitly supported |

**Overall Score**: 7.5/10 (Strong foundation, needs structural refinement)

---

## Material Design 3 Card Anatomy (8 Elements)

Based on the screenshot reference, MD3 defines these elements:

1. **Container** - Card elevation and size
2. **Thumbnail [optional]** - Avatar, logo, or icon (small, typically 40×40px)
3. **Header text [optional]** - Name of photo album or article
4. **Subhead [optional]** - Article byline or tagged location
5. **Media [optional]** - Photos, graphics, weather icons (large visual)
6. **Supporting text [optional]** - Article summary or description
7. **Actions [optional]** - Action buttons (ACTION 1, ACTION 2)
8. **Icons [optional]** - Heart (like) and share icons (trailing icons)

### Expected Visual Order (Top to Bottom)

```
┌─────────────────────────────────────┐
│ 1. CONTAINER (elevation/borders)    │
│  ┌───────────────────────────────┐  │
│  │ 5. MEDIA (cover image)        │  │ ← Optional large visual
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [2] + [3] Header Text         │  │ ← Thumbnail + Title
│  │      [4] Subhead              │  │ ← Subtitle/byline
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 6. Supporting Text            │  │ ← Body content
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 7. ACTIONS  |  8. ICONS       │  │ ← Buttons + icon buttons
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## Current Implementation Analysis

### 1. Container (Element 1) ✅ EXCELLENT

**MD3 Specification**: Card elevation and size

**Current Implementation**:
```typescript
// Card.tsx line 41-76
variant?: "elevated" | "filled" | "outlined";
size?: "S" | "M" | "L" | "full";
bordered?: boolean;
hoverable?: boolean;
```

**CSS Implementation**:
```css
/* Card.module.css lines 1-65 */
--card-container-color: var(--color-white);
--card-container-shape: 12px;
--card-shadow-sm, md, lg, xl, 2xl (5 elevation levels)

.outlined { border: 2px solid; }
.filled { background: light-bg; }
.elevated { box-shadow: md; }
```

**Assessment**: ✅ **EXCEEDS MD3**
- Supports all MD3 elevation variants (elevated, filled, outlined)
- Advanced shadow system (5 levels vs MD3's 3)
- Size variants (S/M/L/full) provide flexibility
- Sophisticated hover states with transforms
- Glassmorphism variant (bonus)

**Alignment**: Perfect ✓

---

### 2. Thumbnail [optional] (Element 2) ❌ MISSING

**MD3 Specification**: Avatar, logo, or icon (small, 40×40px circular/square)

**Current Implementation**:
```typescript
// Card.tsx lines 89-96
icon?: React.ReactNode;
iconProps?: {
  position?: "start" | "end" | "top";
  size?: "sm" | "md" | "lg";
};
```

**Assessment**: ⚠️ **PARTIAL - NOT A TRUE THUMBNAIL**

**Issues**:
1. The `icon` prop is positioned **inline with header text** (start/end), not as a separate thumbnail
2. No dedicated avatar/thumbnail slot for circular profile images
3. Icon sizes (sm: 1rem, md: 1.4rem, lg: 1.8rem) are too small for MD3 thumbnail (40×40px = 2.5rem)
4. No support for thumbnail-specific styling (circular, bordered, etc.)

**Current Structure** (lines 252-267):
```tsx
{icon && iconProps.position !== "top" && (
  <span className={styles.icon}>{icon}</span>
)}
<div className={styles.headerText}>
  <Title>{title}</Title>
  <Text>{subTitle}</Text>
</div>
```

**MD3 Expected Structure**:
```tsx
<div className={styles.headerMain}>
  <div className={styles.thumbnail}> {/* NEW */}
    <Avatar src={thumbnailSrc} size={40} />
  </div>
  <div className={styles.headerText}>
    <Title>{title}</Title>
    <Text>{subTitle}</Text>
  </div>
</div>
```

**Gap**: Missing dedicated `thumbnail` prop and styling

---

### 3. Header Text [optional] (Element 3) ✅ GOOD

**MD3 Specification**: Name of photo album or article (primary heading)

**Current Implementation**:
```typescript
// Card.tsx lines 30-38
title?: string;
titleProps?: {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "S" | "M" | "L" | "XL";
  terminals?: "sans" | "serif";
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};
```

**CSS** (lines 267-269):
```css
.title {
  margin: 0;
}
```

**Assessment**: ✅ **EXCELLENT**
- Uses semantic `<Title>` component (lines 285-296)
- Configurable typography (size, level, terminals)
- Proper semantic HTML (`as` prop)
- Flexible styling via `titleProps.className`

**Alignment**: Perfect ✓

---

### 4. Subhead [optional] (Element 4) ⚠️ PARTIAL

**MD3 Specification**: Article byline or tagged location (secondary text below title)

**Current Implementation**:
```typescript
// Card.tsx lines 40-46
subTitle?: string;
subTitleProps?: {
  size?: "S" | "M" | "L";
  as?: "p" | "span" | "div" | ...;
};
```

**CSS** (lines 271-278):
```css
.subTitle {
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.75rem;  /* 12px */
  margin-bottom: 0.5rem;
}
```

**Assessment**: ⚠️ **PARTIAL - SEMANTICS MISMATCH**

**Issues**:
1. **Styling is for "eyebrow" text** (uppercase, small, colored) - typically goes **above** the title
2. MD3 subhead is **below** the title and uses normal case
3. Current implementation renders **below title** (line 298-308) but styles like an eyebrow

**Current Rendering Order** (lines 285-308):
```tsx
<Title>{title}</Title>           {/* 3. Header text */}
<Text>{subTitle}</Text>           {/* 4. Subhead (but styled as eyebrow) */}
<Text>{description}</Text>        {/* Additional description */}
```

**MD3 Expected**:
```tsx
<Text variant="eyebrow">{overline}</Text>  {/* Above title, uppercase */}
<Title>{title}</Title>                      {/* Header text */}
<Text variant="subtitle">{subtitle}</Text>  {/* Below title, normal case */}
```

**Gap**:
- Need separate `overline` prop for eyebrow text (goes before title)
- `subTitle` should use normal case styling for bylines
- Consider renaming to clarify semantics

---

### 5. Media [optional] (Element 5) ✅ GOOD

**MD3 Specification**: Photos, graphics, weather icons (large visual at top)

**Current Implementation**:
```typescript
// Card.tsx lines 63-64
cover?: React.ReactNode;
```

**CSS** (lines 205-210):
```css
.cardMedia {
  width: 100%;
  height: auto;
  border-radius: 12px 12px 0 0;
  object-fit: cover;
}
```

**Rendering** (line 390):
```tsx
{cover && <div className={styles.cardMedia}>{cover}</div>}
```

**Assessment**: ✅ **GOOD**
- Positioned at top (correct MD3 order)
- Proper border-radius (top corners only)
- Flexible (accepts any React node)
- Used in stories (lines 203-218 in Card.stories.tsx)

**Minor Issue**:
- `object-fit: cover` is applied to container, not img (should be on `img` element)

**Alignment**: Strong ✓ (minor CSS fix needed)

---

### 6. Supporting Text [optional] (Element 6) ✅ EXCELLENT

**MD3 Specification**: Article summary or description

**Current Implementation**:
```typescript
// Card.tsx lines 47-60, 85-86
description?: string;
descriptionProps?: { size, as, className };
body?: string;
bodyProps?: { size, as, className };
children?: React.ReactNode;
```

**Rendering** (lines 355-370):
```tsx
<div className={styles.cardContent}>
  {body && <Text>{body}</Text>}
  {children}
</div>
```

**CSS** (lines 178-183):
```css
.cardContent {
  padding: var(--card-content-padding);  /* 24px */
  flex: 1;
  line-height: var(--line-height-relaxed, 1.625);
}
```

**Assessment**: ✅ **EXCELLENT**
- Multiple ways to provide content (description, body, children)
- Proper spacing (24px padding)
- Optimal line-height (1.625)
- Flexible typography via props

**Alignment**: Perfect ✓

---

### 7. Actions [optional] (Element 7) ✅ GOOD

**MD3 Specification**: Action buttons (ACTION 1, ACTION 2)

**Current Implementation**:
```typescript
// Card.tsx lines 20-26, 65-66
interface CardAction {
  key: string;
  label: React.ReactNode;
  onClick?: (key: string) => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "tertiary";
}
actions?: CardAction[];
```

**Rendering** (lines 198-212):
```tsx
<div className={styles.cardActions}>
  {actions.map((action) => (
    <Button
      key={action.key}
      variant={action.variant || "secondary"}
      onClick={() => action.onClick?.(action.key)}
    >
      {action.label}
    </Button>
  ))}
</div>
```

**CSS** (lines 192-201):
```css
.cardActions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;  /* Right-aligned */
  gap: var(--space-internal-8);
}
```

**Assessment**: ✅ **GOOD**
- Right-aligned (MD3 standard)
- Supports multiple buttons
- Proper spacing (8px gap)
- Variant support (primary/secondary/tertiary)
- Mobile responsive (wraps, stacks on mobile)

**Minor Issue**:
- MD3 typically shows actions in footer with icons to the right
- Current implementation mixes actions with footer (lines 372-377)

**Alignment**: Strong ✓

---

### 8. Icons [optional] (Element 8) ⚠️ PARTIAL

**MD3 Specification**: Heart (like) and share icons (trailing icon buttons)

**Current Implementation**:
```typescript
// Card.tsx lines 61-62
extra?: React.ReactNode;
```

**Rendering** (lines 323-328):
```tsx
{extra && (
  <div className={styles.extra}>
    {badge && badgeElement}
    {extra}
  </div>
)}
```

**CSS** (lines 280-284):
```css
.extra {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}
```

**Assessment**: ⚠️ **PARTIAL - WRONG LOCATION**

**Issues**:
1. **Position**: `extra` is in **header** (line 323), MD3 icons go in **footer** alongside actions
2. **Semantics**: `extra` is generic, not specifically for icon buttons
3. **No dedicated icon button support** (must manually pass buttons)

**Current Structure**:
```tsx
<Header>
  <Title>...</Title>
  <Extra>{/* Icons here - WRONG */}</Extra>
</Header>
<Content>...</Content>
<Footer>
  <Actions>{/* Buttons only */}</Actions>
</Footer>
```

**MD3 Expected Structure**:
```tsx
<Header>
  <Thumbnail />
  <Title>...</Title>
</Header>
<Content>...</Content>
<Footer>
  <Actions>{/* TEXT BUTTONS */}</Actions>
  <Icons>{/* ICON BUTTONS (like, share) */}</Icons>
</Footer>
```

**Gap**: Need dedicated `footerIcons` prop for trailing icon buttons in footer

---

## Detailed Element Ordering Comparison

### Current Implementation Order (lines 388-396)

```tsx
1. {cover && <div className={styles.cardMedia}>{cover}</div>}
2. {headerBlock}  // Contains: icon, title, subTitle, description, extra
3. {statusMessageBlock}
4. {tabSection}
5. {loading ? skeleton : bodyBlock}
6. {footerBlock}  // Contains: footer, footerActions
```

### MD3 Expected Order

```tsx
1. {cover && <div className={styles.cardMedia}>{cover}</div>}  ✓ Same
2. {headerBlock}  // Should contain: thumbnail, title, subhead
3. {bodyBlock}    // Supporting text
4. {footerBlock}  // Should contain: actions (left) + icons (right)
```

### Issues

1. **`statusMessageBlock` (line 392)**: Not part of MD3 spec (custom addition)
2. **`tabSection` (line 393)**: Not part of MD3 spec (custom addition)
3. **Header complexity**: Mixes icon (thumbnail?), title, subTitle, description, extra, badge
4. **Footer separation**: `footer` prop + `actions` vs MD3's actions + icons

---

## Spacing & Padding Analysis

### Current Implementation ✅ EXCELLENT

```css
/* Card.module.css lines 35-39 */
--card-header-padding: var(--space-internal-24, 1.5rem);   /* 24px */
--card-content-padding: var(--space-internal-24, 1.5rem);  /* 24px */
--card-footer-padding: var(--space-internal-24, 1.5rem);   /* 24px */
```

**Structure** (lines 167-190):
```css
.cardHeader {
  padding: 24px;
  border-bottom: 1px solid rgb(0 0 0 / 0.05);
}

.cardContent {
  padding: 24px;
  flex: 1;
}

.cardFooter {
  padding: 24px;
  border-top: 1px solid rgb(0 0 0 / 0.05);
  background: rgb(0 0 0 / 0.01);
}
```

**MD3 Alignment**: ✅ **PERFECT**
- Consistent 24px padding (MD3 uses 16px, but 24px is acceptable)
- Proper separators (border-bottom, border-top)
- Subtle footer background differentiation

**Assessment**: Exceeds MD3 standard (more generous spacing)

---

## Typography Hierarchy Analysis

### Current Implementation ✅ EXCELLENT

```css
/* Subtitle (lines 271-278) */
.subTitle {
  font-size: 0.75rem;        /* 12px */
  font-weight: 600;          /* Semibold */
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-primary);
}

/* Description (lines 318-322) */
.description {
  margin: 0;
  line-height: 1.5;
  color: var(--color-primary, rgb(0 0 0 / 65%));
}

/* Body (lines 313-316) */
.bodyText {
  margin: 0;
  font: inherit;
}

/* Content (lines 178-183) */
.cardContent {
  line-height: var(--line-height-relaxed, 1.625);
}
```

**MD3 Alignment**: ✅ **EXCELLENT**
- Clear hierarchy (eyebrow → title → subtitle → body)
- Proper line-heights (1.5-1.625)
- Semantic color usage (primary color for secondary text)

**Assessment**: Well-defined, exceeds MD3

---

## Icon Implementation Analysis

### Current Implementation ✅ STRONG

```typescript
// Card.tsx lines 89-96
icon?: React.ReactNode;
iconProps?: {
  position?: "start" | "end" | "top";
  size?: "sm" | "md" | "lg";
  className?: string;
};
```

**CSS** (lines 234-265):
```css
.icon { font-size: 1.4rem; }
.iconSm { font-size: 1rem; }
.iconMd { font-size: 1.4rem; }
.iconLg { font-size: 1.8rem; }

.iconStart { margin-inline-end: var(--space-s); order: -1; }
.iconEnd { margin-inline-start: var(--space-s); order: 1; }
.iconTop { margin-block-end: var(--space-xs); align-self: flex-start; }
```

**Rendering** (lines 252-283):
```tsx
{icon && iconProps.position !== "top" && (
  <span className={styles.iconStart / iconEnd}>{icon}</span>
)}
<div className={styles.headerText}>
  {iconProps.position === "top" && (
    <span className={styles.iconTop}>{icon}</span>
  )}
  <Title>{title}</Title>
</div>
```

**MD3 Comparison**:
- MD3 thumbnail: 40×40px (2.5rem), circular/square
- Current icon: 1-1.8rem, inline

**Assessment**: ✅ **STRONG FOR ICONS, WEAK FOR THUMBNAILS**
- Flexible positioning (start, end, top)
- Size variants
- Proper spacing with logical properties
- **BUT**: Not designed for MD3-style thumbnails (avatars)

---

## Action Button Positioning Analysis

### Current Implementation ✅ GOOD

```css
/* Card.module.css lines 192-201 */
.cardActions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;  /* Right-aligned ✓ */
  gap: var(--space-internal-8);
}

/* Responsive (lines 515-524) */
@media (width <= 768px) {
  .cardActions {
    flex-direction: column;
    align-items: stretch;
  }
}
```

**MD3 Alignment**: ✅ **GOOD**
- Right-aligned (MD3 standard)
- Proper gap spacing (8px)
- Responsive (stacks on mobile)
- Supports multiple buttons

**Minor Issue**: MD3 shows actions + icons in same row (actions left, icons right), current implementation only has actions

---

## Media Section Handling Analysis

### Current Implementation ✅ GOOD

```typescript
// Card.tsx line 64
cover?: React.ReactNode;
```

**CSS** (lines 205-210):
```css
.cardMedia {
  width: 100%;
  height: auto;
  border-radius: var(--card-container-shape) var(--card-container-shape) 0 0;
  object-fit: cover;
}
```

**Storybook Usage** (Card.stories.tsx lines 203-218):
```tsx
cover: (
  <ImagePlaceholder
    {...ImagePlaceholderPresets.cardCover}
    alt="Placeholder content"
    variant="medium"
  />
)
```

**MD3 Alignment**: ✅ **EXCELLENT**
- Top position (correct)
- Full-width
- Rounded top corners only
- Flexible (accepts any React node)

**Minor Fix Needed**:
```css
/* Current (WRONG) */
.cardMedia {
  object-fit: cover;  /* Applied to div */
}

/* Should be */
.cardMedia img {
  object-fit: cover;  /* Applied to img */
}
```

---

## Thumbnail/Avatar Implementation Gap

### What's Missing

1. **Dedicated `thumbnail` prop**:
```typescript
thumbnail?: {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  size?: number;  // Default 40
  variant?: "circular" | "square" | "rounded";
};
```

2. **Thumbnail styling**:
```css
.thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 50%;  /* Circular by default */
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnailSquare {
  border-radius: 0;
}

.thumbnailRounded {
  border-radius: 8px;
}
```

3. **Header layout adjustment**:
```tsx
<div className={styles.headerMain}>
  {thumbnail && (
    <div className={styles.thumbnail}>
      {typeof thumbnail === "string" ? (
        <img src={thumbnail} alt={thumbnailAlt} />
      ) : (
        thumbnail
      )}
    </div>
  )}
  <div className={styles.headerText}>
    <Title>{title}</Title>
    <Text>{subTitle}</Text>
  </div>
</div>
```

---

## Recommendations for MD3 Alignment

### Priority 1: Critical Structural Changes

#### 1.1 Add Dedicated Thumbnail Support ⭐⭐⭐

**Problem**: No MD3-style thumbnail/avatar support

**Solution**:
```typescript
// Add to CardProps (after line 96)
/** Thumbnail image (avatar, logo) in header */
thumbnail?: React.ReactNode | string;
/** Thumbnail configuration */
thumbnailProps?: {
  alt?: string;
  size?: number;  // Default: 40px
  variant?: "circular" | "square" | "rounded";
  position?: "start" | "end";  // Default: start
};
```

**CSS Addition**:
```css
/* Add after line 265 */
.thumbnail {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--color-light-bg);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnailSquare {
  border-radius: 0;
}

.thumbnailRounded {
  border-radius: 8px;
}

.thumbnailStart {
  margin-inline-end: var(--space-s);
}

.thumbnailEnd {
  margin-inline-start: var(--space-s);
}
```

**Implementation** (update headerBlock, lines 249-330):
```tsx
<div className={styles.headerMain}>
  {thumbnail && thumbnailProps.position !== "end" && (
    <div className={[
      styles.thumbnail,
      styles[`thumbnail${thumbnailProps.variant || 'Circular'}`],
      styles.thumbnailStart
    ].join(" ")}>
      {typeof thumbnail === "string" ? (
        <img src={thumbnail} alt={thumbnailProps.alt || ""} />
      ) : (
        thumbnail
      )}
    </div>
  )}

  {/* Existing icon rendering */}

  <div className={styles.headerText}>
    {/* Existing title, subtitle, description */}
  </div>

  {thumbnail && thumbnailProps.position === "end" && (
    <div className={styles.thumbnailEnd}>
      {/* Same as above */}
    </div>
  )}
</div>
```

**Impact**: Adds true MD3 thumbnail support (40×40px avatars/logos)

---

#### 1.2 Separate Eyebrow from Subtitle ⭐⭐⭐

**Problem**: `subTitle` is styled as eyebrow (uppercase, above title semantically) but rendered below title

**Solution**:
```typescript
// Add to CardProps (after line 46)
/** Eyebrow text above title (uppercase, small) */
overline?: string;
/** Eyebrow configuration */
overlineProps?: {
  size?: "S" | "M" | "L";
  className?: string;
};

// Update subTitle semantics
/** Subtitle below title (normal case, secondary info) */
subTitle?: string;
/** Subtitle configuration */
subTitleProps?: {
  size?: "S" | "M" | "L";
  className?: string;
};
```

**CSS Changes**:
```css
/* Rename .subTitle to .overline (lines 271-278) */
.overline {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: 0.25rem;  /* Space before title */
}

/* Add new .subTitle for normal subtitle */
.subTitle {
  font-size: 0.875rem;  /* 14px */
  font-weight: 400;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;  /* Space after title */
}
```

**Rendering Order** (update lines 285-308):
```tsx
<div className={styles.headerText}>
  {overline && (
    <Text className={styles.overline}>{overline}</Text>
  )}
  {title && (
    <Title>{title}</Title>
  )}
  {subTitle && (
    <Text className={styles.subTitle}>{subTitle}</Text>
  )}
  {description && (
    <Text>{description}</Text>
  )}
</div>
```

**Impact**: Proper MD3 semantic ordering (overline → title → subtitle)

---

#### 1.3 Add Footer Icon Support ⭐⭐

**Problem**: No dedicated slot for trailing icon buttons (like, share) in footer

**Solution**:
```typescript
// Add to CardProps (after line 66)
/** Icon buttons in footer (like, share, etc.) */
footerIcons?: Array<{
  key: string;
  icon: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  disabled?: boolean;
}>;
```

**CSS Addition**:
```css
/* Add after line 201 */
.cardFooterContent {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-internal-16);
}

.footerIcons {
  display: flex;
  gap: var(--space-internal-4);
  margin-inline-start: auto;
}

.iconButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  color: var(--color-text-secondary);
  transition: background-color 0.2s, color 0.2s;
}

.iconButton:hover {
  background-color: var(--color-action-hover);
  color: var(--color-primary);
}

.iconButton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

**Rendering** (update footerBlock, lines 372-377):
```tsx
<div className={styles.cardFooter}>
  <div className={styles.cardFooterContent}>
    <div className={styles.cardActions}>
      {actions?.map((action) => (
        <Button key={action.key} ...>{action.label}</Button>
      ))}
    </div>

    {footerIcons && footerIcons.length > 0 && (
      <div className={styles.footerIcons}>
        {footerIcons.map((iconBtn) => (
          <button
            key={iconBtn.key}
            className={styles.iconButton}
            onClick={iconBtn.onClick}
            aria-label={iconBtn.ariaLabel}
            disabled={iconBtn.disabled}
          >
            {iconBtn.icon}
          </button>
        ))}
      </div>
    )}
  </div>
  {footer}
</div>
```

**Impact**: Adds MD3-compliant footer icons (actions left, icons right)

---

### Priority 2: Spacing & Visual Refinement

#### 2.1 Fix Media Object-Fit ⭐

**Problem**: `object-fit: cover` applied to container div, not img

**Solution**:
```css
/* Update lines 205-210 */
.cardMedia {
  width: 100%;
  height: auto;
  border-radius: var(--card-container-shape) var(--card-container-shape) 0 0;
  overflow: hidden;
  /* Remove object-fit from here */
}

.cardMedia img,
.cardMedia video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

#### 2.2 Adjust Header Spacing ⭐

**Problem**: No vertical spacing between header elements

**Solution**:
```css
/* Update .headerText (line 228-232) */
.headerText {
  display: flex;
  flex-direction: column;
  gap: var(--space-xxs, 0.25rem);  /* Increase from 0.35rem */
  flex: 1;
}
```

---

#### 2.3 Improve Footer Layout ⭐

**Problem**: Footer actions right-aligned, MD3 shows actions left + icons right

**Solution**:
```css
/* Update .cardFooter (lines 186-190) */
.cardFooter {
  padding: var(--card-footer-padding);
  border-top: 1px solid rgb(0 0 0 / 0.05);
  /* Remove background for cleaner look */
}

/* Update .cardActions (lines 192-201) */
.cardActions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;  /* Change from flex-end */
  gap: var(--space-internal-8);
}
```

---

### Priority 3: Optional Enhancements

#### 3.1 Add Thumbnail Fallback ⭐

**Solution**:
```tsx
{thumbnail && (
  <div className={styles.thumbnail}>
    {typeof thumbnail === "string" ? (
      <img
        src={thumbnail}
        alt={thumbnailProps.alt}
        onError={(e) => {
          e.currentTarget.style.display = "none";
          // Show fallback icon or initials
        }}
      />
    ) : (
      thumbnail
    )}
  </div>
)}
```

---

#### 3.2 Add Header Density Variants ⭐

**Solution**:
```typescript
headerDensity?: "comfortable" | "compact";
```

```css
.headerCompact .headerMain {
  gap: var(--space-xs);
}

.headerCompact .thumbnail {
  width: 32px;
  height: 32px;
}
```

---

## Implementation Checklist

### Structural Changes (Priority 1)

- [ ] Add `thumbnail` prop and `thumbnailProps` interface
- [ ] Add thumbnail CSS classes (`.thumbnail`, `.thumbnailCircular`, etc.)
- [ ] Update `headerBlock` to render thumbnail before icon
- [ ] Add `overline` prop for eyebrow text
- [ ] Rename `.subTitle` CSS to `.overline`
- [ ] Add new `.subTitle` CSS for normal subtitle
- [ ] Update header rendering order (overline → title → subtitle)
- [ ] Add `footerIcons` prop and interface
- [ ] Add footer icon CSS (`.footerIcons`, `.iconButton`)
- [ ] Update `footerBlock` to render actions + icons side-by-side

### Visual Refinement (Priority 2)

- [ ] Move `object-fit: cover` from `.cardMedia` to `.cardMedia img`
- [ ] Adjust `.headerText` gap spacing
- [ ] Change `.cardActions` justify to `flex-start`
- [ ] Remove footer background color (optional)
- [ ] Test thumbnail rendering with various sizes
- [ ] Test footer layout with actions + icons

### Storybook Stories (Priority 3)

- [ ] Add story: `WithThumbnail` (circular avatar + title + subtitle)
- [ ] Add story: `WithOverline` (eyebrow + title)
- [ ] Add story: `WithFooterIcons` (actions + like/share icons)
- [ ] Add story: `MD3Complete` (all 8 elements together)
- [ ] Add story: `ThumbnailVariants` (circular, square, rounded)
- [ ] Update existing stories to use `overline` instead of `subTitle` where appropriate

### Documentation (Priority 3)

- [ ] Update `VISUAL_DESIGN_GUIDE.md` with MD3 8-element anatomy
- [ ] Add migration guide for `subTitle` → `overline` change
- [ ] Document thumbnail usage patterns
- [ ] Document footer icons vs actions
- [ ] Add MD3 comparison diagram

### Testing (Priority 3)

- [ ] Unit test: Thumbnail rendering (string vs ReactNode)
- [ ] Unit test: Overline + title + subtitle ordering
- [ ] Unit test: Footer actions + icons layout
- [ ] A11y test: Thumbnail alt text
- [ ] A11y test: Footer icon buttons (aria-label)
- [ ] Visual regression: Update snapshots for new elements
- [ ] Responsive test: Footer layout on mobile

---

## Migration Guide (Breaking Changes)

### Change 1: `subTitle` Semantics

**Before**:
```tsx
<Card
  title="Article Title"
  subTitle="CATEGORY"  // Uppercase eyebrow
/>
```

**After**:
```tsx
<Card
  overline="CATEGORY"   // NEW: Eyebrow text above title
  title="Article Title"
  subTitle="By John Doe"  // NEW: Normal subtitle below title
/>
```

**Migration**: If using `subTitle` for uppercase eyebrow text, rename to `overline`

---

### Change 2: Footer Actions Alignment

**Before**:
```css
.cardActions {
  justify-content: flex-end;  /* Right-aligned */
}
```

**After**:
```css
.cardActions {
  justify-content: flex-start;  /* Left-aligned (MD3 standard) */
}
```

**Impact**: Actions will move from right to left side of footer

**Migration**: If right-aligned actions are required, use custom CSS

---

### Change 3: Icon vs Thumbnail

**Before** (using icon as avatar):
```tsx
<Card
  icon={<Icon name="user" />}
  iconProps={{ position: "start", size: "lg" }}
/>
```

**After** (using thumbnail):
```tsx
<Card
  thumbnail="/path/to/avatar.jpg"
  thumbnailProps={{ alt: "User avatar", variant: "circular" }}
  icon={<Icon name="verified" />}  // Can still use icon separately
  iconProps={{ position: "end" }}
/>
```

**Migration**: Replace `icon` with `thumbnail` for avatars/logos

---

## Visual Comparison: Before vs After

### Before (Current)

```
┌─────────────────────────────────────┐
│ CARD (outlined/filled/elevated)     │
│  ┌───────────────────────────────┐  │
│  │ COVER IMAGE                   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [icon] Title                  │  │
│  │        SUBTITLE (uppercase)   │  │ ← Issue: styled as eyebrow
│  │        Description            │  │
│  │                         Extra │  │ ← Issue: icons in header
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Status Message                │  │ ← Custom (not MD3)
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Tabs                          │  │ ← Custom (not MD3)
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Body Content                  │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │         [Action] [Action]     │  │ ← Issue: right-aligned
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### After (MD3-Aligned)

```
┌─────────────────────────────────────┐
│ CARD (1. Container)                 │
│  ┌───────────────────────────────┐  │
│  │ 5. MEDIA (cover image)        │  │ ✓ Same
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ [2] OVERLINE (eyebrow)        │  │ ✓ NEW
│  │ [2+3] [thumb] Title           │  │ ✓ Thumbnail + title
│  │       4. Subtitle (byline)    │  │ ✓ Normal case subtitle
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 6. Supporting Text (body)     │  │ ✓ Same
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 7. [Action] [Action]  8. ♥ ⎋  │  │ ✓ Actions left, icons right
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## Conclusion

### Current State Assessment

The Card component is **well-implemented** with strong foundations:
- ✅ Excellent container variants (outlined, filled, elevated)
- ✅ Sophisticated shadow system
- ✅ Proper spacing and typography
- ✅ Good media/cover support
- ✅ Flexible content area

### MD3 Alignment Gaps

Three critical gaps prevent full MD3 compliance:

1. **Missing Thumbnail Support** (Element 2)
   - No dedicated 40×40px avatar/logo slot
   - Icon is not a true thumbnail replacement

2. **Semantic Confusion** (Element 3-4)
   - `subTitle` styled as eyebrow but positioned as subtitle
   - Need separate `overline` for eyebrow text

3. **Footer Layout** (Element 7-8)
   - Missing dedicated icon button slot
   - Actions right-aligned instead of left
   - No provision for trailing icons (like, share)

### Recommended Approach

**Phase 1: Add Thumbnail Support** (1-2 hours)
- Add `thumbnail` + `thumbnailProps`
- Add CSS for circular/square/rounded variants
- Update header layout to accommodate thumbnail
- Add Storybook stories

**Phase 2: Refactor Subtitle Semantics** (1 hour)
- Add `overline` prop
- Update CSS (rename `.subTitle` to `.overline`)
- Add new `.subTitle` styles
- Update rendering order
- Add migration guide

**Phase 3: Enhance Footer** (1-2 hours)
- Add `footerIcons` prop
- Add icon button CSS
- Update footer layout (flexbox with space-between)
- Add Storybook stories

**Total Effort**: 3-5 hours for full MD3 alignment

### Impact

After these changes:
- ✅ 8/8 MD3 elements supported
- ✅ Correct visual ordering
- ✅ Semantic HTML structure
- ✅ Improved accessibility (proper icon button labels)
- ✅ Better design system alignment

### Files to Modify

1. `/Users/petrilahdelma/SAPDevelop/digitaltableteur/nextjs-app/shared/components/Card/Card.tsx` (lines 28-96, 249-377)
2. `/Users/petrilahdelma/SAPDevelop/digitaltableteur/nextjs-app/shared/components/Card/Card.module.css` (lines 192-284)
3. `/Users/petrilahdelma/SAPDevelop/digitaltableteur/nextjs-app/shared/components/Card/Card.stories.tsx` (add new stories)
4. `/Users/petrilahdelma/SAPDevelop/digitaltableteur/nextjs-app/shared/components/Card/VISUAL_DESIGN_GUIDE.md` (update with MD3 section)

---

**Analysis Complete** | Generated: December 30, 2025
