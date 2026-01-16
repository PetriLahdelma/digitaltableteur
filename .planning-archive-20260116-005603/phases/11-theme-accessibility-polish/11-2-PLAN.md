# Phase 11-2: Accessibility Testing & Polish

> **Phase**: 11 (Theme & Accessibility Polish)
> **Plan**: 2 of 2
> **Tasks**: 12

---

## Objective

Ensure all components meet WCAG 2.1 AA standards through comprehensive accessibility testing, keyboard navigation verification, and screen reader compatibility. Add component-level a11y tests where missing.

---

## Context

### Current State
- Page-level a11y tests exist: `app/__tests__/accessibility-pages.test.tsx` (45 tests)
- Only 1 component has dedicated a11y tests: `Card/Card.a11y.test.tsx`
- SkipLink implemented and functional
- ARIA patterns validated (100% compliance per docs)
- 24 components have `:focus` or `:focus-visible` styles
- 100% WCAG 2.1 Level AA compliance documented (Dec 2025)

### Known Gaps (from exploration)
1. **Missing component a11y tests**: Button, TextInput, Select, Checkbox, Switch, Dialog
2. **Badge uses `role="status"` unconditionally** - causes screen reader noise
3. **Designerman component has tabindex=0 but no keyboard interaction**
4. **No arrow key navigation in dropdown menus** (best practice, not required)
5. **Modal `inert` attribute not used** - potential focus escape to iframes

### Existing Test Infrastructure
- `jest-axe` integrated with Vitest
- Page-level tests cover axe-core violations, heading hierarchy, color contrast
- Testing Library available for component tests
- `vitest.setup.ts` has ResizeObserver, IntersectionObserver, matchMedia mocks

### Dependencies
- Phase 11-1: Focus states must be complete before testing

---

## Tasks

### Task 1: Create A11y Test Template
**Files**: `nextjs-app/shared/components/__templates__/Component.a11y.test.template.tsx`

Create reusable template for component a11y tests:
- axe-core violation testing
- Keyboard interaction testing
- ARIA attributes validation
- Focus management testing

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, it, expect } from "vitest";

