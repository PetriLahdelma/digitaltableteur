# Design System API Review - Component Prop Interface Analysis

**Date**: 2025-12-30
**Scope**: 24 components in `nextjs-app/shared/components/`
**Goal**: Improve DX, UX, maintainability, and accessibility through consistent prop APIs

---

## Executive Summary

- **24 components analyzed** with complete schema.json coverage and TypeScript interfaces
- **6 major inconsistency categories** identified across event handlers, boolean props, accessibility, sizing, and state naming
- **Critical issue**: Select component has BOTH `onChange` and `onValueChange` props (conflicting APIs)
- **Recommended**: Standardize on camelCase event handlers, `is-` prefix for boolean state, native HTML attributes for ARIA
- **Migration impact**: ~50-70 prop renames across 7 high-priority components

---

## 1. Use-Case Maps

### 1.1 Button Component

| Use Case | Props Used | Pattern | Files |
|----------|-----------|---------|-------|
| Primary CTA | `variant="primary"`, `size="l"`, `children` | Prominence for main actions | HomePage.tsx, ContactForm.tsx |
| Navigation link | `href="/path"`, `variant="secondary"`, `icon` | Polymorphic button-as-link | HomePage.tsx, NotFound.tsx |
| Form submit | `type="submit"`, `disabled={isSubmitting}`, `loading` | Async operation feedback | ContactForm.tsx, SecureCVDownload.tsx |
| Icon-only action | `icon`, `aria-label`, `variant="tertiary"` | Compact UI controls | NextWorkNav.tsx |
| Destructive action | `variant="error"` OR `variant="secondaryError"` | Warning for dangerous operations | (Inferred from schema) |

**Complexity Score**: ⭐⭐⭐⭐ (4/5) - Polymorphic with 9 variants, 3 sizes, icon support, loading states

---

### 1.2 Input Component

| Use Case | Props Used | Pattern | Files |
|----------|-----------|---------|-------|
| Text input with validation | `type="text"`, `value`, `onChange`, `error`, `required` | Standard form field | ContactForm.tsx (fullName, company) |
| Email validation | `type="email"`, `value`, `onChange`, `error` | Built-in browser validation | ContactForm.tsx, NewsletterWaitlist.tsx |
| Password entry | `type="password"`, `autoFocus`, `disabled`, `onKeyPress` | Secure input with keyboard shortcuts | SecureCVDownload.tsx |
| Helper text guidance | `helperText`, `label` | Contextual help | (Inferred from schema) |

**Complexity Score**: ⭐⭐⭐ (3/5) - Custom `onChange` signature, error handling, validation integration

---

### 1.3 Select Component

| Use Case | Props Used | Pattern | Files |
|----------|-----------|---------|-------|
| Dropdown with native options | `label`, `value`, `onValueChange`, `children` (option elements) | Native select with custom wrapper | ContactForm.tsx |
| Disabled state | `disabled` | Prevents interaction during loading | (Inferred from schema) |

**Complexity Score**: ⭐⭐ (2/5) - Simple wrapper, **BUT** has API confusion with dual onChange handlers

**⚠️ CRITICAL**: Has BOTH `onChange` and `onValueChange` in schema - conflicting signatures!

---

### 1.4 Modal Component

| Use Case | Props Used | Pattern | Files |
|----------|-----------|---------|-------|
| Error notification | `isOpen`, `variant="error"`, `title`, `onClose` | Semantic error dialog | ContactForm.tsx |
| Confirmation dialog | `isOpen`, `title`, `footer` (with action buttons), `showCloseIcon` | User decision point | SecureCVDownload.tsx |
| Complex form | `isOpen`, `title`, `footer`, custom content in children | Multi-step interactions | CookieConsent.tsx |
| Info announcement | `variant="info"`, `titleSize="S"` | Non-blocking notifications | SecureCVDownload.tsx |

**Complexity Score**: ⭐⭐⭐⭐ (4/5) - 6 variants, nested title/footer config, icon support, accessibility features

---

### 1.5 Card Component

| Use Case | Props Used | Pattern | Files |
|----------|-----------|---------|-------|
| Content grid | `title`, `titleProps`, `size="M"`, `children` | Consistent layout for feature cards | HomePage.tsx |
| Tabbed content | `tabs`, `activeTabKey`, `onTabChange`, `variant="underline"` | In-card navigation | (Internal Card.tsx usage) |
| Action footer | `actions` array with `{ key, label, onClick, variant }` | Multiple CTAs in footer | (Internal Card.tsx usage) |
| Interactive card | `link`, `hoverable`, `onClick` | Entire card as clickable element | (Inferred from schema) |

**Complexity Score**: ⭐⭐⭐⭐⭐ (5/5) - **Most complex API** with 40+ props, nested config objects, multiple sub-features

---

### 1.6 Tabs Component

| Use Case | Props Used | Pattern | Files |
|----------|-----------|---------|-------|
| Controlled tabs | `tabs`, `activeTabKey`, `onTabChange` | Parent controls active tab | Card.tsx |
| Styled variants | `variant="underline"`, `size` matched to parent | Visual consistency | Card.tsx |

**Complexity Score**: ⭐⭐ (2/5) - Simple controlled component pattern

---

### 1.7 Toast Component

| Use Case | Props Used | Pattern | Files |
|----------|-----------|---------|-------|
| Success notification | `message`, `open`, `onClose`, `duration=5000` | Temporary feedback after actions | ContactForm.tsx, SocialShare.tsx |
| Copy confirmation | `message="Copied!"`, `open`, `onClose` | Brief status update | CodeSnippet.tsx |

**Complexity Score**: ⭐ (1/5) - Simplest API with 4 props

---

### 1.8 Checkbox Component

| Use Case | Props Used | Pattern | Files |
|----------|-----------|---------|-------|
| Form field | `label`, `checked`, `onCheckedChange`, `showLabel` | Boolean input with custom handler | (Inferred from schema) |
| Tri-state | `indeterminate`, `checked`, `onCheckedChange` | Partial selection (e.g., select all) | (Inferred from schema) |

**Complexity Score**: ⭐⭐ (2/5) - Custom handler signature, indeterminate support

---

### 1.9 Switch Component

| Use Case | Props Used | Pattern | Files |
|----------|-----------|---------|-------|
| Toggle setting | `checked`, `onCheckedChange`, `label`, `labelPlacement` | On/off preference | (Inferred from schema) |
| Loading state | `loading`, `disabled` | Async state update feedback | (Inferred from schema) |

**Complexity Score**: ⭐⭐ (2/5) - Similar to Checkbox, adds label positioning

---

### 1.10 CodeSnippet Component

