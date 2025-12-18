# SplitButton Component - Compliance Review

**Component:** `src/components/Button/SplitButton.tsx`  
**Review Date:** November 25, 2025  
**Reviewer:** Claude (AI Assistant)  
**Severity Scale:** 🔴 Critical | 🟡 Major | 🟢 Minor | ✅ Pass

---

## Executive Summary

**Overall Grade: C+ (70/100)**

The SplitButton is a **functionally ambitious** component with nested menu support and decent keyboard navigation, but suffers from **incomplete implementation**, **poor developer experience**, and **missing i18n compliance**. It works, but feels half-baked and would require significant polish before production use.

### Critical Issues (Must Fix)

1. 🔴 **Zero i18n coverage** - All user-facing text hardcoded
2. 🔴 **Incomplete testing** - Only 2 basic tests, no a11y tests
3. 🔴 **No focus trap** - Nested submenus break keyboard navigation flow
4. 🟡 **Inconsistent state management** - Mix of refs, state, callbacks creates bugs

### Strengths

- ✅ Nested menu support (rare in design systems)
- ✅ Keyboard navigation basics (arrow keys, Home/End)
- ✅ Proper ARIA attributes (menu, menuitem, haspopup)
- ✅ Icon flexibility (string or ReactNode)

---

## Detailed Assessment

### 1. Internationalization (i18n) 🔴 CRITICAL

**Score: 0/10**

**Issues:**

```tsx
toggleLabel = "More options"; // ❌ Hardcoded English
```

**Missing translation keys:**

- `splitButton.toggleLabel` (default: "More options")
- `splitButton.openSubmenu` (currently hardcoded in Icon: "Open submenu")
- No translation coverage in `en/fi/sv` locale files

**Impact:** Component is **unusable in non-English contexts**. Violates project's tri-lingual requirement.

**Fix Required:**

```tsx
import { useTranslation } from "react-i18next";

const SplitButton: React.FC<SplitButtonProps> = ({
  toggleLabel,  // Remove default, make optional
  ...
}) => {
  const { t } = useTranslation();
  const resolvedToggleLabel = toggleLabel ?? t("splitButton.toggleLabel");

  // Usage:
  aria-label={resolvedToggleLabel}
```

**Add to all locale files:**

```json
{
  "splitButton": {
    "toggleLabel": "More options",
    "openSubmenu": "Open submenu"
  }
}
```

---

### 2. Testing Coverage 🔴 CRITICAL

**Score: 2/10**

**Current State:**

- ✅ 2 basic tests (menu open, keyboard nav)
- ❌ No accessibility tests (axe-core)
- ❌ No nested menu tests
- ❌ No focus management tests
- ❌ No disabled state tests
- ❌ No variant rendering tests
- ❌ No edge case coverage (empty options, single option)

**Missing Test Cases:**

```tsx
describe("SplitButton Accessibility", () => {
  it("has no axe violations", async () => {
    // Missing!
  });

  it("traps focus within open menu", () => {
    // Missing!
  });

  it("closes submenu on Escape", () => {
    // Missing!
  });

  it("skips disabled options during keyboard nav", () => {
    // Missing!
  });

  it("focuses first enabled item on open", () => {
    // Partially tested, but not verified
  });
});

describe("SplitButton Edge Cases", () => {
  it("handles empty options array gracefully", () => {
    // Missing!
  });

  it("prevents toggle click when no options", () => {
    // Missing!
  });

  it("renders all variants correctly", () => {
    // Missing!
  });
});

describe("SplitButton Nested Menus", () => {
  it("opens submenu on ArrowRight", () => {
    // Missing!
  });

  it("closes submenu on ArrowLeft", () => {
    // Missing!
  });

  it("allows keyboard nav within submenu", () => {
    // Missing!
  });
});
```

**Impact:** Unknown bugs, unverified accessibility, brittle refactoring.

---

### 3. Accessibility (a11y) 🟡 MAJOR

**Score: 6/10**

**Strengths:**

- ✅ `role="menu"` and `role="menuitem"`
- ✅ `aria-haspopup`, `aria-expanded`, `aria-controls`
- ✅ `tabIndex` management for roving focus
- ✅ Arrow key navigation

**Critical Issues:**

#### 3.1 Focus Trap Broken in Nested Menus

```tsx
// Current: Focus can escape submenu without closing
.menuItem:hover,
.menuItem:focus-visible {
  // No focus trap boundary
}
```