describe("ComponentName Accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<Component />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("is keyboard accessible", async () => {
    const user = userEvent.setup();
    render(<Component />);
    await user.tab();
    expect(screen.getByRole("...")).toHaveFocus();
  });

  it("has correct ARIA attributes", () => {
    render(<Component />);
    expect(screen.getByRole("...")).toHaveAttribute("aria-...");
  });
});
```

**Verification**: Template can be copied for new component tests

---

### Task 2: Add Button Accessibility Tests
**Files**: `nextjs-app/shared/components/Button/Button.a11y.test.tsx`

Test Button component accessibility:
- All variants pass axe-core
- Keyboard activation (Enter and Space)
- `aria-disabled` state handling
- `aria-busy` during loading state
- Icon-only buttons have `aria-label`
- Focus visible in all themes

```tsx
describe("Button Accessibility", () => {
  it("can be activated with Enter key", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalled();
  });

  it("icon button has accessible name", () => {
    render(<IconButton aria-label="Close" icon={X} />);
    expect(screen.getByRole("button")).toHaveAccessibleName("Close");
  });
});
```

**Verification**: All Button a11y tests pass

---

### Task 3: Add Form Component Accessibility Tests
**Files**: Multiple a11y test files

Create a11y tests for form components:
- `TextInput/TextInput.a11y.test.tsx`
- `TextArea/TextArea.a11y.test.tsx`
- `Checkbox/Checkbox.a11y.test.tsx`
- `Switch/Switch.a11y.test.tsx`

Test patterns:
- Labels properly associated (`aria-labelledby` or `<label for>`)
- Error states with `aria-invalid` and `aria-describedby`
- Required fields with `aria-required`
- Disabled state with `aria-disabled`
- Keyboard focus and interaction

```tsx
describe("TextInput Accessibility", () => {
  it("associates label with input", () => {
    render(<TextInput label="Email" name="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("indicates error state accessibly", () => {
    render(<TextInput label="Email" error="Invalid email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });
});
```

**Verification**: All form a11y tests pass

---

### Task 4: Add Dialog/Modal Accessibility Tests
**Files**: `nextjs-app/shared/components/Dialog/Dialog.a11y.test.tsx`, `Modal.a11y.test.tsx`

Test modal accessibility:
- Focus trap works correctly
- `role="dialog"` or `role="alertdialog"` present
- `aria-labelledby` references title
- `aria-describedby` references description (if present)
- Escape key closes dialog
- Focus returns to trigger on close
- Background has `aria-hidden` when modal open

```tsx
describe("Dialog Accessibility", () => {
  it("traps focus within dialog", async () => {
    render(<Dialog open><input /><button>Close</button></Dialog>);
    await userEvent.tab();
    expect(screen.getByRole("textbox")).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("textbox")).toHaveFocus(); // cycles back
  });

  it("returns focus on close", async () => {
    const trigger = screen.getByRole("button", { name: "Open" });
    // ... open dialog, close it
    expect(trigger).toHaveFocus();
  });
});
```

**Verification**: Dialog/Modal a11y tests pass

---

### Task 5: Fix Badge Role Conditionally
**Files**: `nextjs-app/shared/components/Badge/Badge.tsx`, `Badge.module.css`

Fix unconditional `role="status"`:
- Add `role` prop to Badge component
- Default to no role for static badges
- Use `role="status"` only for dynamic content (counts, updates)
- Document when to use which

```tsx
interface BadgeProps {
  role?: "status" | "none";  // Add role prop
  // ...
}

function Badge({ role, children, ...props }: BadgeProps) {
  return (
    <span
      role={role === "status" ? "status" : undefined}
      aria-live={role === "status" ? "polite" : undefined}
      {...props}
    >
      {children}
    </span>
  );
}
```

**Verification**: Screen reader doesn't announce static badges, does announce dynamic ones

---

### Task 6: Add Arrow Key Navigation to Dropdown Menus
**Files**: `Avatar/Avatar.tsx` menu, any other dropdown components

Enhance keyboard navigation for dropdown menus:
- Arrow Down: Move focus to next item
- Arrow Up: Move focus to previous item
- Home: Move focus to first item
- End: Move focus to last item
- Type-ahead: Focus item starting with typed character

Use roving tabindex pattern:
```tsx
const [focusedIndex, setFocusedIndex] = useState(0);

function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, items.length - 1));
      break;
    case "ArrowUp":
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
      break;
    case "Home":
      e.preventDefault();
      setFocusedIndex(0);
      break;
    case "End":
      e.preventDefault();
      setFocusedIndex(items.length - 1);
      break;
  }
}
```

**Verification**: Can navigate Avatar menu with arrow keys

---

### Task 7: Fix Designerman Component Keyboard Interaction
**Files**: `nextjs-app/shared/components/Designerman/Designerman.tsx`

Fix the tabindex issue:
- Option A: Add keyboard interaction handler (Enter/Space activates)
- Option B: Remove tabindex=0 if purely decorative
- If interactive, ensure screen reader announces what it does

```tsx
// If it should be interactive:
<div
  role="button"
  tabIndex={0}
  aria-label="Interact with Designerman character"
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleInteraction();
    }
  }}
/>