| Use Case | Props Used | Pattern | Files |
|----------|-----------|---------|-------|
| Multi-line code block | `code`, `language="json"`, `variant="multi"`, `showLineNumbers`, `allowCopy` | Documentation examples | 25 .stories.tsx files |
| Truncated preview | `maxLines={20}`, variant="multi"` | Progressive disclosure | All updated .stories.tsx files |
| Copy callback | `onCopy`, `allowCopy` | Track user interactions | (Inferred from schema) |

**Complexity Score**: ⭐⭐⭐ (3/5) - Syntax highlighting, line numbers, truncation, copy features

---

## 2. Current API Issues

### 🔴 CRITICAL (Breaking Changes Required)

1. **Select: Dual onChange handlers** - Has BOTH `onChange` and `onValueChange` props
   - **Impact**: API confusion, unclear which to use, potential duplicate calls
   - **Evidence**: `Select.tsx` interface lines 10-11
   - **Fix**: Remove `onChange`, keep only `onValueChange` for consistency with Checkbox/Switch

2. **ARIA attribute inconsistency** - Mixed `ariaLabel` (camelCase) vs `aria-label` (HTML attribute)
   - **Impact**: Breaks HTML5 spec, screen reader compatibility issues
   - **Evidence**: Button uses `accessibleName`, CodeSnippet uses `aria-label`, others use `ariaLabel`
   - **Fix**: Standardize on native `aria-*` attributes (kebab-case)

3. **Button: `submits` prop anti-pattern** - Custom prop instead of native `type="submit"`
   - **Impact**: Breaks form semantics, non-standard API
   - **Evidence**: `ButtonAsButton` interface, but actual usage shows `type="submit"` (ContactForm.tsx:491)
   - **Fix**: Remove `submits`, use native `type` attribute

### 🟡 HIGH (Consistency Issues)

4. **Event handler naming inconsistency** - `onChange` vs `onValueChange` vs `onCheckedChange` vs `onTabChange`
   - **Impact**: Developer confusion, hard to remember which component uses which
   - **Evidence**:
     - Input: `onChange: (value: string | number) => void`
     - Select: `onChange: (value: string) => void` AND `onValueChange: (value: string) => void`
     - Checkbox: `onCheckedChange: (checked: boolean) => void`
     - Switch: `onCheckedChange: (checked: boolean) => void`
     - Tabs: `onTabChange: (key: string) => void`
   - **Fix**: Standardize on descriptive names - `onValueChange` for inputs, `onCheckedChange` for toggles, `onTabChange` domain-specific

5. **Boolean prop naming inconsistency** - `open` vs `isOpen` vs `disabled` vs `loading`
   - **Impact**: Unclear intent, inconsistent API feel
   - **Evidence**:
     - Toast: `open` (no prefix)
     - Modal: `isOpen` (is- prefix)
     - Button: `disabled`, `loading` (no prefix)
     - Checkbox: `checked`, `indeterminate` (no prefix)
   - **Fix**: Use `is-` prefix for state booleans (`isOpen`, `isDisabled`, `isLoading`, `isChecked`)

6. **Size variant inconsistency** - `"s" | "m" | "l"` vs `"S" | "M" | "L"` vs `"xs" | "sm" | "md"`
   - **Impact**: Type errors when composing components, inconsistent API
   - **Evidence**:
     - Button: `"s" | "m" | "l"` (lowercase)
     - Modal `titleSize`: `"S" | "M" | "L"` (uppercase)
     - Card `size`: `"S" | "M" | "L" | "full"` (uppercase + special)
     - Tabs: `"s" | "m" | "l"` (lowercase)
   - **Fix**: Standardize on lowercase `"sm" | "md" | "lg" | "xl"` (matches Tailwind/Bootstrap conventions)

### 🟢 MEDIUM (DX Improvements)

7. **Card API complexity** - 40+ props with deeply nested config objects
   - **Impact**: Steep learning curve, hard to discover features, verbose usage
   - **Evidence**: `CardProps` interface has `titleProps`, `subTitleProps`, `descriptionProps`, `bodyProps`, `iconProps`, `badgeProps`, `statusMessageProps` (7 nested config objects)
   - **Fix**: Consider composition pattern - `<Card.Header>`, `<Card.Body>`, `<Card.Footer>` instead of config objects

8. **Inconsistent controlled/uncontrolled patterns** - Some support `default*`, others don't
   - **Impact**: Confusion about which components support uncontrolled mode
   - **Evidence**:
     - Tabs: Has `defaultActiveTabKey` + `activeTabKey` (good)
     - Card: Has `defaultActiveTabKey` + `activeTabKey` (good)
     - Select: Only `value`, no `defaultValue` documented (but HTML select supports it)
     - Input: Only `value`, no `defaultValue` documented
   - **Fix**: Document uncontrolled support where HTML supports it (input, select), or explicitly remove

9. **Variant naming inconsistency** - `variant` vs `design` vs `state` for similar concepts
   - **Impact**: Hard to predict prop names
   - **Evidence**:
     - Button: `variant="primary"` (style variations)
     - Card: `variant="elevated"` (presentation style)
     - Modal: `variant="error"` (semantic meaning)
     - Badge schema: `design="primary"` AND `state="success"` (two concepts!)
   - **Fix**: Use `variant` for visual styles, `severity` for semantic states (error/warning/info/success)

10. **Icon prop type inconsistency** - `React.ReactNode | string` vs `React.ReactNode`
    - **Impact**: Unclear if string icon names are supported universally
    - **Evidence**:
      - Button: `icon?: React.ReactNode | string` (supports icon name strings like "spinner-gap")
      - Card: `icon?: React.ReactNode` (only React elements)
    - **Fix**: Standardize on `React.ReactNode` only, use Icon component wrapper for strings

### 🔵 LOW (Polish)

11. **Accessibility prop naming** - Custom names vs native attributes
    - **Impact**: Need to learn custom API instead of standard HTML/ARIA
    - **Evidence**:
      - Button: `accessibleName`, `accessibleDescription`, `accessibleNameRef`, `accessibleRole` (custom names)
      - CodeSnippet: `aria-label` (native attribute)
      - Others: `ariaLabel` (camelCase React convention)
    - **Fix**: Use native `aria-*` attributes throughout (aria-label, aria-describedby, aria-labelledby, role)

12. **Loading state prop inconsistency** - `loading` boolean with no duration/spinner customization
    - **Impact**: Can't customize loading UI
    - **Evidence**: Button, Switch have `loading?: boolean` but no `loadingText`, `loadingIcon`, etc.
    - **Fix**: Accept as-is (simple boolean is good), document built-in spinner behavior

---

## 3. Proposed Revised APIs

### 3.1 Button Component

**Current Issues**: `submits` anti-pattern, `accessibleName` custom props, `icon` string support inconsistent

```typescript
// ❌ CURRENT (problematic)
interface BaseButtonProps {
  variant?: "primary" | "secondary" | "tertiary" | "secondaryError" | "tertiaryError" | "error" | "warning" | "success" | "info";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode | string;
  endIcon?: React.ReactNode | string;
  children?: React.ReactNode | React.ReactNode[];
  accessibleDescription?: string;
  accessibleName?: string;
  accessibleNameRef?: string;
  accessibleRole?: "button" | "link";
  tooltip?: string;
  size?: "s" | "m" | "l";
  inverse?: boolean;
  rounded?: boolean;
}

interface ButtonAsButton extends BaseButtonProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
  submits?: boolean; // ❌ Anti-pattern
  href?: never;
}

interface ButtonAsLink extends BaseButtonProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
  href: string;
  submits?: never;
}
```

```typescript
// ✅ PROPOSED (improved)
interface BaseButtonProps {
  /** Visual style variant */
  variant?: "primary" | "secondary" | "tertiary" | "ghost" | "link";
  /** Semantic severity for status buttons */
  severity?: "error" | "warning" | "success" | "info";
  /** Disables interaction */
  isDisabled?: boolean; // ✅ is- prefix
  /** Shows loading state */
  isLoading?: boolean; // ✅ is- prefix
  /** Leading icon */
  icon?: React.ReactNode; // ✅ Remove string support, use <Icon> wrapper
  /** Trailing icon */
  endIcon?: React.ReactNode;
  /** Button content */
  children?: React.ReactNode;
  /** Size variant */
  size?: "sm" | "md" | "lg"; // ✅ Standardized sizes
  /** White text/border for dark backgrounds */
  isInverse?: boolean; // ✅ is- prefix
  /** Rounded corners */
  isRounded?: boolean; // ✅ is- prefix
}

interface ButtonAsButton extends BaseButtonProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps | "type"> {
  /** Button type - use "submit" for forms */
  type?: "button" | "submit" | "reset"; // ✅ Native attribute, removed submits
  href?: never;
  target?: never;
  rel?: never;
}

interface ButtonAsLink extends BaseButtonProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
  /** URL - presence makes this render as <a> */
  href: string;
  type?: never;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;
