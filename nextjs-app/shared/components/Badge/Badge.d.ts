export declare const badgeVariants: (props?: ({
    size?: "sm" | "md" | "lg" | "xs" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
import React from "react";
/** Visual weight. */
export type BadgeVariant = "primary" | "secondary";
/** Semantic colour, matching the design-token palette. */
export type BadgeTone = "neutral" | "error" | "warning" | "success" | "info";
/** Size. */
export type BadgeSize = "xs" | "sm" | "md" | "lg";
export interface BadgeProps {
    children: React.ReactNode;
    /** Visual weight. @default "primary" */
    variant?: BadgeVariant;
    /** Semantic colour, orthogonal to `variant`. @default "neutral" */
    tone?: BadgeTone;
    /** Size. @default "md" */
    size?: BadgeSize;
    className?: string;
    /** Renders a dismiss control that removes the badge. */
    removable?: boolean;
    /** Called after the badge is dismissed. */
    onRemove?: () => void;
    /** Leading icon; a semantic icon is supplied automatically for non-neutral tones. */
    icon?: React.ReactNode;
    /**
     * Render a leading color-coded {@link StatusDot} (from `tone`) instead of the
     * semantic icon — e.g. lifecycle badges (alpha/beta/stable/deprecated). An
     * explicit `icon` still wins.
     */
    dot?: boolean;
    /** Square (non-pill) corners. */
    square?: boolean;
    /**
     * ARIA role. `"status"` makes dynamic updates announce via `aria-live="polite"`
     * (e.g. a live notification count). Omit for static decorative badges.
     */
    role?: "status";
}
/** Compact status label with semantic tone, size, and an optional icon. */
export declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLSpanElement>>;
export default Badge;
//# sourceMappingURL=Badge.d.ts.map