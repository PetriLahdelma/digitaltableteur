# Phase 2 (v2.0.0) - Breaking Changes

## Overview

Phase 2 removes all deprecated props that were marked for removal in v1.1.0. This is a **breaking change** that requires code updates.

## Migration Timeline

- **v1.0.0**: Original API
- **v1.1.0**: New props added, old props deprecated with warnings
- **v2.0.0**: Deprecated props removed (THIS VERSION)

## Breaking Changes by Component

### Checkbox

**REMOVED PROPS:**
- `checked` → Use `isChecked` instead
- `indeterminate` → Use `isIndeterminate` instead
- `disabled` → Use `isDisabled` instead

**Migration Example:**
```tsx
// ❌ v1.x (WILL BREAK)
<Checkbox checked={true} disabled={false} />

// ✅ v2.0.0
<Checkbox isChecked={true} isDisabled={false} />
```

### Switch

**REMOVED PROPS:**
- `checked` → Use `isChecked` instead
- `loading` → Use `isLoading` instead
- `disabled` → Use `isDisabled` instead

**Migration Example:**
```tsx
// ❌ v1.x (WILL BREAK)
<Switch checked={true} loading={false} disabled={false} />

// ✅ v2.0.0
<Switch isChecked={true} isLoading={false} isDisabled={false} />
```

### Toast

**REMOVED PROPS:**
- `open` → Use `isOpen` instead

**Migration Example:**
```tsx
// ❌ v1.x (WILL BREAK)
<Toast open={true} message="Hello" />

// ✅ v2.0.0
<Toast isOpen={true} message="Hello" />
```

### Tabs

**REMOVED PROPS:**
- `activeTabKey` → Use `activeTab` instead
- `defaultActiveTabKey` → Use `defaultActiveTab` instead

**Migration Example:**
```tsx
// ❌ v1.x (WILL BREAK)
<Tabs activeTabKey="tab1" defaultActiveTabKey="tab1" tabs={tabs} />

// ✅ v2.0.0
<Tabs activeTab="tab1" defaultActiveTab="tab1" tabs={tabs} />
```

### Modal

**REMOVED PROPS:**
- `variant` → Use `severity` or `isLoading` instead

**Migration Example:**
```tsx
// ❌ v1.x (WILL BREAK)
<Modal variant="success" />
<Modal variant="loading" />

// ✅ v2.0.0
<Modal severity="success" />
<Modal isLoading={true} />
```

## Automated Migration

You can use the following regex patterns to help with migration:

### Checkbox
```regex
checked={([^}]+)} → isChecked={$1}
indeterminate={([^}]+)} → isIndeterminate={$1}
disabled={([^}]+)} → isDisabled={$1}
```

### Switch
```regex
checked={([^}]+)} → isChecked={$1}
loading={([^}]+)} → isLoading={$1}
disabled={([^}]+)} → isDisabled={$1}
```

### Toast
```regex
open={([^}]+)} → isOpen={$1}
```

### Tabs
```regex
activeTabKey={([^}]+)} → activeTab={$1}
defaultActiveTabKey={([^}]+)} → defaultActiveTab={$1}
```

### Modal
```regex
variant="success" → severity="success"
variant="error" → severity="error"
variant="warning" → severity="warning"
variant="info" → severity="info"
variant="loading" → isLoading={true}
```

## Testing Your Migration

After updating your code, run:

```bash
npm run typecheck  # Verify TypeScript types
npm test           # Run all tests
npm run lint       # Check code style
```

## Need Help?

If you encounter issues during migration:

1. Check the component's TypeScript types for the exact prop names
2. Review the v1.1.0 deprecation warnings in your console
3. Refer to Storybook documentation for examples
4. File an issue if you find migration problems

## Rollback

If you need to rollback to v1.x:

```bash
npm install @digitaltableteur/components@^1.1.0
```

---

**Generated**: 2025-12-30
**Version**: 2.0.0
