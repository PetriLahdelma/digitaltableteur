# Phase 05-2: Form Components Enhancement

> **Phase**: 05 (Core UI Components)
> **Plan**: 2 of 2
> **Status**: Ready
> **Estimated Tasks**: 8

---

## Objective

Create Tailwind-first form components with consistent styling, accessibility, and validation patterns. Build on existing shadcn/ui form primitives while adding enhanced variants.

**Deliverables:**
1. FormField wrapper with label and error states
2. Enhanced Input with icons and clear button
3. Enhanced Textarea with character count
4. Select wrapper with custom styling
5. Form utilities and patterns

---

## Existing Infrastructure

shadcn/ui provides base form primitives:
- `Input` — Basic text input
- `Textarea` — Multi-line text
- `Select` — Dropdown selection
- `Checkbox` — Boolean input
- `Switch` — Toggle
- `Label` — Form labels

**What's missing:**
- Integrated FormField (label + input + helper + error)
- Input variants (with icons, clear button)
- Character counting for Textarea
- Consistent error/helper text patterns

---

## Context

**Files to read before executing:**

```
components/ui/input.tsx                           # shadcn/ui input
components/ui/textarea.tsx                        # shadcn/ui textarea
components/ui/select.tsx                          # shadcn/ui select
components/ui/label.tsx                           # shadcn/ui label
nextjs-app/shared/components/Inputs/Inputs.tsx   # Existing input (reference)
nextjs-app/shared/components/HelperText/         # Helper text component
```

---

## Tasks

### Task 1: Create FormField Component
**Action**: Create wrapper that combines label, input, helper text, and error

**Create folder**: `nextjs-app/shared/components/FormField/`

```typescript
// FormField.tsx
"use client";

import { type ReactNode, useId } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function FormField({
  label,
  children,
  error,
  helperText,
  required,
  disabled,
  className,
  id: propId,
}: FormFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className={cn(
          "font-body text-text-s font-medium",
          disabled && "opacity-50"
        )}
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden>*</span>
        )}
      </Label>

      {/* Children should be Input, Textarea, or Select with id prop */}
      {children}

      {error && (
        <p
          id={errorId}
          className="font-body text-text-s text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}

      {helperText && !error && (
        <p
          id={helperId}
          className="font-body text-text-s text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
```

Create `index.ts` barrel export.

**Verification**: FormField renders label, input slot, and error/helper text

---

### Task 2: Create TextInput Component
**Action**: Create enhanced input with icon slots and clear button

**Create folder**: `nextjs-app/shared/components/TextInput/`

```typescript
// TextInput.tsx
"use client";

import { forwardRef, type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "@phosphor-icons/react";

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  error?: boolean;
}

const sizeClasses = {
  sm: "h-8 px-3 text-text-s",
  md: "h-10 px-4 text-text-m",
  lg: "h-12 px-5 text-text-l",
} as const;

const iconSizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
} as const;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      size = "md",
      startIcon,
      endIcon,
      clearable,
      onClear,
      error,
      className,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value ?? "");
    const displayValue = value ?? internalValue;
    const hasValue = Boolean(displayValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = () => {
      setInternalValue("");
      onClear?.();
    };

    return (
      <div className="relative">
        {startIcon && (
          <span
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
              iconSizeClasses[size]
            )}
          >
            {startIcon}
          </span>
        )}

        <input
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "w-full rounded-md border border-input bg-background font-body",
            "transition-colors placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive",
            sizeClasses[size],
            startIcon && "pl-10",
            (endIcon || clearable) && "pr-10",
            className
          )}
          {...props}
        />

        {(endIcon || (clearable && hasValue)) && (
          <span
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              iconSizeClasses[size]
            )}
          >
            {clearable && hasValue ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Clear input"
              >
                <X className={iconSizeClasses[size]} />
              </button>
            ) : (
              <span className="text-muted-foreground">{endIcon}</span>
            )}
          </span>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
```

Create `index.ts` barrel export.

**Verification**: TextInput renders with icons and clear button

---

### Task 3: Create TextArea Component
**Action**: Create enhanced textarea with character count

**Create folder**: `nextjs-app/shared/components/TextArea/`

```typescript
// TextArea.tsx
"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  error?: boolean;
}

const sizeClasses = {
  sm: "min-h-[80px] px-3 py-2 text-text-s",
  md: "min-h-[120px] px-4 py-3 text-text-m",
  lg: "min-h-[160px] px-5 py-4 text-text-l",
} as const;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      size = "md",
      showCount,
      maxLength,
      error,
      className,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value ?? "");
    const displayValue = value ?? internalValue;
    const charCount = String(displayValue).length;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            "w-full rounded-md border border-input bg-background font-body resize-y",
            "transition-colors placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive",
            showCount && "pb-8",
            sizeClasses[size],
            className
          )}
          {...props}
        />

        {showCount && (
          <span
            className={cn(
              "absolute bottom-2 right-3 font-body text-text-s text-muted-foreground",
              maxLength && charCount >= maxLength && "text-destructive"
            )}
          >
            {charCount}
            {maxLength && `/${maxLength}`}
          </span>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
```

Create `index.ts` barrel export.

**Verification**: TextArea shows character count when enabled

---

### Task 4: Create FormGroup Component
**Action**: Create grouped form fields with consistent spacing

**Create folder**: `nextjs-app/shared/components/FormGroup/`

```typescript
// FormGroup.tsx
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FormGroupProps {
  children: ReactNode;
  legend?: string;
  description?: string;
  className?: string;
}

export function FormGroup({
  children,
  legend,
  description,
  className,
}: FormGroupProps) {
  return (
    <fieldset className={cn("space-y-4", className)}>
      {legend && (
        <legend className="font-heading text-title-s font-semibold mb-2">
          {legend}
        </legend>
      )}
      {description && (
        <p className="font-body text-text-s text-muted-foreground -mt-1 mb-4">
          {description}
        </p>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </fieldset>
  );
}
```