```

**Key Changes**:
- ✅ Removed `submits` - use native `type="submit"`
- ✅ Removed `accessible*` props - use native `aria-label`, `aria-describedby`, `role`
- ✅ Split `variant` into `variant` (visual) + `severity` (semantic)
- ✅ Added `is-` prefix to boolean state props
- ✅ Standardized size to `sm | md | lg`
- ✅ Removed string icon support (use `<Icon name="..." />` wrapper)
- ✅ Removed `tooltip` (use external tooltip component)

---

### 3.2 Input Component

**Current Issues**: Custom `onChange` signature omits event object, missing `defaultValue` documentation

```typescript
// ❌ CURRENT
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  type: "text" | "number" | "email" | "password" | "search" | "tel";
  value?: string | number;
  error?: string;
  helperText?: string;
  onChange?: (value: string | number) => void; // ❌ No event object
}
```

```typescript
// ✅ PROPOSED
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  /** Input label (required for a11y) */
  label: string;
  /** Input type */
  type?: "text" | "number" | "email" | "password" | "search" | "tel" | "url";
  /** Controlled value */
  value?: string | number;
  /** Uncontrolled default value */
  defaultValue?: string | number; // ✅ Explicit support
  /** Validation error message */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Value change handler */
  onValueChange?: (value: string | number) => void; // ✅ Renamed for consistency
  /** Size variant */
  size?: "sm" | "md" | "lg"; // ✅ Added size prop
  /** Disabled state */
  isDisabled?: boolean; // ✅ is- prefix
}
```

**Key Changes**:
- ✅ Renamed `onChange` → `onValueChange` (consistency with Select)
- ✅ Added explicit `defaultValue` for uncontrolled mode
- ✅ Added `size` variant (removed from Omit)
- ✅ Added `isDisabled` with is- prefix
- ✅ Added `url` type

---

### 3.3 Select Component

**Current Issues**: CRITICAL - has BOTH `onChange` and `onValueChange`

```typescript
// ❌ CURRENT (CRITICAL BUG)
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string;
  options?: SelectOptionItem[];
  helperText?: string;
  onChange?: (value: string) => void; // ❌ Duplicate!
  onValueChange?: (value: string) => void; // ❌ Duplicate!
}
```

```typescript
// ✅ PROPOSED
interface SelectOptionItem {
  value: string;
  label: string;
  isDisabled?: boolean; // ✅ is- prefix
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "size"> {
  /** Select label (required for a11y) */
  label: string;
  /** Option items (alternative to children) */
  options?: SelectOptionItem[];
  /** Controlled value */
  value?: string;
  /** Uncontrolled default value */
  defaultValue?: string; // ✅ Explicit support
  /** Helper text below select */
  helperText?: string;
  /** Validation error message */
  error?: string; // ✅ Added for consistency with Input
  /** Value change handler */
  onValueChange?: (value: string) => void; // ✅ REMOVED onChange
  /** Size variant */
  size?: "sm" | "md" | "lg"; // ✅ Added size
  /** Disabled state */
  isDisabled?: boolean; // ✅ is- prefix
}
```

**Key Changes**:
- 🔴 **CRITICAL**: Removed `onChange`, kept only `onValueChange`
- ✅ Added `error` prop (parity with Input)
- ✅ Added explicit `defaultValue`
- ✅ Added `size` variant
- ✅ Renamed `disabled` → `isDisabled` in SelectOptionItem
- ✅ Added `isDisabled` to main props

---

### 3.4 Checkbox Component

**Current Issues**: `checked` required (should support uncontrolled), `onCheckedChange` required

```typescript
// ❌ CURRENT
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "checked"> {
  label?: string;
  showLabel?: boolean;
  checked: boolean; // ❌ Required, no uncontrolled mode
  indeterminate?: boolean;
  onCheckedChange: (checked: boolean) => void; // ❌ Required
  id?: string;
}
```

```typescript
// ✅ PROPOSED
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "checked" | "size"> {
  /** Checkbox label */
  label?: string;
  /** Visually hide label (still accessible) */
  isLabelHidden?: boolean; // ✅ Renamed from showLabel, inverted logic
  /** Controlled checked state */
  isChecked?: boolean; // ✅ Optional, is- prefix
  /** Uncontrolled default checked state */
  defaultChecked?: boolean; // ✅ Added for uncontrolled
  /** Indeterminate state (tri-state checkbox) */
  isIndeterminate?: boolean; // ✅ is- prefix
  /** Checked state change handler */
  onCheckedChange?: (isChecked: boolean) => void; // ✅ Optional, is- prefix in param
  /** Size variant */
  size?: "sm" | "md" | "lg"; // ✅ Added size
  /** Disabled state */
  isDisabled?: boolean; // ✅ is- prefix
}
```

**Key Changes**:
- ✅ Renamed `checked` → `isChecked`, made optional
- ✅ Added `defaultChecked` for uncontrolled mode
- ✅ Made `onCheckedChange` optional (supports uncontrolled)
- ✅ Renamed `showLabel` → `isLabelHidden` (clearer intent)
- ✅ Renamed `indeterminate` → `isIndeterminate`
- ✅ Added `size` variant
- ✅ Added `isDisabled`

---

### 3.5 Switch Component

**Current Issues**: Similar to Checkbox, missing size variants

```typescript
// ❌ CURRENT
interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean; // ❌ Required
  onCheckedChange?: (checked: boolean) => void;
  loading?: boolean;
  label?: React.ReactNode;
  labelPlacement?: "right" | "left" | "top";
  helperText?: string;
}
```

```typescript
// ✅ PROPOSED
interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Controlled checked state */
  isChecked?: boolean; // ✅ Optional, is- prefix
  /** Uncontrolled default checked state */
  defaultChecked?: boolean; // ✅ Added
  /** Checked state change handler */
  onCheckedChange?: (isChecked: boolean) => void; // ✅ is- prefix in param
  /** Loading state */
  isLoading?: boolean; // ✅ is- prefix
  /** Switch label */
  label?: React.ReactNode;
  /** Label position */
  labelPlacement?: "start" | "end" | "top"; // ✅ start/end instead of left/right
  /** Helper text */
  helperText?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg"; // ✅ Added size
  /** Disabled state */
  isDisabled?: boolean; // ✅ is- prefix
}
```

**Key Changes**:
- ✅ Renamed `checked` → `isChecked`, made optional
- ✅ Added `defaultChecked`
- ✅ Renamed `loading` → `isLoading`
- ✅ Changed `labelPlacement` values: `left/right` → `start/end` (i18n-friendly)
- ✅ Added `size` variant
- ✅ Added `isDisabled`

---

### 3.6 Modal Component

**Current Issues**: `isOpen` good, but `showCloseIcon` inconsistent, `titleSize` uppercase

```typescript
// ❌ CURRENT
interface ModalProps {
  isOpen: boolean; // ✅ Good!
  title?: string;
  titleSize?: "S" | "M" | "L"; // ❌ Uppercase
  titleTerminals?: "sans" | "serif";
  variant?: "default" | "success" | "error" | "warning" | "info" | "loading"; // ❌ Mixes visual + semantic
  menu?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
  showCloseIcon?: boolean; // ❌ show- prefix
  closeIconName?: string;
  closeButtonLabel?: string;
}
```

```typescript
// ✅ PROPOSED
interface ModalProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Modal title */
  title?: string;
  /** Title size */
  titleSize?: "sm" | "md" | "lg"; // ✅ Lowercase
  /** Title font family */
  titleFamily?: "sans" | "serif"; // ✅ Renamed from terminals
  /** Visual variant */
  variant?: "elevated" | "filled" | "outlined"; // ✅ Visual only
  /** Semantic severity (changes icon/color) */
  severity?: "error" | "warning" | "info" | "success"; // ✅ Split from variant
  /** Header extra content (menu, etc.) */
  headerExtra?: React.ReactNode; // ✅ Renamed from menu
  /** Modal body content */
  children?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Close callback */
  onClose?: () => void;
  /** Header icon */
  icon?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Show close X button */
  hasCloseButton?: boolean; // ✅ has- prefix
  /** Size variant */
  size?: "sm" | "md" | "lg" | "full"; // ✅ Added size
  /** Loading state */
  isLoading?: boolean; // ✅ Added loading variant
}
```

**Key Changes**:
- ✅ Renamed `titleSize` to lowercase `sm | md | lg`
- ✅ Renamed `titleTerminals` → `titleFamily` (clearer)
- ✅ Split `variant` into `variant` (visual) + `severity` (semantic)
- ✅ Removed `loading` from variant, added `isLoading` boolean
- ✅ Renamed `menu` → `headerExtra` (clearer intent)
- ✅ Renamed `showCloseIcon` → `hasCloseButton` (has- prefix)
- ✅ Removed `closeIconName`, `closeButtonLabel` (over-customization)
- ✅ Added `size` variant

---

### 3.7 Card Component

**Current Issues**: 40+ props, 7 nested config objects, extreme API complexity

```typescript
// ❌ CURRENT (simplified, actual has 40+ props)
interface CardProps {
  title?: string;
  titleProps?: { level?: 1|2|3|4|5|6; size?: "S"|"M"|"L"|"XL"; terminals?: "sans"|"serif"; as?: ...; className?: string };
  subTitle?: string;
  subTitleProps?: { size?: "S"|"M"|"L"; as?: ...; className?: string };
  description?: string;
  descriptionProps?: { size?: "S"|"M"|"L"; as?: ...; className?: string };
  bodyProps?: { size?: "S"|"M"|"L"; as?: ...; className?: string };
  // ... 30+ more props
}
```

```typescript
// ✅ PROPOSED (composition pattern)
interface CardProps {
  /** Card presentation variant */
  variant?: "elevated" | "filled" | "outlined";
  /** Elevation on hover */
  isHoverable?: boolean; // ✅ is- prefix
  /** Show border */
  isBordered?: boolean; // ✅ is- prefix
  /** Padding size */
  size?: "sm" | "md" | "lg" | "none"; // ✅ Renamed "full" → "none"
  /** Make entire card clickable */
  href?: string; // ✅ Simplified from link + onClick + interactive
  /** Loading skeleton state */
  isLoading?: boolean; // ✅ is- prefix
  /** Card content */
  children?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

// ✅ Composition sub-components
interface CardHeaderProps {
  title?: string;
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6; // ✅ Flattened from titleProps
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  extra?: React.ReactNode; // ✅ Renamed from menu
}

interface CardBodyProps {
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

interface CardFooterProps {
  actions?: Array<{
    key: string;
    label: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "tertiary";
    isDisabled?: boolean; // ✅ is- prefix
  }>;
  children?: React.ReactNode; // ✅ Allow custom footer
}

interface CardTabsProps {
  tabs: Array<{
    key: string;
    label: string;
    isDisabled?: boolean; // ✅ is- prefix
  }>;
  activeTab?: string;
  defaultActiveTab?: string;
  onTabChange?: (key: string) => void;
}

// ✅ USAGE (composition)
<Card variant="outlined" size="md" isHoverable>
  <Card.Header
    title="Title"
    subtitle="Subtitle"
    icon={<Icon name="star" />}
    badge={<Badge>New</Badge>}
  />
  <Card.Tabs tabs={...} activeTab="tab1" onTabChange={...} />
  <Card.Body>Content here</Card.Body>
  <Card.Footer actions={[...]} />
</Card>
```

**Key Changes**:
- 🔴 **MAJOR REFACTOR**: Replace 40-prop flat API with composition pattern
- ✅ Split into `<Card>`, `<Card.Header>`, `<Card.Body>`, `<Card.Footer>`, `<Card.Tabs>`
- ✅ Reduced main Card props from 40+ to ~10
- ✅ Flattened nested config objects (titleProps → individual props)
- ✅ Simplified `link` + `onClick` + `interactive` → single `href` prop
- ✅ Renamed `hoverable` → `isHoverable`
- ✅ Renamed `bordered` → `isBordered`
- ✅ Renamed `loading` → `isLoading`
- ✅ Standardized sizes to lowercase

---

### 3.8 Tabs Component

**Current Issues**: Mostly good, just size inconsistency

```typescript
// ❌ CURRENT
interface TabItem {
  key: string;
  label: string;
  disabled?: boolean; // ❌ No is- prefix
}

interface TabsProps {
  tabs: TabItem[];
  activeTabKey?: string;
  defaultActiveTabKey?: string;
  onTabChange?: (key: string) => void;
  className?: string;
  variant?: "default" | "pills" | "underline";
  size?: "s" | "m" | "l"; // ❌ Lowercase single-letter
}
```

```typescript
// ✅ PROPOSED
interface TabItem {
  key: string;
  label: string;
  isDisabled?: boolean; // ✅ is- prefix
}

interface TabsProps {
  /** Tab items */
  tabs: TabItem[];
  /** Controlled active tab */
  activeTab?: string; // ✅ Shortened from activeTabKey
  /** Uncontrolled default active tab */
  defaultActiveTab?: string; // ✅ Shortened
  /** Tab change handler */
  onTabChange?: (key: string) => void;
  /** Visual variant */
  variant?: "default" | "pills" | "underline";
  /** Size variant */
  size?: "sm" | "md" | "lg"; // ✅ Standardized
  /** Additional CSS class */
  className?: string;
}
```

**Key Changes**:
- ✅ Renamed `disabled` → `isDisabled` in TabItem
- ✅ Shortened `activeTabKey` → `activeTab`
- ✅ Shortened `defaultActiveTabKey` → `defaultActiveTab`
- ✅ Standardized size to `sm | md | lg`

---

### 3.9 Toast Component

**Current Issues**: `open` should be `isOpen` for consistency

```typescript
// ❌ CURRENT
interface ToastProps {
  message: string;
  open: boolean; // ❌ No is- prefix
  duration?: number;
  onClose?: () => void;
}
```

```typescript
// ✅ PROPOSED
interface ToastProps {
  /** Toast message content */
  message: string;
  /** Controls visibility */
  isOpen: boolean; // ✅ is- prefix for consistency with Modal
  /** Auto-dismiss duration in milliseconds */
  duration?: number;
  /** Close callback */
  onClose?: () => void;
  /** Severity variant */
  severity?: "error" | "warning" | "info" | "success"; // ✅ Added semantic variants
  /** Position on screen */
  position?: "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end"; // ✅ Added positioning
}
```

**Key Changes**:
- ✅ Renamed `open` → `isOpen`
- ✅ Added `severity` for semantic coloring
- ✅ Added `position` for flexible placement

---

### 3.10 CodeSnippet Component

**Current Issues**: `aria-label` good (native), but `showLineNumbers` inconsistent

```typescript
// ❌ CURRENT
interface CodeSnippetProps {
  code: string;
  language?: SupportedLanguage;
  showLineNumbers?: boolean; // ❌ show- prefix
  "aria-label"?: string; // ✅ Good! Native attribute
  allowCopy?: boolean; // ❌ allow- prefix
  variant?: "inline" | "single" | "multi";
  maxLines?: number;
  onCopy?: () => void;
}
```

```typescript
// ✅ PROPOSED
interface CodeSnippetProps {
  /** Code string to display */
  code: string;
  /** Syntax highlighting language */
  language?: SupportedLanguage;
  /** Show line numbers */
  hasLineNumbers?: boolean; // ✅ has- prefix
  /** Accessible label */
  "aria-label"?: string; // ✅ Keep native
  /** Enable copy button */
  isCopyable?: boolean; // ✅ is- prefix
  /** Display variant */
  variant?: "inline" | "block"; // ✅ Simplified from single/multi
  /** Maximum visible lines (enables truncation) */
  maxLines?: number;
  /** Copy callback */
  onCopy?: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg"; // ✅ Added size
}
```

**Key Changes**:
- ✅ Renamed `showLineNumbers` → `hasLineNumbers`
- ✅ Renamed `allowCopy` → `isCopyable`
- ✅ Simplified `variant`: removed "single", combined into "block"
- ✅ Added `size` variant

---

## 4. Prop-by-Prop Migration Rationale

### Size Props: `"s"|"m"|"l"` → `"sm"|"md"|"lg"`

| Component | Current | Proposed | Breaking? | Rationale |
|-----------|---------|----------|-----------|-----------|
| Button | `"s"\|"m"\|"l"` | `"sm"\|"md"\|"lg"` | ✅ Yes | Industry standard (Tailwind, Bootstrap, MUI) |
| Input | N/A | `"sm"\|"md"\|"lg"` | ✅ Yes | Add missing size variants |
| Select | N/A | `"sm"\|"md"\|"lg"` | ✅ Yes | Add missing size variants |
| Checkbox | N/A | `"sm"\|"md"\|"lg"` | ✅ Yes | Add missing size variants |
| Switch | N/A | `"sm"\|"md"\|"lg"` | ✅ Yes | Add missing size variants |
| Modal titleSize | `"S"\|"M"\|"L"` | `"sm"\|"md"\|"lg"` | ✅ Yes | Consistency with other sizes |
| Modal (new) | N/A | `"sm"\|"md"\|"lg"\|"full"` | ✅ Yes | Add dialog size variants |
| Card | `"S"\|"M"\|"L"\|"full"` | `"sm"\|"md"\|"lg"\|"none"` | ✅ Yes | Lowercase + rename "full"→"none" |
| Tabs | `"s"\|"m"\|"l"` | `"sm"\|"md"\|"lg"` | ✅ Yes | Two-letter consistency |
| CodeSnippet | N/A | `"sm"\|"md"\|"lg"` | ✅ Yes | Add font size variants |

**Migration**: Create codemod to rename all size values:
```typescript
// Codemod pattern
size="s" → size="sm"
size="m" → size="md"
size="l" → size="lg"
size="S" → size="sm"
size="M" → size="md"
size="L" → size="lg"
titleSize="S" → titleSize="sm"
// etc.
```

---

### Boolean Props: Add `is-` prefix for state

| Component | Current Prop | Proposed Prop | Breaking? | Rationale |
|-----------|-------------|---------------|-----------|-----------|
| Button | `disabled` | `isDisabled` | ✅ Yes | State clarity, React convention |
| Button | `loading` | `isLoading` | ✅ Yes | State clarity |
| Button | `inverse` | `isInverse` | ✅ Yes | State clarity |
| Button | `rounded` | `isRounded` | ✅ Yes | State clarity |
| Input | `disabled` (native) | `isDisabled` | ⚠️ Maybe | Conflicts with native attribute |
| Select | `disabled` (native) | `isDisabled` | ⚠️ Maybe | Conflicts with native attribute |
| Checkbox | `checked` | `isChecked` | ✅ Yes | State clarity |
| Checkbox | `indeterminate` | `isIndeterminate` | ✅ Yes | State clarity |
| Checkbox | `showLabel` | `isLabelHidden` | ✅ Yes | Inverted logic + is- prefix |
| Switch | `checked` | `isChecked` | ✅ Yes | State clarity |
| Switch | `loading` | `isLoading` | ✅ Yes | State clarity |
| Modal | `isOpen` | `isOpen` | ❌ No | Already good! |
| Modal | `showCloseIcon` | `hasCloseButton` | ✅ Yes | has- for features, is- for state |
| Card | `hoverable` | `isHoverable` | ✅ Yes | State clarity |
| Card | `bordered` | `isBordered` | ✅ Yes | State clarity |
| Card | `loading` | `isLoading` | ✅ Yes | State clarity |
| Card | `interactive` | (removed) | ✅ Yes | Merged into `href` |
| Toast | `open` | `isOpen` | ✅ Yes | Consistency with Modal |
| CodeSnippet | `showLineNumbers` | `hasLineNumbers` | ✅ Yes | has- for features |
| CodeSnippet | `allowCopy` | `isCopyable` | ✅ Yes | Capability clarity |

**Decision Log**:
- **is-**: Use for boolean **state** (isOpen, isDisabled, isLoading, isChecked)
- **has-**: Use for boolean **features** (hasCloseButton, hasLineNumbers)
- **Native attributes**: For Input/Select, keep native `disabled` accessible but add `isDisabled` alias for consistency

**Migration**: Create codemod with prop rename mapping:
```typescript
// Codemod pattern
disabled={} → isDisabled={}
loading={} → isLoading={}
checked={} → isChecked={}
open={} → isOpen={}
hoverable={} → isHoverable={}
// etc.
```

---

### Event Handlers: Standardize naming

| Component | Current Handler | Proposed Handler | Breaking? | Rationale |
|-----------|----------------|------------------|-----------|-----------|
| Input | `onChange(value)` | `onValueChange(value)` | ✅ Yes | Descriptive, consistent with Select |
| Select | `onChange(value)` + `onValueChange(value)` | `onValueChange(value)` | 🔴 CRITICAL | Remove duplicate, keep descriptive |
| Checkbox | `onCheckedChange(checked)` | `onCheckedChange(isChecked)` | ⚠️ Param only | Keep name, rename param |
| Switch | `onCheckedChange(checked)` | `onCheckedChange(isChecked)` | ⚠️ Param only | Keep name, rename param |
| Tabs | `onTabChange(key)` | `onTabChange(key)` | ❌ No | Already descriptive |
| Modal | `onClose()` | `onClose()` | ❌ No | Standard naming |
| Toast | `onClose()` | `onClose()` | ❌ No | Standard naming |

**Decision Log**:
1. **Input/Select**: Use `onValueChange` instead of `onChange` (more descriptive than generic onChange)
2. **Checkbox/Switch**: Keep `onCheckedChange` (domain-specific, clear intent)
3. **Tabs**: Keep `onTabChange` (domain-specific)
4. **Close handlers**: Keep `onClose` (universal pattern)

**Migration**:
```typescript
// Codemod for Input
<Input onChange={handleChange} /> → <Input onValueChange={handleChange} />

// Codemod for Select (CRITICAL - remove onChange)
<Select onChange={handleChange} /> → <Select onValueChange={handleChange} />
<Select onValueChange={handleChange} /> → <Select onValueChange={handleChange} /> // No change

// Runtime deprecation warning in v1.x
function Input({ onChange, onValueChange, ...props }: InputProps) {
  if (onChange && !onValueChange) {
    console.warn('Input: onChange is deprecated, use onValueChange');
    return <input {...props} onChange={(e) => onChange(e.target.value)} />;
  }
  // ...
}
```

---

### ARIA & Accessibility Props: Use native attributes

| Component | Current Prop | Proposed Prop | Breaking? | Rationale |
|-----------|-------------|---------------|-----------|-----------|
| Button | `accessibleName` | `aria-label` | ✅ Yes | HTML5 standard |
| Button | `accessibleDescription` | `aria-describedby` | ✅ Yes | HTML5 standard |
| Button | `accessibleNameRef` | `aria-labelledby` | ✅ Yes | HTML5 standard |
| Button | `accessibleRole` | `role` | ✅ Yes | HTML5 standard |
| Button | `tooltip` | (removed) | ✅ Yes | Use external Tooltip component |
| CodeSnippet | `aria-label` | `aria-label` | ❌ No | Already correct! |
| Others | `ariaLabel` (camelCase) | `aria-label` (kebab-case) | ✅ Yes | HTML5 standard |

**Decision Log**:
- **Use native HTML/ARIA attributes** (kebab-case) instead of camelCase wrappers
- React supports kebab-case for `aria-*` and `data-*` attributes
- Improves interop with testing tools, screen readers, dev tools

**Migration**:
```typescript
// Codemod
accessibleName="..." → aria-label="..."
accessibleDescription="..." → aria-describedby="..."
accessibleNameRef="..." → aria-labelledby="..."
accessibleRole="..." → role="..."
ariaLabel="..." → aria-label="..."
```

---

### Variant Props: Split visual vs semantic

| Component | Current Variant | Proposed | Breaking? | Rationale |
|-----------|----------------|----------|-----------|-----------|
| Button | `variant="error"` | `severity="error"` | ✅ Yes | Semantic state separate from visual style |
| Button | `variant="warning"` | `severity="warning"` | ✅ Yes | Semantic state |
| Button | `variant="success"` | `severity="success"` | ✅ Yes | Semantic state |
| Button | `variant="info"` | `severity="info"` | ✅ Yes | Semantic state |
| Button | `variant="primary"` | `variant="primary"` | ❌ No | Visual style remains |
| Modal | `variant="error"` | `severity="error"` | ✅ Yes | Semantic state |
| Modal | `variant="loading"` | `isLoading={true}` | ✅ Yes | Boolean instead of variant |
| Badge | `design="primary"` + `state="success"` | `variant="primary"` + `severity="success"` | ✅ Yes | Standardize naming |

**Decision Log**:
- **variant**: Visual presentation (primary, secondary, tertiary, outlined, filled, elevated)
- **severity**: Semantic meaning (error, warning, info, success, neutral)
- Some components may have only `variant`, only `severity`, or both
- Never combine visual + semantic in single `variant` prop

**Migration**:
```typescript
// Button codemod
<Button variant="error" /> → <Button severity="error" />
<Button variant="primary" /> → <Button variant="primary" /> // No change

// Modal codemod
<Modal variant="loading" /> → <Modal isLoading={true} />
<Modal variant="error" /> → <Modal severity="error" />
```

---

## 5. Naming Alignment Rules + Decision Log

### Rule 1: Size Variants
**Standard**: `"sm" | "md" | "lg" | "xl"` (lowercase, two letters)

**Rationale**:
- Matches industry standards (Tailwind CSS, Bootstrap, Material UI)
- Two letters prevent confusion between "s" (second) vs "sm" (small)
- Easier to extend (xs, xl, 2xl, etc.)

**Applies to**: All components with size variants (Button, Input, Select, Modal, Card, Tabs, CodeSnippet, etc.)

---

### Rule 2: Boolean State Props
**Standard**: `is-` prefix for state, `has-` prefix for features

**Rationale**:
- `is-` for state: isOpen, isDisabled, isLoading, isChecked, isActive
- `has-` for features: hasCloseButton, hasLineNumbers, hasIcon
- Improves readability: `if (isDisabled)` reads like English
- Prevents naming collisions with native attributes

**Applies to**: All boolean props except native HTML attributes (disabled, checked, required on native inputs)

---

### Rule 3: Event Handlers
**Standard**: `on{Action}` with descriptive action name

**Patterns**:
- Value changes: `onValueChange(value)` - Input, Select
- Checked state: `onCheckedChange(isChecked)` - Checkbox, Switch
- Domain-specific: `onTabChange(key)` - Tabs
- Universal: `onClose()`, `onClick()`, `onCopy()`

**Rationale**:
- Descriptive names > generic `onChange`
- Consistency across similar components
- Parameters use same naming as props (isChecked, not checked)

**Applies to**: All event handler props

---

### Rule 4: ARIA & Accessibility
**Standard**: Use native HTML/ARIA attributes (kebab-case)

**Rationale**:
- React supports `aria-*` and `data-*` in kebab-case
- Better dev tools integration
- Familiar to web developers
- Improves testing (screen readers, axe-core)

**Examples**:
- `aria-label` (not `ariaLabel` or `accessibleName`)
- `aria-describedby` (not `accessibleDescription`)
- `role` (not `accessibleRole`)

**Applies to**: All accessibility-related props

---

### Rule 5: Visual vs Semantic Props
**Standard**: `variant` for visual, `severity` for semantic

**Rationale**:
- `variant`: Controls visual presentation (primary, secondary, outlined, filled)
- `severity`: Controls semantic meaning (error, warning, info, success)
- Separation allows visual + semantic combination (e.g., outlined error button)

**Examples**:
- Button: `variant="primary"` + `severity="error"`
- Modal: `variant="elevated"` + `severity="warning"`
- Toast: `severity="success"` (no visual variant needed)

**Applies to**: Components with status/state coloring (Button, Modal, Toast, Badge, Alert, etc.)

---

### Rule 6: Controlled/Uncontrolled
**Standard**: `value` + `defaultValue` for uncontrolled support

**Rationale**:
- Follows React's standard controlled/uncontrolled pattern
- `value` = controlled (parent manages state)
- `defaultValue` = uncontrolled (component manages state)
- Handler props should be optional (required only in controlled mode)

**Examples**:
- Input: `value` + `defaultValue` + optional `onValueChange`
- Checkbox: `isChecked` + `defaultChecked` + optional `onCheckedChange`
- Tabs: `activeTab` + `defaultActiveTab` + optional `onTabChange`

**Applies to**: All stateful form components

---

### Rule 7: Prop Naming Patterns
**Standard**: Use semantic prefixes/suffixes

| Pattern | Example | Meaning |
|---------|---------|---------|
| `is-` | `isOpen`, `isDisabled` | Boolean state |
| `has-` | `hasCloseButton`, `hasLineNumbers` | Boolean feature |
| `on-` | `onClick`, `onValueChange` | Event handler |
| `default-` | `defaultValue`, `defaultChecked` | Uncontrolled initial value |
| `-Extra` | `headerExtra`, `footerExtra` | Slot for additional content |
| `-Placement` | `labelPlacement`, `iconPlacement` | Position control |

**Rationale**: Consistent patterns reduce cognitive load

---

### Rule 8: Directional Props (i18n)
**Standard**: Use `start/end` instead of `left/right`

**Rationale**:
- RTL (right-to-left) language support
- `start` = left in LTR, right in RTL
- `end` = right in LTR, left in RTL

**Examples**:
- Switch `labelPlacement`: `"start" | "end" | "top"` (not "left" | "right")
- Toast `position`: `"top-start"` (not "top-left")
- CSS: Use `margin-inline-start` (not `margin-left`)

**Applies to**: All positioning/directional props

---

### Rule 9: Component Composition over Configuration
**Standard**: For complex components, prefer composition over massive prop APIs

**Rationale**:
- Flat 40+ prop APIs are hard to learn and use
- Composition is more flexible and discoverable
- Follows React patterns (think `<select><option>` not `<select options={[]}`)

**Example**: Card component refactor
```typescript
// ❌ Configuration (40+ props)
<Card
  title="Title"
  titleProps={{ size: "M", level: 2 }}
  subTitleProps={{ size: "S" }}
  actions={[...]}
/>

// ✅ Composition
<Card>
  <Card.Header title="Title" titleLevel={2} subtitle="..." />
  <Card.Body>Content</Card.Body>
  <Card.Footer actions={[...]} />
</Card>
```

**Applies to**: Complex components with 20+ props

---

### Rule 10: Remove Anti-patterns
**Standard**: Align with web standards, remove custom abstractions

**Anti-patterns to remove**:
- Button `submits` prop → use native `type="submit"`
- Button `accessibleName` → use `aria-label`
- Custom prefixes for native attributes → use native names

**Rationale**: Reduce learning curve, improve interop with HTML/browser APIs

---

## 6. Migration Plan

### Phase 1: Non-Breaking Additions (v1.1.0)

**Timeline**: 1-2 weeks
**Goal**: Add new props alongside old props (dual support)

| Component | Changes | Breaking? |
|-----------|---------|-----------|
| Button | Add `isDisabled`, `isLoading`, `isInverse`, `isRounded` (keep old props) | ❌ No |
| Input | Add `onValueChange`, `defaultValue`, `size`, `isDisabled` | ❌ No |
| Select | Add `error`, `size`, `isDisabled`, `defaultValue` (keep both onChange variants for now) | ❌ No |
| Checkbox | Add `isChecked`, `isIndeterminate`, `defaultChecked`, `size` | ❌ No |
| Switch | Add `isChecked`, `isLoading`, `defaultChecked`, `size` | ❌ No |
| Modal | Add `severity`, `size`, `isLoading`, `hasCloseButton` | ❌ No |
| Tabs | Add `activeTab`, `defaultActiveTab` (keep old names too) | ❌ No |
| Toast | Add `isOpen`, `severity`, `position` | ❌ No |
| CodeSnippet | Add `hasLineNumbers`, `isCopyable`, `size` | ❌ No |

**Runtime Warnings**: Add console warnings for deprecated props
```typescript
if (disabled !== undefined && isDisabled === undefined) {
  console.warn('Button: "disabled" is deprecated, use "isDisabled"');
}
```

**Documentation**: Mark old props as deprecated in JSDoc
```typescript
/**
 * @deprecated Use `isDisabled` instead
 */
disabled?: boolean;
```

---

### Phase 2: Breaking Changes (v2.0.0)

**Timeline**: 4-6 weeks after v1.1.0
**Goal**: Remove old props, standardize all naming

#### 2.1 High Priority (fix critical issues)

| Component | Change | Impact | Files Affected |
|-----------|--------|--------|----------------|
| Select | **REMOVE `onChange`**, keep only `onValueChange` | 🔴 Critical | ~5-10 files |
| Button | Remove `submits`, require `type="submit"` | 🔴 High | ~15-20 files |
| Button | Remove `accessibleName`, use `aria-label` | 🔴 High | ~10-15 files |

**Before/After Table**:

| Component | Old Code | New Code |
|-----------|----------|----------|
| Select | `<Select onChange={fn} />` | `<Select onValueChange={fn} />` |
| Select | `<Select onChange={fn} onValueChange={fn2} />` | `<Select onValueChange={fn} />` ⚠️ Removes duplicate |
| Button | `<Button submits>Submit</Button>` | `<Button type="submit">Submit</Button>` |
| Button | `<Button accessibleName="Label" />` | `<Button aria-label="Label" />` |
| Button | `<Button accessibleDescription="Help" />` | `<Button aria-describedby="help-id" />` |

#### 2.2 Medium Priority (consistency improvements)

| Component | Change | Impact | Files Affected |
|-----------|--------|--------|----------------|
| All | Rename `disabled` → `isDisabled` | 🟡 Medium | ~40-50 files |
| All | Rename `loading` → `isLoading` | 🟡 Medium | ~10-15 files |
| Input | Rename `onChange` → `onValueChange` | 🟡 Medium | ~15-20 files |
| Checkbox | Rename `checked` → `isChecked` | 🟡 Medium | ~5-10 files |
| Switch | Rename `checked` → `isChecked` | 🟡 Medium | ~3-5 files |
| Toast | Rename `open` → `isOpen` | 🟡 Medium | ~5-8 files |
| Modal | Rename `showCloseIcon` → `hasCloseButton` | 🟡 Medium | ~8-10 files |

**Before/After Table**:

| Component | Old Code | New Code |
|-----------|----------|----------|
| Button | `<Button disabled loading />` | `<Button isDisabled isLoading />` |
| Input | `<Input onChange={fn} />` | `<Input onValueChange={fn} />` |
| Checkbox | `<Checkbox checked={true} />` | `<Checkbox isChecked={true} />` |
| Toast | `<Toast open={show} />` | `<Toast isOpen={show} />` |
| Modal | `<Modal showCloseIcon={false} />` | `<Modal hasCloseButton={false} />` |

#### 2.3 Size Standardization

| Component | Old Size Values | New Size Values | Files Affected |
|-----------|----------------|-----------------|----------------|
| Button | `"s"\|"m"\|"l"` | `"sm"\|"md"\|"lg"` | ~20-25 files |
| Modal titleSize | `"S"\|"M"\|"L"` | `"sm"\|"md"\|"lg"` | ~5-8 files |
| Card | `"S"\|"M"\|"L"\|"full"` | `"sm"\|"md"\|"lg"\|"none"` | ~10-15 files |
| Tabs | `"s"\|"m"\|"l"` | `"sm"\|"md"\|"lg"` | ~3-5 files |

**Before/After Table**:

| Component | Old Code | New Code |
|-----------|----------|----------|
| Button | `<Button size="s" />` | `<Button size="sm" />` |
| Button | `<Button size="l" />` | `<Button size="lg" />` |
| Modal | `<Modal titleSize="M" />` | `<Modal titleSize="md" />` |
| Card | `<Card size="full" />` | `<Card size="none" />` ⚠️ Renamed |

#### 2.4 Variant Split (Visual + Semantic)

| Component | Old Code | New Code | Rationale |
|-----------|----------|----------|-----------|
| Button | `<Button variant="error" />` | `<Button severity="error" />` | Semantic state |
| Button | `<Button variant="primary" />` | `<Button variant="primary" />` | Visual style (unchanged) |
| Modal | `<Modal variant="loading" />` | `<Modal isLoading={true} />` | Boolean instead of variant |
| Modal | `<Modal variant="error" />` | `<Modal severity="error" />` | Semantic state |

**Before/After Table**:

| Old Code | New Code | Breaking? |
|----------|----------|-----------|
| `<Button variant="error">Delete</Button>` | `<Button severity="error">Delete</Button>` | ✅ Yes |
| `<Button variant="warning">Warn</Button>` | `<Button severity="warning">Warn</Button>` | ✅ Yes |
| `<Modal variant="loading" isOpen />` | `<Modal isLoading isOpen />` | ✅ Yes |

---

### Phase 3: Card Composition Refactor (v2.1.0 or v3.0.0)

**Timeline**: 8-12 weeks (major refactor)
**Goal**: Replace flat Card API with composition pattern

**Before**:
```tsx
<Card
  title="Feature Card"
  titleProps={{ size: "M", level: 2 }}
  subTitle="Subtitle text"
  description="Description text"
  icon={<Icon name="star" />}
  badge={<Badge>New</Badge>}
  actions={[
    { key: "view", label: "View", onClick: handleView },
    { key: "edit", label: "Edit", onClick: handleEdit, variant: "primary" }
  ]}
  tabs={[
    { key: "tab1", label: "Tab 1" },
    { key: "tab2", label: "Tab 2" }
  ]}
  activeTabKey="tab1"
  onTabChange={handleTabChange}
  size="M"
  variant="outlined"
  hoverable
>
  Card body content here
</Card>
```

**After**:
```tsx
<Card variant="outlined" size="md" isHoverable>
  <Card.Header
    title="Feature Card"
    titleLevel={2}
    subtitle="Subtitle text"
    description="Description text"
    icon={<Icon name="star" />}
    badge={<Badge>New</Badge>}
  />
  <Card.Tabs
    tabs={[
      { key: "tab1", label: "Tab 1" },
      { key: "tab2", label: "Tab 2" }
    ]}
    activeTab="tab1"
    onTabChange={handleTabChange}
  />
  <Card.Body>
    Card body content here
  </Card.Body>
  <Card.Footer
    actions={[
      { key: "view", label: "View", onClick: handleView },
      { key: "edit", label: "Edit", onClick: handleEdit, variant: "primary" }
    ]}
  />
</Card>
```

**Migration Strategy**:
1. Create new composition components (`Card.Header`, `Card.Body`, etc.)
2. Keep old flat API for 1-2 minor versions with deprecation warnings
3. Provide codemod to auto-migrate (complex, may need manual review)
4. Remove old API in v3.0.0

**Impact**: ~10-15 files using Card component

---

### Migration Tooling

#### Codemod Script (TypeScript AST transformation)

Create `scripts/migrate-v2.ts` using jscodeshift:

```typescript
// Example codemod for Button changes
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename disabled → isDisabled
  root
    .find(j.JSXAttribute, { name: { name: 'disabled' } })
    .filter(path => {
      const element = path.parent.value.name.name;
      return ['Button', 'Input', 'Select'].includes(element);
    })
    .forEach(path => {
      path.value.name.name = 'isDisabled';
    });