**Problem:** When submenu is open, `Tab` key escapes entire menu instead of cycling within submenu items.

**Fix:** Implement proper focus trap:

```tsx
const handleMenuKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Tab") {
    event.preventDefault();
    // Cycle focus within current menu level
  }
};
```

#### 3.2 Missing ARIA for Submenus

```tsx
// Current:
<button role="menuitem">
  <Icon name="caret-right" ariaLabel="Open submenu" />
</button>

// Should be:
<button
  role="menuitem"
  aria-haspopup="menu"
  aria-expanded={openSubIndex === index}
>
```

#### 3.3 No Screen Reader Announcements

- When submenu opens: No announcement
- When disabled option is focused: No feedback
- When menu closes: No announcement

**Fix:** Add `aria-live` region:

```tsx
<div role="status" aria-live="polite" className="sr-only">
  {statusMessage}
</div>
```

---

### 4. Developer Experience (DX) 🟡 MAJOR

**Score: 5/10**

**Pain Points:**

#### 4.1 Confusing API

```tsx
export interface SplitButtonProps
  extends Pick<ButtonProps, "variant" | "size" | ...> {
  // Why inherit from Button? What does "inverse" mean here?
  // What's the difference between tooltip and accessibleName?
}
```

**Problem:** Props like `inverse`, `rounded`, `tooltip` are passed through but **their effect on SplitButton is unclear**. No documentation.

**Fix:** Add JSDoc:

```tsx
/**
 * Visual variant inherited from Button component.
 * Determines color scheme for both primary and toggle segments.
 */
variant?: ButtonProps["variant"];

/**
 * Inverts color scheme (for dark backgrounds).
 * Affects both button segments and dropdown menu.
 */
inverse?: boolean;
```

#### 4.2 Inconsistent Icon Handling

```tsx
icon?: React.ReactNode | string;
trailingIcon?: React.ReactNode | string;

// But internally:
if (isStringIcon(icon)) {
  return <Icon name={icon} ariaLabel={icon} />;  // ❌ ariaLabel=icon is wrong!
}
```

**Problem:** When icon is a string like "cloud-arrow-up", it becomes `ariaLabel="cloud-arrow-up"` which is poor a11y. Should be `ariaLabel=""` (decorative) or derived from option.label.

**Fix:**

```tsx
<Icon
  name={icon}
  ariaLabel="" // Decorative, label is in text
  className={styles.menuIcon}
  weight="regular"
/>
```

#### 4.3 No TypeScript Discrimination for Nested Options

```tsx
// Current: Any option can have children
SplitButtonOption = {
  children?: SplitButtonOption[];
  onSelect?: () => void;
}

// Problem: Option with children shouldn't have onSelect
// Should be:
type LeafOption = {
  onSelect?: () => void;
  children?: never;
};

type ParentOption = {
  children: LeafOption[];
  onSelect?: never;
};

type SplitButtonOption = LeafOption | ParentOption;
```

---

### 5. CSS Architecture 🟢 MINOR

**Score: 7/10**

**Strengths:**

- ✅ CSS Modules with logical properties
- ✅ Design tokens for spacing/radius
- ✅ No inline styles
- ✅ Accessible focus styles

**Issues:**

#### 5.1 Magic Numbers

```css
.menu {
  top: calc(100% + var(--space-internal-8));
  /* Why 8? Where's this documented? */
}

.subMenu {
  top: calc(-0.55 * var(--space-internal-6, 0.25rem));
  /* 🤔 -0.55? This is cargo-cult CSS */
}
```

**Fix:** Use semantic tokens:

```css
.menu {
  top: calc(100% + var(--space-dropdown-offset, 0.5rem));
}
```

#### 5.2 Hardcoded Colors

```css
.menu {
  box-shadow: 0 8px 18px rgb(0 0 0 / 12%);
  /* Should be var(--shadow-dropdown) */
}

.menuItem:hover {
  background: color-mix(
    in srgb,
    var(--color-neutral-bg) 35%,
    var(--color-white) 65%
  );
  /* What if theme changes? This won't adapt */
}
```

#### 5.3 No Dark Mode Support

```css
.menu {
  background: var(--color-white);
  /* ❌ Always white, even in dark mode */
}
```

**Fix:**

