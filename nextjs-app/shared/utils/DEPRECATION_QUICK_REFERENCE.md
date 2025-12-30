# Deprecation Warning - Quick Reference

A quick reference guide for using the deprecation warning utility in the Digitaltableteur design system.

## Import

```typescript
import {
  warnDeprecated,
  warnPropRename,
  warnPropRemoved,
  clearTrackedWarnings,
  getTrackedWarnings,
} from "@/nextjs-app/shared/utils/deprecationWarning";
```

## Three Main Functions

### 1. `warnPropRename()` - For simple renames (most common)

```typescript
// In your component
if (oldProp !== undefined && newProp === undefined) {
  warnPropRename('ComponentName', 'oldProp', 'newProp');
}

// Usage with fallback
const finalValue = newProp ?? oldProp ?? defaultValue;
```

**Console output:**
```
⚠️  [ComponentName] Prop "oldProp" is deprecated and will be removed in v2.0.0
   → Use "newProp" instead
   ℹ️  Will be removed in v2.0.0
   📖 Migration guide: https://github.com/.../docs/MIGRATION_GUIDE.md#componentname-props
```

### 2. `warnDeprecated()` - For custom messages

```typescript
warnDeprecated(
  'ComponentName',
  'oldProp',
  'newProp',
  'Custom context like removal date'
);
```

### 3. `warnPropRemoved()` - For removed props with workarounds

```typescript
if (removedProp !== undefined) {
  warnPropRemoved(
    'ComponentName',
    'removedProp',
    'Use CSS modules instead. See STYLING_GUIDE.md'
  );
}
```

## Component Pattern Template

```typescript
interface ComponentProps {
  /** @deprecated Use `newProp` instead. Will be removed in v2.0.0 */
  oldProp?: string;
  newProp?: string;
  // ... other props
}

const Component: React.FC<ComponentProps> = ({
  oldProp,
  newProp,
  ...props
}) => {
  // Warn about deprecated prop
  if (oldProp !== undefined && newProp === undefined) {
    warnPropRename('Component', 'oldProp', 'newProp');
  }

  // Use new prop, fall back to old one
  const finalValue = newProp ?? oldProp ?? 'default';

  // Rest of component...
};
```

## Features

- **Single warning per session**: Warnings only show once per browser session
- **Development-only**: Automatically skipped in production builds
- **Colored output**: Easy to spot in console
- **Unique tracking**: Each warning is tracked independently
- **No performance impact**: Production builds don't include warning code

## Testing Utilities

```typescript
import { clearTrackedWarnings, getTrackedWarnings } from "@/nextjs-app/shared/utils/deprecationWarning";

// In tests
beforeEach(() => {
  clearTrackedWarnings(); // Clear tracked warnings
});

it('warns about deprecated prop', () => {
  render(<Component oldProp="value" />);
  expect(getTrackedWarnings().size).toBe(1);
});
```

## Common Use Cases

### Use Case 1: Prop Rename
```typescript
if (disabled !== undefined && isDisabled === undefined) {
  warnPropRename('Button', 'disabled', 'isDisabled');
}
const isDisabledFinal = isDisabled ?? disabled ?? false;
```

### Use Case 2: Multiple Props
```typescript
if (open !== undefined && isOpen === undefined) {
  warnPropRename('Modal', 'open', 'isOpen');
}
if (onDismiss !== undefined && onClose === undefined) {
  warnPropRename('Modal', 'onDismiss', 'onClose');
}
```

### Use Case 3: Removed Prop
```typescript
if (colorScheme !== undefined) {
  warnPropRemoved(
    'Select',
    'colorScheme',
    'Use CSS Modules or className prop instead'
  );
}
```

### Use Case 4: Hook Parameter
```typescript
export const useMyHook = (options = {}) => {
  const { oldParam, newParam } = options;

  if (oldParam !== undefined && newParam === undefined) {
    warnPropRename('useMyHook', 'oldParam', 'newParam');
  }

  const finalValue = newParam ?? oldParam ?? 'default';
};
```

## Key Points

✓ **DO:**
- Check if old prop is defined AND new prop is undefined
- Warn about each deprecated prop independently
- Include context about removal timing
- Document in JSDoc with `@deprecated` comment
- Provide fallback using nullish coalescing operator

✗ **DON'T:**
- Warn multiple times for the same prop (utility handles this)
- Skip the environment check (utility handles this automatically)
- Forget to update migration documentation
- Mix multiple deprecations in one warning

## Files

- **Main**: `nextjs-app/shared/utils/deprecationWarning.ts` (244 lines)
- **Tests**: `nextjs-app/shared/utils/deprecationWarning.test.ts` (357 lines, 20 tests)
- **Examples**: `nextjs-app/shared/utils/deprecationWarning.example.tsx` (239 lines)
- **Docs**: `nextjs-app/shared/utils/DEPRECATION_WARNING_README.md` (comprehensive guide)

## Vitest Config

The utility is included in vitest config:
```
vitest.config.mts: include: ["nextjs-app/shared/utils/**/*.test.{ts,tsx}"]
```

Run tests:
```bash
SKIP_STORYBOOK_TESTS=1 npm test deprecationWarning.test.ts
```

## Coverage

- 20 tests covering all functions
- Tests for development/production modes
- Tests for deduplication logic
- Tests for warning tracking
- All tests passing ✓

---

**For detailed documentation, see**: `DEPRECATION_WARNING_README.md`
