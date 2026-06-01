"use client";

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface IconButtonProps
  extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
  /** Pass a rendered icon element (e.g., <CaretRight />) */
  icon: ReactNode;
  /** Accessible name when `aria-labelledby` is not set */
  label: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "icon-sm" as const,
  md: "icon" as const,
  lg: "icon-lg" as const,
};

/**
 * Icon-only action control; `label` is required and becomes the accessible name.
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
      ...rest
    },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        type={type}
        variant={variant}
        size={sizeMap[size]}
        aria-label={ariaLabelledBy ? undefined : label}
        className={cn("rounded-full", className)}
        {...rest}
      >
        {icon}
      </Button>
    );
  },
);

IconButton.displayName = "IconButton";