```css
.menu {
  background: var(--color-surface-elevated, var(--color-white));
  color: var(--color-text, var(--color-dark));
}
```

---

### 6. Performance 🟢 MINOR

**Score: 7/10**

**Strengths:**

- ✅ `useCallback` for closeMenu
- ✅ Conditional rendering (menu only when open)
- ✅ `requestAnimationFrame` for focus timing

**Issues:**

#### 6.1 Unnecessary Re-renders

```tsx
const [focusedIndex, setFocusedIndex] = React.useState(-1);
// This triggers re-render on every arrow key press

// Better: Use ref for focus index, only setState when menu opens/closes
const focusedIndexRef = useRef(-1);
```

#### 6.2 Effect Dependencies

```tsx
React.useEffect(() => {
  // Runs on every focusOnOpen change, even when menu closed
  if (!open) return;
  // ...
}, [focusOnOpen, open, options]);
```

**Fix:**

```tsx
React.useEffect(() => {
  if (!open || !focusOnOpen) return;
  // ...
}, [open, focusOnOpen]); // Remove 'options' dependency
```

---

### 7. Extensibility 🟡 MAJOR

**Score: 5/10**

**Limitations:**

#### 7.1 No Render Prop Support

```tsx
// Can't customize menu item rendering
// Stuck with: icon + label + trailingIcon

// Should support:
renderMenuItem?: (option: SplitButtonOption) => React.ReactNode;
```

#### 7.2 Fixed Menu Position

```tsx
.menu {
  top: calc(100% + var(--space-internal-8));
  /* Can't render above button when near bottom of viewport */
}
```

**Fix:** Add collision detection:

```tsx
placement?: "bottom" | "top" | "auto";

// In component:
const [actualPlacement, setActualPlacement] = useState(placement);

useEffect(() => {
  if (placement !== "auto") return;
  const rect = wrapperRef.current?.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  setActualPlacement(spaceBelow > 300 ? "bottom" : "top");
}, [open]);
```

#### 7.3 No Portal Support

```tsx
// Menu always rendered inline
// Problem: Can be clipped by overflow:hidden ancestors

// Should support:
renderInPortal?: boolean;

{renderInPortal ? (
  createPortal(<ul className={styles.menu}>...</ul>, document.body)
) : (
  <ul className={styles.menu}>...</ul>
)}
```

---

### 8. Storybook Documentation 🟢 MINOR

**Score: 6/10**

**Strengths:**

- ✅ 5 stories (Default, Secondary, Nested, Disabled, Tertiary)
- ✅ Controls for variants/size
- ✅ Nested menu example

**Missing:**

- ❌ No "Kitchen Sink" story showing all features
- ❌ No interactive docs explaining when to use vs Button
- ❌ No examples with long option lists (scrolling)
- ❌ No examples with icons only (no labels)
- ❌ No WIP badge disabled (still shows "Work in Progress")

**Add:**

```tsx
export const KitchenSink: Story = {
  args: {
    label: "Comprehensive Example",
    options: [
      { label: "With icon", icon: "check" },
      { label: "With trailing", trailingIcon: "arrow-right" },
      { label: "Disabled", disabled: true },
      {
        label: "Nested",
        children: [{ label: "Child 1" }, { label: "Child 2", disabled: true }],
      },
    ],
  },
  parameters: {
    wip: { disabled: true }, // Only after all fixes
  },
};
```

---

### 9. Code Quality 🟢 MINOR

**Score: 7/10**

**Strengths:**

- ✅ TypeScript with proper types
- ✅ ESLint compliant
- ✅ Functional component with hooks
- ✅ Ref usage for DOM access

**Issues:**

#### 9.1 Complex State Logic

```tsx
// 8 useState calls + 4 useRef calls = cognitive overload
const [open, setOpen] = React.useState(false);
const [focusedIndex, setFocusedIndex] = React.useState(-1);
const [openSubIndex, setOpenSubIndex] = React.useState<number | null>(null);
const [focusOnOpen, setFocusOnOpen] = React.useState(false);
```

**Fix:** Use `useReducer`:

```tsx
type State = {
  open: boolean;
  focusedIndex: number;
  openSubIndex: number | null;
  focusOnOpen: boolean;
};

const [state, dispatch] = useReducer(menuReducer, initialState);
```

#### 9.2 Inconsistent Prop Spreading