  // Rename size values: s → sm, m → md, l → lg
  root
    .find(j.JSXAttribute, { name: { name: 'size' } })
    .forEach(path => {
      const value = path.value.value;
      if (value.type === 'StringLiteral') {
        const sizeMap = { s: 'sm', m: 'md', l: 'lg', S: 'sm', M: 'md', L: 'lg' };
        if (sizeMap[value.value]) {
          value.value = sizeMap[value.value];
        }
      }
    });

  // Remove submits prop, add type="submit"
  root
    .find(j.JSXElement, { openingElement: { name: { name: 'Button' } } })
    .forEach(path => {
      const attrs = path.value.openingElement.attributes;
      const submitsAttr = attrs.find(a => a.name?.name === 'submits');
      if (submitsAttr) {
        // Remove submits
        const index = attrs.indexOf(submitsAttr);
        attrs.splice(index, 1);
        // Add type="submit"
        attrs.push(
          j.jsxAttribute(j.jsxIdentifier('type'), j.stringLiteral('submit'))
        );
      }
    });

  return root.toSource();
}
```

**Usage**:
```bash
npx jscodeshift -t scripts/migrate-v2.ts nextjs-app/shared/components/**/*.tsx
npx jscodeshift -t scripts/migrate-v2.ts app/**/*.tsx
```

#### Manual Migration Checklist

For changes that can't be automated:

**Button**:
- [ ] Replace `accessibleName` with `aria-label`
- [ ] Replace `accessibleDescription` with `aria-describedby="id"` (requires creating ID)
- [ ] Replace `variant="error"` with `severity="error"`
- [ ] Remove `tooltip` prop, use external Tooltip component

**Select**:
- [ ] Remove duplicate `onChange` handlers (review which one to keep)
- [ ] Verify `onValueChange` is used correctly

**Card**:
- [ ] Refactor to composition API (Card.Header, Card.Body, etc.)
- [ ] Review nested config objects, flatten to component props

#### TypeScript Migration Types

Create compatibility types for gradual migration:

```typescript
// shared/components/Button/Button.types.v1-compat.ts
export interface ButtonPropsV1 {
  /** @deprecated Use isDisabled */
  disabled?: boolean;
  /** @deprecated Use isLoading */
  loading?: boolean;
  /** @deprecated Use type="submit" */
  submits?: boolean;
  /** @deprecated Use aria-label */
  accessibleName?: string;
}

// Merge for backwards compat during v1.x
export type ButtonPropsCompat = ButtonProps & ButtonPropsV1;
```

---

### Rollout Schedule

| Version | Date | Changes | Breaking? |
|---------|------|---------|-----------|
| **v1.0.0** | Current | Existing API | ❌ No |
| **v1.1.0** | Week 2 | Add new props (dual support), deprecation warnings | ❌ No |
| **v1.2.0** | Week 4 | Documentation updates, migration guide | ❌ No |
| **v2.0.0-beta.1** | Week 6 | Breaking changes (Select, Button critical fixes) | ✅ Yes |
| **v2.0.0** | Week 8 | All breaking changes except Card | ✅ Yes |
| **v2.1.0** | Week 12 | Card composition refactor | ✅ Yes (Card only) |
| **v3.0.0** | Week 16+ | Remove all deprecated props, clean slate | ✅ Yes |

**Deprecation Policy**:
- New props available in v1.1.0
- Old props deprecated but functional in v1.x (with warnings)
- Old props removed in v2.0.0
- Card refactor may go into v2.1.0 or wait for v3.0.0

---

## 7. Open Questions & Risks

### Open Questions

1. **Native `disabled` vs `isDisabled` for Input/Select**
   - **Question**: Should we alias native `disabled` attribute or replace it?
   - **Risk**: Replacing native attributes may break form libraries (React Hook Form, Formik)
   - **Recommendation**: Keep native `disabled` accessible, add `isDisabled` as alias that maps to native attribute
   - **Decision needed**: User preference on strict consistency vs native compatibility

2. **Icon string support in Button**
   - **Question**: Should Button accept icon name strings (e.g., `icon="spinner-gap"`)?
   - **Current**: Button supports both `React.ReactNode` and `string`
   - **Proposed**: Remove string support, require `<Icon name="spinner-gap" />`
   - **Trade-off**: String support is convenient but creates tight coupling to icon library
   - **Decision needed**: DX convenience vs loose coupling

3. **Card migration strategy**
   - **Question**: Should Card refactor happen in v2.0.0 or v3.0.0?
   - **Impact**: Card is heavily used (~10-15 files), composition refactor is high-effort
   - **Option A**: Include in v2.0.0 (bigger breaking change, all at once)
   - **Option B**: Delay to v3.0.0 (spread breaking changes over time)
   - **Decision needed**: Timeline and team capacity

4. **Size variant extensibility**
   - **Question**: Should we add `xs` and `xl` sizes now or wait for demand?
   - **Current proposal**: `sm | md | lg`
   - **Extended**: `xs | sm | md | lg | xl`
   - **Trade-off**: More options vs complexity
   - **Decision needed**: Minimal viable set vs future-proofing

5. **Codemod coverage**
   - **Question**: Which changes require manual review vs automated codemod?
   - **Automated**: Prop renames, size value changes
   - **Manual**: `accessibleName` → `aria-label` (may need ID creation for describedby)
   - **Decision needed**: Level of automation vs safety

### Risks

#### 🔴 High Risk

1. **Breaking production apps**
   - **Risk**: v2.0.0 changes break existing usage in ~50-70 files
   - **Mitigation**:
     - Thorough testing of codemod on sample files
     - Beta release with early adopters
     - Comprehensive migration guide with before/after examples
     - Runtime warnings in v1.x to surface usage before upgrade

2. **Select onChange removal**
   - **Risk**: Some files may use `onChange`, others `onValueChange`, removing one breaks half
   - **Mitigation**:
     - Audit all Select usage before v2.0.0
     - Create compatibility shim in v1.x that accepts both (with warning)
     - Codemod to standardize all usage to `onValueChange`

3. **Form library compatibility**
   - **Risk**: React Hook Form, Formik expect native `disabled`, `onChange` on inputs
   - **Mitigation**:
     - Keep native attributes accessible via spread props
     - Test integration with major form libraries before release
     - Document integration patterns in migration guide

#### 🟡 Medium Risk

4. **TypeScript compilation errors**
   - **Risk**: Prop renames cause 100+ TypeScript errors across codebase
   - **Mitigation**:
     - Run TypeScript in strict mode on sample files before rollout
     - Fix type definitions first, then runtime implementation
     - Provide clear error messages in migration guide

5. **Visual regression**
   - **Risk**: Size changes (`s` → `sm`) may have different pixel values
   - **Mitigation**:
     - Ensure size mapping is 1:1 (no visual changes)
     - Run visual regression tests on Storybook before release
     - Document any intentional visual changes

6. **Developer confusion during transition**
   - **Risk**: v1.x supports both old and new props, unclear which to use
   - **Mitigation**:
     - Clear deprecation warnings in console
     - Update Storybook examples to use new props immediately
     - Lint rules to flag deprecated props

#### 🟢 Low Risk

7. **Documentation lag**
   - **Risk**: Docs outdated during transition period
   - **Mitigation**:
     - Update docs in same PR as code changes
     - Generate API docs from TypeScript interfaces (automated)
     - Versioned docs (v1 docs vs v2 docs)

8. **Third-party component compatibility**
   - **Risk**: External libraries may expect specific prop names
   - **Mitigation**:
     - Audit external integrations before v2.0.0
     - Provide adapter wrappers if needed

---

## 8. Appendix

### A. Component Inventory (Full List)

| # | Component | Schema | Stories | Props Count | Category |
|---|-----------|--------|---------|-------------|----------|
| 1 | Accordion | ✅ | ✅ | 6 | Interaction |
| 2 | Avatar | ✅ | ✅ | 7 | Display |
| 3 | Badge | ✅ | ✅ | 6 | Display |
| 4 | Breadcrumb | ✅ | ✅ | 4 | Navigation |
| 5 | Button | ✅ | ✅ | 15 | Input |
| 6 | Card | ✅ | ✅ | 40+ | Container |
| 7 | Checkbox | ✅ | ✅ | 6 | Input |
| 8 | CheckboxGroup | ✅ | ✅ | 8 | Input |
| 9 | CodeSnippet | ✅ | ✅ | 8 | Display |
| 10 | FileUpload | ✅ | ✅ | 10 | Input |
| 11 | HelperText | ✅ | ✅ | 4 | Typography |
| 12 | ImagePlaceholder | ✅ | ✅ | 5 | Display |
| 13 | Input | ✅ | ✅ | 7 | Input |
| 14 | Label | ✅ | ✅ | 5 | Typography |
| 15 | Link | ✅ | ✅ | 7 | Navigation |
| 16 | List | ✅ | ✅ | 5 | Display |
| 17 | Modal | ✅ | ✅ | 13 | Overlay |
| 18 | PhoneInput | ✅ | ✅ | 9 | Input |
| 19 | Select | ✅ | ✅ | 7 | Input |
| 20 | SplitButton | ✅ | ✅ | 12 | Input |
| 21 | Switch | ✅ | ✅ | 6 | Input |
| 22 | Tabs | ✅ | ✅ | 7 | Navigation |
| 23 | Text | ✅ | ✅ | 6 | Typography |
| 24 | Title | ✅ | ✅ | 8 | Typography |
| 25 | Toast | ✅ | ✅ | 4 | Feedback |

**Total**: 24 components (25 with SplitButton variant)
**Schema Coverage**: 100%
**Storybook Coverage**: 100%

---

### B. Severity Classification

| Severity | Count | Components |
|----------|-------|------------|
| 🔴 Critical | 3 | Select (dual onChange), Button (submits), Button (ARIA) |
| 🟡 High | 7 | Event handlers, boolean naming, size variants, variant split, ARIA consistency |
| 🟢 Medium | 3 | Card complexity, controlled/uncontrolled, variant naming |
| 🔵 Low | 2 | Accessibility naming, loading customization |

**Total Issues**: 15 across 24 components

---

### C. Files Requiring Changes (Estimated)

| Change Category | Files Affected | Effort |
|----------------|----------------|--------|
| Select onChange removal | ~5-10 files | High |
| Button submits/ARIA | ~15-20 files | High |
| Boolean prop renames (disabled, loading, etc.) | ~40-50 files | Medium |
| Event handler renames (onChange → onValueChange) | ~20-30 files | Medium |
| Size value changes (s→sm, m→md, l→lg) | ~30-40 files | Low (automated) |
| Variant split (variant → severity) | ~10-15 files | Medium |
| Card composition refactor | ~10-15 files | Very High |

**Total Files**: ~50-70 unique files across all changes
**Automation Potential**: ~60% via codemod, ~40% manual review

---

### D. References

**Component Generation Rules**: `/Users/petrilahdelma/SAPDevelop/digitaltableteur/docs/LLM_COMPONENT_GENERATION_RULES.md`

**Key Sections**:
- Section 2.4: CSS Modules & Styling Rules → Informs size/variant naming
- Section 3: Component API Design → Prop interface patterns
- Section 4: i18n Requirements → Start/end directional naming
- Section 6: Accessibility → ARIA attribute usage
- Section 10: Component File Structure → 5-file requirement

**Task Specification**: `/Users/petrilahdelma/SAPDevelop/digitaltableteur/docs/AGENTIC-TASK-30TH-DEC.md`

**Agent Analysis**:
- Component Schema Inventory (agent ada96cc)
- Prop Naming Patterns Analysis (previous session)
- TypeScript Interface Extraction (agent ada96cc)
- Real Usage Examples (agent a335bbd)

---

**End of Design System API Review**
