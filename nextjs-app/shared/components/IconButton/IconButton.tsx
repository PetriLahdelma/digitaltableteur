"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import Button from "@dt/Button";

export interface IconButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  /** Pass a rendered icon element (e.g., <CaretRight />) */
  icon: ReactNode;
  /** Accessible name when `aria-labelledby` is not set */
  label: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const variantMap = {
  default: "primary",
  ghost: "tertiary",
  outline: "secondary",
} as const;

const sizeMap = {
  sm: "sm",
  md: "md",
  lg: "lg",
} as const;

/**
 * Icon-only action control; `label` is required and becomes the accessible name.
 *
 * `className` is applied on a wrapper span so Tailwind responsive utilities (e.g.
 * `lg:hidden`) are not overridden by @dt/Button CSS module `display: inline-flex`.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      variant = "ghost",
      size = "md",
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
        variant={variantMap[variant]}
        size={sizeMap[size]}
        accessibleName={ariaLabelledBy ? undefined : label}
        aria-labelledby={ariaLabelledBy}
        isRounded
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
