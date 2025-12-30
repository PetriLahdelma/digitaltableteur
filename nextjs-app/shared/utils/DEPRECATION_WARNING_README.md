# Deprecation Warning Utility

A comprehensive utility for managing deprecated component props and providing clear migration guidance to developers using the Digitaltableteur design system.

## Overview

The deprecation warning utility provides three main functions for handling deprecated props:

- **`warnDeprecated()`** - General deprecation warnings with custom messages
- **`warnPropRename()`** - Shorthand for simple prop renames
- **`warnPropRemoved()`** - Warnings for completely removed props with workarounds

### Key Features

- **Single warning per session**: Each deprecated prop is only warned about once per browser session, reducing console spam
- **Development-only**: Warnings are only shown in development mode (`process.env.NODE_ENV === 'development'`)
- **Colored output**: Console warnings use styled formatting for better visibility
- **Clear guidance**: Each warning includes:
  - Component name and prop name
  - Replacement suggestion (if applicable)
  - Links to migration guides
  - Additional context (removal timeline, etc.)

## Installation

The utility is already part of the shared components library. Import it directly:

```typescript
import {
  warnDeprecated,
  warnPropRename,
  warnPropRemoved,
} from "@/nextjs-app/shared/utils/deprecationWarning";
```

## API Reference

### `warnDeprecated(componentName, oldProp, newProp, additionalContext?)`

Shows a deprecation warning when a prop is renamed or replaced.

**Parameters:**

- `componentName` (string): Name of the component (e.g., 'Button')
- `oldProp` (string): The deprecated prop name
- `newProp` (string): The new prop name to use instead
- `additionalContext` (string, optional): Additional context like removal timeline

**Example:**

```typescript
if (disabled !== undefined && isDisabled === undefined) {
  warnDeprecated(
    'Button',
    'disabled',
    'isDisabled',
    'Will be removed in v2.0.0'
  );
}
```

**Console Output:**

```
⚠️  [Button] Prop "disabled" is deprecated and will be removed in v2.0.0
   → Use "isDisabled" instead
   ℹ️  Will be removed in v2.0.0
   📖 Migration guide: https://github.com/.../docs/MIGRATION_GUIDE.md#button-props
```

### `warnPropRename(componentName, oldProp, newProp)`

Shorthand for renaming a prop. Automatically adds "Will be removed in v2.0.0" context.

**Parameters:**

- `componentName` (string): Name of the component
- `oldProp` (string): The deprecated prop name
- `newProp` (string): The new prop name

**Example:**

```typescript
if (icon !== undefined && startIcon === undefined) {
  warnPropRename('Card', 'icon', 'startIcon');
}
```

**Console Output:**

```
⚠️  [Card] Prop "icon" is deprecated and will be removed in v2.0.0
   → Use "startIcon" instead
   ℹ️  Will be removed in v2.0.0
   📖 Migration guide: https://github.com/.../docs/MIGRATION_GUIDE.md#card-props
```

### `warnPropRemoved(componentName, oldProp, replacement)`

Warns about a completely removed prop with suggested workaround.

**Parameters:**

- `componentName` (string): Name of the component
- `oldProp` (string): The removed prop name
- `replacement` (string): Description of the replacement or workaround

**Example:**

```typescript
if (colorScheme !== undefined) {
  warnPropRemoved(
    'Select',
    'colorScheme',
    'Use external CSS modules to style the component instead'
  );
}
```

**Console Output:**

```
⚠️  [Select] Prop "colorScheme" has been removed
   → Use external CSS modules to style the component instead
   📖 Migration guide: https://github.com/.../docs/MIGRATION_GUIDE.md#select-props
```

### Utility Functions

#### `clearTrackedWarnings()`

Clears all tracked warnings. Useful for testing.

```typescript
import { clearTrackedWarnings } from "@/nextjs-app/shared/utils/deprecationWarning";

clearTrackedWarnings();
```

#### `getTrackedWarnings()`

Returns a copy of currently tracked warnings. Useful for testing and debugging.

```typescript
import { getTrackedWarnings } from "@/nextjs-app/shared/utils/deprecationWarning";

const warnings = getTrackedWarnings();
console.log(warnings.size); // Number of unique warnings shown
```

## Usage Patterns

### Pattern 1: Simple Prop Rename