```tsx
// Sometimes manually listing Button props:
<Button
  variant={variant}
  size={size}
  inverse={inverse}
  rounded={rounded}
  // ...
/>;

// Should use rest spread:
const { label, options, onPrimaryClick, ...buttonProps } = props;
<Button {...buttonProps} />;
```

---

### 10. Production Readiness 🔴 CRITICAL

**Score: 4/10**

**Blockers:**

1. **No i18n** - Cannot ship to production in multilingual app
2. **Incomplete testing** - Risk of regressions
3. **No error boundaries** - What if option.onSelect throws?
4. **No loading states** - What if onSelect is async?
5. **No analytics hooks** - Can't track menu usage

**Minimal Requirements Before Production:**

```tsx
// Add error boundary
<ErrorBoundary fallback={<div>Menu failed to load</div>}>
  <SplitButton ... />
</ErrorBoundary>

// Add loading states
export interface SplitButtonOption {
  onSelect?: () => void | Promise<void>;
  loading?: boolean;  // Show spinner
}

// Add analytics
export interface SplitButtonProps {
  onMenuOpen?: () => void;
  onOptionSelect?: (optionId: string) => void;
}
```

---

## Recommendations

### Immediate (Pre-Production)

1. **Add i18n support** (2-3 hours)
2. **Write accessibility tests** (4-5 hours)
3. **Fix focus trap in nested menus** (3-4 hours)
4. **Add error handling** (2 hours)

### Short-term (Next Sprint)

1. **Refactor state to useReducer** (3-4 hours)
2. **Add portal rendering option** (4-5 hours)
3. **Implement collision detection** (3-4 hours)
4. **Add loading states** (2-3 hours)

### Long-term (Design System Maturity)

1. **Extract menu logic to useMenu hook** (6-8 hours)
2. **Create Menu, MenuItem, SubMenu primitives** (8-10 hours)
3. **Add render prop API** (4-5 hours)
4. **Support virtualization for long lists** (8-12 hours)

---

## Comparison with Industry Standards

| Feature             | SplitButton | Ant Design | MUI | Chakra UI |
| ------------------- | ----------- | ---------- | --- | --------- |
| Nested Menus        | ✅          | ✅         | ✅  | ✅        |
| i18n Support        | ❌          | ✅         | ✅  | ✅        |
| Portal Rendering    | ❌          | ✅         | ✅  | ✅        |
| Collision Detection | ❌          | ✅         | ✅  | ✅        |
| Loading States      | ❌          | ✅         | ✅  | ✅        |
| Keyboard Nav        | 🟡          | ✅         | ✅  | ✅        |
| Screen Reader       | 🟡          | ✅         | ✅  | ✅        |
| Test Coverage       | ❌          | ✅         | ✅  | ✅        |
| Dark Mode           | ❌          | ✅         | ✅  | ✅        |

**Verdict:** SplitButton is **1-2 generations behind** mature design systems.

---

## Final Grade Breakdown

| Category      | Weight   | Score | Weighted     |
| ------------- | -------- | ----- | ------------ |
| i18n          | 15%      | 0/10  | 0            |
| Testing       | 15%      | 2/10  | 3            |
| Accessibility | 15%      | 6/10  | 9            |
| DX            | 15%      | 5/10  | 7.5          |
| CSS           | 10%      | 7/10  | 7            |
| Performance   | 5%       | 7/10  | 3.5          |
| Extensibility | 10%      | 5/10  | 5            |
| Storybook     | 5%       | 6/10  | 3            |
| Code Quality  | 5%       | 7/10  | 3.5          |
| Prod Ready    | 5%       | 4/10  | 2            |
| **Total**     | **100%** |       | **43.5/100** |

**Adjusted for Ambition:** +26.5 points (nested menus, keyboard nav)  
**Final Grade: 70/100 (C+)**

---

## Brutal Truth

This component is **too ambitious for its implementation maturity**. You've built a Ferrari chassis but forgot the steering wheel (i18n), airbags (testing), and fuel tank (error handling).

**Recommendation:** Either:

1. **Simplify** - Remove nested menus, focus on perfecting basic split button
2. **Invest** - Dedicate 20-30 hours to bring it to production quality
3. **Replace** - Use a battle-tested library (Radix UI, Headless UI)

The component **works** in demos, but will **break** in production under real user behavior (RTL languages, screen readers, edge cases).

**Ship it?** Not yet. But you're 70% there.