// If purely decorative:
<div aria-hidden="true" /* no tabIndex */ />
```

**Verification**: Designerman either responds to keyboard or is not in tab order

---

### Task 8: Add `inert` Attribute to Modal Background
**Files**: `nextjs-app/shared/components/Modal/Modal.tsx`, `Dialog.tsx`

Prevent focus escape from modals:
- Add `inert` attribute to page content when modal is open
- Use React portal to render modal outside main content
- Fallback for browsers without `inert` support

```tsx
// In modal open logic
useEffect(() => {
  if (isOpen) {
    document.getElementById("main-content")?.setAttribute("inert", "");
  } else {
    document.getElementById("main-content")?.removeAttribute("inert");
  }
}, [isOpen]);
```

**Verification**: Cannot tab to elements behind open modal

---

### Task 9: Test Keyboard Navigation Site-Wide
**Files**: Create `app/__tests__/keyboard-navigation.test.tsx`

Comprehensive keyboard navigation tests:
- Tab through entire homepage
- Tab through entire contact form
- Test skip link functionality
- Test mobile menu keyboard access
- Verify no keyboard traps

```tsx
describe("Site-wide Keyboard Navigation", () => {
  it("can navigate homepage entirely by keyboard", async () => {
    render(<HomePage />);
    const focusableElements = getAllFocusable(document.body);

    for (let i = 0; i < focusableElements.length; i++) {
      await userEvent.tab();
      expect(focusableElements[i]).toHaveFocus();
    }
  });

  it("skip link works correctly", async () => {
    render(<HomePage />);
    await userEvent.tab();
    expect(screen.getByText("Skip to content")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(document.getElementById("main-content")).toHaveFocus();
  });
});
```

**Verification**: Full keyboard navigation test suite passes

---

### Task 10: Run axe-core on All New Phase 7-10 Pages
**Files**: Update `app/__tests__/accessibility-pages.test.tsx`

Extend page-level tests to cover new pages from Phases 7-10:
- `WorkIndexPage` (from Phase 08)
- `ProjectDetailPage` templates (Phase 08)
- `ContactPage` (updated in Phase 09)
- `BlogIndexPage` (Phase 10)
- `BlogArticlePage` (Phase 10)

Test all three languages (EN/FI/SV) for each page.

**Verification**: All page-level a11y tests pass

---

### Task 11: Create Accessibility Audit Report
**Files**: `docs/ACCESSIBILITY_PHASE11_REPORT.md`

Document Phase 11 accessibility work:
- List all components with new a11y tests
- Document focus state additions
- Note any remaining WCAG violations (should be 0)
- Provide before/after test coverage stats
- Include keyboard navigation verification results

**Verification**: Report is comprehensive and accurate

---

### Task 12: Screen Reader Testing Checklist
**Files**: `docs/SCREEN_READER_TESTING.md`

Create manual testing checklist for screen readers:
- VoiceOver (macOS) test steps
- NVDA (Windows) test steps
- Key user flows to test:
  - Homepage navigation
  - Contact form submission
  - Blog article reading
  - Theme switching
  - Language switching
- Common issues to watch for

**Verification**: Checklist can be used by any team member for manual testing

---

## Success Criteria

- [ ] A11y test template created
- [ ] Button has comprehensive a11y tests
- [ ] Form components have a11y tests (TextInput, TextArea, Checkbox, Switch)
- [ ] Dialog/Modal has a11y tests with focus trap verification
- [ ] Badge role is conditional (not always "status")
- [ ] Dropdown menus have arrow key navigation
- [ ] Designerman keyboard issue resolved
- [ ] Modal uses `inert` to prevent focus escape
- [ ] Site-wide keyboard navigation tests pass
- [ ] All new pages from Phase 7-10 pass axe-core
- [ ] Accessibility audit report created
- [ ] Screen reader testing checklist created

---

## Output

```
components/
  __templates__/
    Component.a11y.test.template.tsx (new)
  Button/
    Button.a11y.test.tsx (new)
  TextInput/
    TextInput.a11y.test.tsx (new)
  TextArea/
    TextArea.a11y.test.tsx (new)
  Checkbox/
    Checkbox.a11y.test.tsx (new)
  Switch/
    Switch.a11y.test.tsx (new)
  Dialog/
    Dialog.a11y.test.tsx (new)
  Modal/
    Modal.tsx (inert attribute)
    Modal.a11y.test.tsx (new)
  Badge/
    Badge.tsx (conditional role)
  Avatar/
    Avatar.tsx (arrow key nav)
  Designerman/
    Designerman.tsx (keyboard fix)

tests/
  app/__tests__/
    keyboard-navigation.test.tsx (new)
    accessibility-pages.test.tsx (updated)

docs/
  ACCESSIBILITY_PHASE11_REPORT.md (new)
  SCREEN_READER_TESTING.md (new)
```

---

## Notes

- **WCAG 2.4.7 Focus Visible (AA)**: All interactive elements must have visible focus
- **WCAG 2.1.1 Keyboard (A)**: All functionality must be keyboard accessible
- **WCAG 4.1.2 Name, Role, Value (A)**: All components must expose proper semantics
- **Test with real assistive tech** when possible - automated tests catch ~30% of issues
- **Arrow key navigation is best practice**, not WCAG requirement
- **`inert` attribute has good browser support** (93%+ as of 2025)

---

*Created: 2026-01-14*
