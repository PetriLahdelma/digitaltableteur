"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import Button, { type ButtonProps } from "@dt/Button";

export interface IconButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  /** Icon glyph: a rendered element (e.g. <CaretRight />) or a Phosphor icon name (e.g. "x"). */
  icon: ReactNode | string;
  /** Accessible name when `aria-labelledby` is not set */
  label: string;
  /** Visual weight. @default "tertiary" */
  variant?: "primary" | "secondary" | "tertiary";
  /** Semantic colour, orthogonal to `variant`. @default "neutral" */
  tone?: ButtonProps["tone"];
  /** Surface the control sits on; prefer over color overrides on tinted bands. @default "default" */
  surface?: ButtonProps["surface"];
  size?: "sm" | "md" | "lg";
  /** Native tooltip text shown on hover; the `label` stays the accessible name. */
  tooltip?: string;
}

/**
 * Icon-only action control; `label` is required and becomes the accessible name.
 *
 * Delegates all styling to @dt/Button (rounded, icon-only form) — css-less by
 * design, so weight/tone/surface stay in lockstep with Button.
 *
 * `className` is applied on a wrapper span so Tailwind responsive utilities (e.g.
 * `lg:hidden`) are not overridden by @dt/Button CSS module `display: inline-flex`.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      variant = "tertiary",
      tone = "neutral",
      surface = "default",
      size = "md",
      tooltip,
      className,
      type = "button",
      "aria-labelledby": ariaLabelledBy,
      disabled,
      onClick,
      onBlur,
      onFocus,
      onKeyDown,
      onKeyUp,
      onMouseDown,
      onMouseUp,
      "aria-expanded": ariaExpanded,
      "aria-controls": ariaControls,
      "aria-haspopup": ariaHaspopup,
      "aria-pressed": ariaPressed,
      tabIndex,
      id,
      name,
      value,
      form,
    },
    ref,
  ) => {
    const button = (
      <Button
        ref={ref}
        type={type}
        variant={variant}
        tone={tone}
        surface={surface}
        size={size}
        accessibleName={ariaLabelledBy ? undefined : label}
        aria-labelledby={ariaLabelledBy}
        tooltip={tooltip}
        rounded
        icon={icon}
        disabled={disabled}
        onClick={onClick}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-haspopup={ariaHaspopup}
        aria-pressed={ariaPressed}
        tabIndex={tabIndex}
        id={id}
        name={name}
        value={value}
        form={form}
      />
    );

    if (!className) {
      return button;
    }

    return <span className={className}>{button}</span>;
  },
);

IconButton.displayName = "IconButton";
