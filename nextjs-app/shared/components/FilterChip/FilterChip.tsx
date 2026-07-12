import React from "react";
import { cva } from "class-variance-authority";
import styles from "./FilterChip.module.css";
import { cn } from "../../lib/cn";

type FilterChipVariant = "pill" | "underline" | "minimal";
type FilterChipSize = "sm" | "md" | "lg";

export interface FilterChipProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** Whether this chip's filter is active (rendered as aria-pressed). */
  pressed: boolean;
  /** Chip label (compose counts etc. inline). */
  children: React.ReactNode;
  /** Visual treatment. @default "pill" */
  variant?: FilterChipVariant;
  /** Size token. @default "md" */
  size?: FilterChipSize;
  /** Optional count suffix, rendered as "(n)". */
  count?: number;
  /** Additional CSS class names. */
  className?: string;
}

export const filterChipVariants = cva(styles.chip, {
  variants: {
    variant: {
      pill: styles.pill,
      underline: styles.underline,
      minimal: styles.minimal,
    },
    size: {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    },
  },
  defaultVariants: { variant: "pill", size: "md" },
});

/**
 * Single-select filter toggle chip: a `button[aria-pressed]` with pill,
 * underline, and minimal treatments. The shared implementation behind
 * CategoryFilter and BlogCategoryFilter — a filter is a UI control, not a
 * tablist, so chips are toggle buttons inside a labelled `role="group"`.
 */
export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  function FilterChip(
    {
      pressed,
      children,
      variant = "pill",
      size = "md",
      count,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        className={cn(filterChipVariants({ variant, size }), className)}
        {...rest}
      >
        {children}
        {count !== undefined && (
          <>
            {" "}
            <span className={styles.count}>({count})</span>
          </>
        )}
      </button>
    );
  },
);

export default FilterChip;
