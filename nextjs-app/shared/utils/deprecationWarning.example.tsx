/**
 * Deprecation Warning Utility - Usage Examples
 *
 * This file demonstrates how to use the deprecation warning utilities
 * in component implementations.
 */

import React from "react";
import {
  warnDeprecated,
  warnPropRename,
  warnPropRemoved,
} from "./deprecationWarning";

/**
 * Example 1: Using warnDeprecated with a prop rename
 *
 * This is the most common use case - when you're renaming a prop and want to
 * warn users about the deprecation while supporting the old prop temporarily.
 */
export interface ButtonExampleProps {
  /** @deprecated Use `isDisabled` instead. Will be removed in v2.0.0 */
  disabled?: boolean;
  /** New disabled state prop */
  isDisabled?: boolean;
  children: React.ReactNode;
}

export const ButtonExample: React.FC<ButtonExampleProps> = ({
  disabled,
  isDisabled,
  children,
}) => {
  // Check if the old prop is being used without the new one
  if (disabled !== undefined && isDisabled === undefined) {
    warnDeprecated(
      "Button",
      "disabled",
      "isDisabled",
      "This prop will be removed in v2.0.0. Please use 'isDisabled' instead."
    );
  }

  // Use the new prop, falling back to the old one if provided
  const actualIsDisabled = isDisabled ?? disabled ?? false;

  return (
    <button disabled={actualIsDisabled}>
      {children}
    </button>
  );
};

/**
 * Example 2: Using warnPropRename for cleaner code
 *
 * When you have a simple prop rename, you can use the shorthand helper
 * which automatically adds "Will be removed in v2.0.0" context.
 */
export interface CardExampleProps {
  /** @deprecated Use `startIcon` instead. Will be removed in v2.0.0 */
  icon?: React.ReactNode;
  /** Icon displayed at the start of the card */
  startIcon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export const CardExample: React.FC<CardExampleProps> = ({
  icon,
  startIcon,
  title,
  children,
}) => {
  if (icon !== undefined && startIcon === undefined) {
    warnPropRename("Card", "icon", "startIcon");
  }

  const actualStartIcon = startIcon ?? icon;

  return (
    <div className="card">
      {actualStartIcon && <div className="card-icon">{actualStartIcon}</div>}
      <h2>{title}</h2>
      {children}
    </div>
  );
};

/**
 * Example 3: Using warnPropRemoved for removed props with workarounds
 *
 * When a prop has been completely removed and there's a recommended
 * workaround, use warnPropRemoved to guide users.
 */
export interface SelectExampleProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value: string) => void;
  /** @deprecated Removed in favor of CSS styling. Use external CSS modules instead. */
  colorScheme?: "light" | "dark";
}

export const SelectExample: React.FC<SelectExampleProps> = ({
  options,
  value,
  onChange,
  colorScheme,
}) => {
  if (colorScheme !== undefined) {
    warnPropRemoved(
      "Select",
      "colorScheme",
      "Use external CSS modules or Tailwind classes to style the select component instead. See docs/STYLING_GUIDE.md for examples."
    );
  }

  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select an option...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

/**
 * Example 4: Multiple deprecated props in a single component
 */
export interface ModalExampleProps {
  /** @deprecated Use `isOpen` instead. Will be removed in v2.0.0 */
  open?: boolean;
  /** Controls visibility of the modal */
  isOpen?: boolean;

  /** @deprecated Use `onClose` instead. Will be removed in v2.0.0 */
  onDismiss?: () => void;
  /** Called when the modal should be closed */
  onClose?: () => void;

  title: string;
  children: React.ReactNode;
}

export const ModalExample: React.FC<ModalExampleProps> = ({
  open,
  isOpen,
  onDismiss,
  onClose,
  title,
  children,
}) => {
  // Warn about each deprecated prop independently
  if (open !== undefined && isOpen === undefined) {
    warnPropRename("Modal", "open", "isOpen");
  }

  if (onDismiss !== undefined && onClose === undefined) {
    warnPropRename("Modal", "onDismiss", "onClose");
  }

  const actualIsOpen = isOpen ?? open ?? false;
  const actualOnClose = onClose ?? onDismiss ?? (() => {});

  if (!actualIsOpen) return null;

  return (
    <dialog open={actualIsOpen}>
      <h1>{title}</h1>
      {children}
      <button onClick={actualOnClose}>Close</button>
    </dialog>
  );
};

/**
 * Example 5: In custom hooks
 *
 * You can also use deprecation warnings in custom hooks to warn about
 * deprecated hook parameters.
 */
export interface UseDeprecatedAnimationOptions {
  /** @deprecated Use `duration` instead. Will be removed in v2.0.0 */
  animationTime?: number;
  /** Duration of the animation in milliseconds */
  duration?: number;
  easing?: string;
}

export const useDeprecatedAnimation = (
  options: UseDeprecatedAnimationOptions = {}
) => {
  const { animationTime, duration, easing = "ease-in-out" } = options;

  if (animationTime !== undefined && duration === undefined) {
    warnDeprecated(
      "useAnimation",
      "animationTime",
      "duration",
      "The hook parameter 'animationTime' has been renamed to 'duration'"
    );
  }

  const actualDuration = duration ?? animationTime ?? 300;

  return {
    style: {
      transition: `all ${actualDuration}ms ${easing}`,
    },
  };
};

/**
 * Example 6: Handling deprecated prop values
 *
 * You can also warn about deprecated values for existing props.
 */
export interface BadgeExampleProps {
  variant?: "primary" | "secondary" | "error" | "warning" | "info" | "deprecated-style";
  children: React.ReactNode;
}

export const BadgeExample: React.FC<BadgeExampleProps> = ({
  variant = "primary",
  children,
}) => {
  if (variant === "deprecated-style") {
    warnPropRemoved(
      "Badge",
      'variant="deprecated-style"',
      'Use variant="secondary" with custom CSS instead. See STYLING_GUIDE.md#badge-variants'
    );
  }

  return <span className={`badge badge-${variant}`}>{children}</span>;
};
