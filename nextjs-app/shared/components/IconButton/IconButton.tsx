"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface IconButtonProps {
  /** Pass a rendered icon element (e.g., <Heart />) */
  icon: ReactNode;
  label: string; // Required for accessibility
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
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
  ({ icon, label, variant = "ghost", size = "md", className, onClick, disabled }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={sizeMap[size]}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn("rounded-full", className)}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = "IconButton";