For basic prop renames where the old prop should be replaced with a new one:

```typescript
interface MyComponentProps {
  /** @deprecated Use `isActive` instead. Will be removed in v2.0.0 */
  active?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
}

const MyComponent: React.FC<MyComponentProps> = ({
  active,
  isActive,
  children,
}) => {
  if (active !== undefined && isActive === undefined) {
    warnPropRename('MyComponent', 'active', 'isActive');
  }

  const actualIsActive = isActive ?? active ?? false;

  return (
    <div className={actualIsActive ? 'active' : ''}>
      {children}
    </div>
  );
};
```

### Pattern 2: Multiple Deprecated Props

When a component has several deprecated props:

```typescript
interface ModalProps {
  /** @deprecated Use `isOpen` instead. Will be removed in v2.0.0 */
  open?: boolean;
  isOpen?: boolean;

  /** @deprecated Use `onClose` instead. Will be removed in v2.0.0 */
  onDismiss?: () => void;
  onClose?: () => void;

  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  open,
  isOpen,
  onDismiss,
  onClose,
  title,
  children,
}) => {
  // Each deprecated prop is tracked separately
  if (open !== undefined && isOpen === undefined) {
    warnPropRename('Modal', 'open', 'isOpen');
  }

  if (onDismiss !== undefined && onClose === undefined) {
    warnPropRename('Modal', 'onDismiss', 'onClose');
  }

  const actualIsOpen = isOpen ?? open ?? false;
  const actualOnClose = onClose ?? onDismiss ?? (() => {});

  // Component implementation...
};
```

### Pattern 3: Removed Props with Workaround

When a prop has been completely removed but there's a migration path:

```typescript
interface SelectProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value: string) => void;
  /** @deprecated Removed in favor of CSS styling */
  colorScheme?: 'light' | 'dark';
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  colorScheme,
}) => {
  if (colorScheme !== undefined) {
    warnPropRemoved(
      'Select',
      'colorScheme',
      'Use CSS Modules or Tailwind classes to style the select. See STYLING_GUIDE.md#select for examples.'
    );
  }

  // Component implementation...
};
```

### Pattern 4: In Custom Hooks

You can also use deprecation warnings in custom hooks:

```typescript
interface UseAnimationOptions {
  /** @deprecated Use `duration` instead. Will be removed in v2.0.0 */
  animationTime?: number;
  duration?: number;
  easing?: string;
}

export const useAnimation = (options: UseAnimationOptions = {}) => {
  const { animationTime, duration, easing = 'ease-in-out' } = options;

  if (animationTime !== undefined && duration === undefined) {
    warnDeprecated(
      'useAnimation',
      'animationTime',
      'duration',
      'This hook parameter was renamed for clarity'
    );
  }

  const actualDuration = duration ?? animationTime ?? 300;

  return {
    style: {
      transition: `all ${actualDuration}ms ${easing}`,
    },
  };
};
```

## Best Practices

### 1. Always Check Environment

The utility automatically checks `process.env.NODE_ENV`, so warnings only show in development. No need for manual environment checks:

```typescript
// ✓ Good - the utility handles environment checking
if (disabled !== undefined && isDisabled === undefined) {
  warnDeprecated('Button', 'disabled', 'isDisabled');
}

// ✗ Avoid - unnecessary environment check
if (process.env.NODE_ENV === 'development' && disabled !== undefined) {
  warnDeprecated('Button', 'disabled', 'isDisabled');
}
```

### 2. Track Props Independently

If a component has multiple deprecated props, warn about each one separately. This allows users to see all deprecations, not just the first one:

```typescript
// ✓ Good - independent warnings
if (oldProp1 !== undefined && newProp1 === undefined) {
  warnPropRename('Component', 'oldProp1', 'newProp1');
}

if (oldProp2 !== undefined && newProp2 === undefined) {
  warnPropRename('Component', 'oldProp2', 'newProp2');
}

// ✗ Avoid - single warning hides other deprecations
if ((oldProp1 !== undefined || oldProp2 !== undefined)) {
  warnDeprecated('Component', 'oldProps', 'newProps');
}
```

### 3. Use JSDoc Deprecation Comments

Always document deprecated props in JSDoc comments:

```typescript
interface ButtonProps {
  /** @deprecated Use `isDisabled` instead. Will be removed in v2.0.0 */
  disabled?: boolean;
  /** The disabled state of the button */
  isDisabled?: boolean;
  // ... other props
}
```

### 4. Provide Clear Migration Paths

Include helpful context in deprecation warnings:

```typescript
// ✓ Good - clear guidance
warnDeprecated(
  'Button',
  'disabled',
  'isDisabled',
  'This matches semantic naming conventions. See MIGRATION_GUIDE.md#prop-naming'
);

// ✗ Avoid - vague warnings
warnDeprecated('Button', 'disabled', 'isDisabled');
```

### 5. Link to Migration Guides

Always reference specific sections in migration documentation:

```typescript
// The utility automatically links to:
// https://github.com/.../docs/MIGRATION_GUIDE.md#button-props
warnPropRename('Button', 'disabled', 'isDisabled');
```

## Testing

The utility includes comprehensive test coverage. When testing components with deprecated props:

```typescript
import { clearTrackedWarnings, getTrackedWarnings } from "@/nextjs-app/shared/utils/deprecationWarning";

describe('MyComponent', () => {
  beforeEach(() => {
    // Clear warnings before each test
    clearTrackedWarnings();
  });

  it('warns when using deprecated prop', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    render(<MyComponent active={true} />);

    // Verify warning was shown
    expect(consoleSpy).toHaveBeenCalled();
    expect(getTrackedWarnings().size).toBe(1);

    consoleSpy.mockRestore();
  });

  it('does not warn when using new prop', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    render(<MyComponent isActive={true} />);

    // Verify no warning was shown
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(getTrackedWarnings().size).toBe(0);

    consoleSpy.mockRestore();
  });
});
```

## Migration Checklist

When deprecating a prop:

1. **Add deprecation warning** to the component
2. **Update JSDoc** with `@deprecated` comment
3. **Maintain backward compatibility** during deprecation period (typically v1.x)
4. **Update migration guide** at `docs/MIGRATION_GUIDE.md`
5. **Communicate timeline** (e.g., "Will be removed in v2.0.0")
6. **Test with deprecated props** to ensure warnings work
7. **Update Storybook stories** to show the new prop pattern
8. **Document in changelog** when releasing

## Environment Configuration

The utility respects the `NODE_ENV` environment variable:

- **Development**: Warnings are shown
- **Production**: Warnings are suppressed
- **Testing**: Warnings can be controlled with `clearTrackedWarnings()`

## File Structure

```
nextjs-app/shared/utils/
├── deprecationWarning.ts         # Main implementation
├── deprecationWarning.test.ts    # Comprehensive test suite (20 tests)
├── deprecationWarning.example.tsx # Usage examples
└── DEPRECATION_WARNING_README.md # This file
```

## Performance Considerations

- **Deduplication**: Each warning is only shown once per session, preventing console spam
- **Minimal overhead**: Development-only checks ensure no performance impact in production
- **Memory efficient**: Uses a Set to track warnings with minimal memory footprint

## Related Documentation

- **Component Generation Rules**: `docs/LLM_COMPONENT_GENERATION_RULES.md`
- **Migration Guide**: `docs/MIGRATION_GUIDE.md`
- **Styling Guide**: `docs/STYLING_GUIDE.md`
- **Component Examples**: `nextjs-app/shared/utils/deprecationWarning.example.tsx`

## Contributing

When adding new components or modifying existing ones:

1. Use deprecation warnings when changing prop names
2. Maintain backward compatibility during the deprecation period
3. Follow the patterns documented in this README
4. Ensure all deprecated props have tests
5. Update migration documentation

## FAQs

**Q: Will deprecated props be removed?**
A: Yes, typically in the next major version (v2.0.0). Timeline is provided in the warning message.

**Q: Can I suppress these warnings?**
A: No, these are development-only warnings. They don't affect production builds. In tests, use `clearTrackedWarnings()` if needed.

**Q: Why only warn once per session?**
A: This prevents console spam while ensuring developers are aware of the deprecation. The warning persists in the console for the entire session.

**Q: How do I report issues with deprecation warnings?**
A: Create a GitHub issue or contact the team via email. See the repository's CONTRIBUTING.md for details.

---

**Last Updated**: December 30, 2025
**Version**: 1.0.0
**Status**: Stable