Create `index.ts` barrel export.

**Verification**: FormGroup renders with legend and grouped fields

---

### Task 5: Create CheckboxField Component
**Action**: Create labeled checkbox with description

**Create folder**: `nextjs-app/shared/components/CheckboxField/`

```typescript
// CheckboxField.tsx
"use client";

import { type ReactNode, useId } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface CheckboxFieldProps {
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export function CheckboxField({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  required,
  error,
  className,
  id: propId,
}: CheckboxFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  return (
    <div className={cn("flex gap-3", className)}>
      <Checkbox
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-invalid={!!error}
        className="mt-0.5"
      />
      <div className="space-y-1">
        <Label
          htmlFor={id}
          className={cn(
            "font-body text-text-m leading-none cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-hidden>*</span>
          )}
        </Label>
        {description && (
          <p className="font-body text-text-s text-muted-foreground">
            {description}
          </p>
        )}
        {error && (
          <p className="font-body text-text-s text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
```

Create `index.ts` barrel export.

**Verification**: CheckboxField renders with label and description

---

### Task 6: Update UI Barrel Export with Form Components
**Action**: Add form components to the UI barrel export

**Edit**: `nextjs-app/shared/components/ui/index.ts`

Add form component exports:

```typescript
// Form components
export { FormField, type FormFieldProps } from "../FormField";
export { FormGroup, type FormGroupProps } from "../FormGroup";
export { TextInput, type TextInputProps } from "../TextInput";
export { TextArea, type TextAreaProps } from "../TextArea";
export { CheckboxField, type CheckboxFieldProps } from "../CheckboxField";
```

**Verification**: All form components importable from ui barrel

---

### Task 7: Add Form Components Demo to TailwindTest
**Action**: Extend TailwindTest with form components showcase

**Edit**: `nextjs-app/shared/components/TailwindTest/TailwindTest.tsx`

Add new section after UI Components Demo:

```typescript
// Add imports
import { FormField, FormGroup, TextInput, TextArea, CheckboxField } from "../ui";
import { MagnifyingGlass, EnvelopeSimple } from "@phosphor-icons/react";

// Add new section:
{/* Form Components Demo - Phase 05-2 */}
<div className="mt-8 pt-8 border-t border-border">
  <h3 className="font-heading text-title-m font-bold mb-6">
    Form Components
  </h3>

  <Stack gap="lg">
    {/* TextInput variants */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">TextInput:</p>
      <Stack gap="md">
        <FormField label="Search" helperText="Type to search...">
          <TextInput
            placeholder="Search..."
            startIcon={<MagnifyingGlass />}
            clearable
          />
        </FormField>
        <FormField label="Email" required error="Please enter a valid email">
          <TextInput
            type="email"
            placeholder="you@example.com"
            startIcon={<EnvelopeSimple />}
            error
          />
        </FormField>
      </Stack>
    </div>

    {/* TextArea */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">TextArea:</p>
      <FormField label="Message" helperText="Max 280 characters">
        <TextArea
          placeholder="Write your message..."
          showCount
          maxLength={280}
        />
      </FormField>
    </div>

    {/* CheckboxField */}
    <div className="bg-muted/30 p-4 rounded-sm">
      <p className="font-body text-text-s text-muted-foreground mb-2">CheckboxField:</p>
      <FormGroup>
        <CheckboxField
          label="Accept terms and conditions"
          description="By checking this box, you agree to our Terms of Service"
          required
        />
        <CheckboxField
          label="Subscribe to newsletter"
          description="Receive updates about new features and tips"
        />
      </FormGroup>
    </div>
  </Stack>

  <div className="mt-6 p-4 bg-muted/50 rounded-sm">
    <p className="font-body text-text-s">
      <strong className="font-heading">Form Stack:</strong> FormField, FormGroup, TextInput, TextArea, CheckboxField
    </p>
  </div>
</div>
```

**Verification**: Navigate to TailwindTest, form components display correctly

---

### Task 8: Verify and Test
**Action**: Run dev server and verify all functionality

**Commands**:
```bash
npm run dev
npm run typecheck
npm run lint
```

**Manual Testing**:
1. Open TailwindTest page — form components render
2. TextInput with icons works
3. TextInput clearable button works
4. TextArea character count works
5. FormField error states display correctly
6. CheckboxField is accessible

**Verification Checklist**:
- [ ] FormField component works
- [ ] TextInput component works (icons, clear)
- [ ] TextArea component works (character count)
- [ ] FormGroup component works
- [ ] CheckboxField component works
- [ ] Error states display correctly
- [ ] Barrel export works
- [ ] No TypeScript errors
- [ ] No console warnings

---

## Success Criteria

- [ ] FormField component created
- [ ] TextInput component created
- [ ] TextArea component created
- [ ] FormGroup component created
- [ ] CheckboxField component created
- [ ] Barrel export updated
- [ ] Demo added to TailwindTest
- [ ] TypeScript compiles without errors

---

## Output

After completion:
1. Commit each component individually
2. Update `.planning/STATE.md` to mark Phase 05 complete
3. Run `/gsd:verify-work` to test all components

---

## Notes

- **shadcn/ui integration**: Builds on existing shadcn/ui primitives
- **Accessible**: All components include proper ARIA attributes
- **Validation-ready**: Error states built-in
- **Consistent patterns**: FormField establishes reusable pattern

---

*Plan created: 2026-01-14*
*Execute with `/gsd:execute-plan 05-2`*
