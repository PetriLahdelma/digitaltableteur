# Badge Component Enhancement Proposal

**Date**: November 26, 2025  
**Current Status**: Badge component is 100% compliant with LLM Component Generation Rules  
**Reference**: [Ant Design Badge Documentation](https://ant.design/components/badge)

## Executive Summary

After reviewing Ant Design's Badge API, I recommend implementing **3 high-value features** that align with digitaltableteur's design system and significantly expand Badge use cases while maintaining 100% compliance.

## Current Badge Capabilities

✅ **Already Implemented:**

- Semantic state variants (success, info, error, warning, neutral)
- Size variants (s, m, l)
- Primary/secondary design variants
- Icon support with automatic semantic icons
- Removable functionality
- Square/rounded variants
- Full accessibility (role="status", aria-label)
- 100% design token coverage

## Recommended Enhancements

### 🟢 HIGH PRIORITY: Count/Overflow Badge

**Use Case**: Notification counts (messages, alerts, shopping cart items)

**Ant Design API Reference:**

```tsx
<Badge count={5}>
  <Avatar />
</Badge>

<Badge count={100} overflowCount={99}>  // Shows "99+"
  <Avatar />
</Badge>
```

**Proposed digitaltableteur API:**

```tsx
interface BadgeProps {
  // ... existing props
  count?: number;
  overflowCount?: number; // default: 99
  showZero?: boolean; // default: false
}

// Usage
<Badge count={5} design="primary" state="error">
  <Icon name="bell" />
</Badge>;
```

**Implementation Notes:**

- When `count` prop is provided, display number instead of children
- Use `overflowCount` to show "99+" style formatting
- Apply existing state colors to count badges
- Position absolutely when wrapping another component (offset: top-right corner)
- Use `--font-size-text-s` for count text
- Maintain accessibility: `aria-label="5 notifications"`

**Design Token Alignment:**

- Text size: `--font-size-text-xs` (may need to add this token)
- Spacing: `--space-internal-2` for padding
- Position offset: `-0.5rem` (could tokenize as `--badge-offset`)

**Testing Requirements:**

- Count rendering
- Overflow behavior (99 shows "99", 100 shows "99+")
- showZero functionality
- Zero count hidden by default
- Accessibility: count announced to screen readers
- Translation: overflow format ("99+", "99+" in all languages)

**Estimated Effort**: Medium (1-2 hours)

---

### 🟢 HIGH PRIORITY: Dot Mode

**Use Case**: Minimal status indicators (online/offline, has updates, presence)

**Ant Design API Reference:**

```tsx
<Badge dot>
  <Icon name="bell" />
</Badge>
```

**Proposed digitaltableteur API:**

```tsx
interface BadgeProps {
  // ... existing props
  dot?: boolean;
}

// Usage
<Badge dot state="success">
  <Avatar />
</Badge>;
```

**Implementation Notes:**

- When `dot={true}`, render a small circle (8px diameter)
- No children text displayed
- Position absolutely when wrapping (top-right corner by default)
- Inherits state colors
- Can stand alone or wrap components

**Design Token Alignment:**

- Size: `--space-layout-2` (8px) for width/height
- No text, so only color tokens needed
- Position: same offset system as count badges

**Testing Requirements:**

- Dot rendering (standalone and wrapping)
- State color application
- Positioning
- Accessibility: aria-label required when no text

**Estimated Effort**: Low (30-45 minutes)

---

### 🟡 MEDIUM PRIORITY: Offset Positioning

**Use Case**: Fine-tune badge position when wrapping components

**Ant Design API Reference:**

```tsx
<Badge count={5} offset={[10, 10]}>
  <Avatar />
</Badge>
```

**Proposed digitaltableteur API:**

```tsx
interface BadgeProps {
  // ... existing props
  offset?: [number, number]; // [x, y] in pixels
}

// Usage
<Badge count={5} offset={[5, -5]}>
  <Icon name="bell" size="large" />
</Badge>;
```

**Implementation Notes:**

- Apply CSS transform when offset provided: `transform: translate(${x}px, ${y}px)`
- Only meaningful when badge wraps another component
- Default position: `{ top: 0, right: 0 }`

**Design Token Alignment:**

- Could add preset offset tokens: `--badge-offset-sm`, `--badge-offset-md`
- Or allow custom pixel values (less token-pure, but more flexible)

**Testing Requirements:**

- Default positioning
- Custom offset application
- Negative values (moving inward)
- Positive values (moving outward)

**Estimated Effort**: Low (30 minutes)

---

## NOT RECOMMENDED (For Now)

### ❌ Badge.Ribbon Subcomponent

**Reason**: Significantly different UI pattern (corner ribbon vs inline badge). Would require separate component (`Ribbon`) to maintain single responsibility. Consider as future separate component if use case emerges.

### ❌ Custom Color Prop

**Reason**: Conflicts with design system token approach. We have semantic states (success/error/warning) which should cover all use cases. Adding arbitrary colors breaks token discipline.

### ❌ Status Text Prop

**Reason**: Ant Design's `status` prop with text label is redundant with our existing `children` + `state` combination. No additional value.

---

## Implementation Roadmap

### Phase 1: Count Badges (Week 1)

1. Add `count`, `overflowCount`, `showZero` props to BadgeProps interface
2. Implement count rendering logic in Badge.tsx
3. Add absolute positioning CSS for wrapped components
4. Create overflow formatting logic
5. Add 15+ tests for count scenarios
6. Add Storybook stories: CountBasic, CountOverflow, CountZero
7. Update compliance card (should remain 100%)

### Phase 2: Dot Mode (Week 1)

1. Add `dot` prop to BadgeProps interface
2. Implement dot rendering (small circle, no text)
3. Reuse positioning system from count badges
4. Add 8+ tests for dot scenarios
5. Add Storybook stories: DotStandalone, DotWrapping, DotStates
6. Update documentation

### Phase 3: Offset Positioning (Week 2)

1. Add `offset` prop to BadgeProps interface
2. Implement CSS transform logic
3. Add 6+ tests for offset scenarios
4. Add Storybook story: CustomPositioning
5. Document offset system in stories

---

## Design System Considerations

### New Tokens Needed?

**Option A: Add Minimal Tokens (Recommended)**

```css
/* In variables.css */
--font-size-text-xs: clamp(
  0.625rem,
  0.5rem + 0.25vw,
  0.75rem
); /* 10px-12px for counts */
--badge-offset-default: -0.5rem;
--badge-dot-size: 0.5rem; /* 8px */
```

**Option B: Use Existing Tokens Only**

- Count text: `--font-size-text-s` (slightly larger but acceptable)
- Dot size: `--space-layout-2`
- Offset: hardcoded `-0.5rem` (not ideal but pragmatic)

**Recommendation**: Option A - add 3 new tokens to maintain design system purity.

---

## Accessibility Impact

### Count Badges

- Add `aria-label` with localized count: "5 notifications", "99+ messages"
- Keep `role="status"` for live announcements
- Translation keys needed: `badge.countLabel`, `badge.countOverflow`

### Dot Badges

- Require `aria-label` when no text: "Has updates", "Online", "3 unread"
- Dot alone is not screen-reader accessible
- Must document this requirement in component API

### Offset Positioning

- No accessibility impact (visual only)
- Ensure sufficient contrast regardless of position

---

## Testing Strategy

### Unit Tests Additions

- **Count Badges**: 15 tests
  - Renders count number
  - Renders overflow (99+)
  - showZero shows 0
  - Default hides 0
  - Negative numbers handled gracefully
  - Large numbers overflow correctly
  - Accessibility: aria-label with count
- **Dot Mode**: 8 tests
  - Renders dot element
  - Applies state colors
  - Standalone dot
  - Wrapping component
  - Accessibility: requires aria-label
- **Offset**: 6 tests
  - Default position
  - Custom x offset
  - Custom y offset
  - Negative offsets
  - Combined with count
  - Combined with dot

### Visual Regression

- Add snapshots for all new stories
- Verify positioning across different wrapping components
- Test overflow text rendering

---

## Translation Requirements

### New Keys Needed (All 3 Languages: en, fi, sv)

```json
{
  "badge": {
    // Existing keys...
    "countLabel": "{count} items",
    "countOverflow": "{overflowCount}+",
    "dotIndicator": "Status indicator",
    "noContent": "Badge requires content or count"
  }
}
```

**Finnish:**

```json
{
  "badge": {
    "countLabel": "{count} kohdetta",
    "countOverflow": "{overflowCount}+",
    "dotIndicator": "Tilanilmaisin",
    "noContent": "Badge vaatii sisällön tai lukumäärän"
  }
}
```

**Swedish:**

```json
{
  "badge": {
    "countLabel": "{count} objekt",
    "countOverflow": "{overflowCount}+",
    "dotIndicator": "Statusindikator",
    "noContent": "Badge kräver innehåll eller antal"
  }
}
```

---

## Migration Path for Existing Usage

**No Breaking Changes**: All new props are optional. Existing Badge usage continues to work unchanged.

**Backwards Compatibility:**

```tsx
// Old usage - still works
<Badge design="primary" state="success">Active</Badge>

// New usage - additive
<Badge count={5} state="error">
  <Icon name="bell" />
</Badge>
```

---

## Conclusion

Implementing **count/overflow badges** and **dot mode** would expand Badge from a status indicator to a comprehensive notification system, covering:

- Message counts (chat, email)
- Shopping cart quantities
- Notification counters
- Online/offline presence dots
- Update indicators

These align perfectly with real-world UI patterns while maintaining 100% compliance with LLM Component Generation Rules through careful design token integration and accessibility standards.

**Next Steps:**

1. User approval of proposed enhancements
2. Add new design tokens to variables.css
3. Implement Phase 1 (count badges)
4. Implement Phase 2 (dot mode)
5. Implement Phase 3 (offset positioning)
6. Update documentation and examples

---

**Questions for Review:**

1. Approve implementation of count/overflow badges?
2. Approve implementation of dot mode?
3. Should offset positioning be included or deferred?
4. Any additional use cases to consider?
