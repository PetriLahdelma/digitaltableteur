import React from "react";
export interface SkeletonProps {
    /** Shape variant */
    variant?: "text" | "circle" | "rect" | "avatar" | "card";
    /** Width (px or %) */
    width?: number | string;
    /** Height (px) */
    height?: number | string;
    /** Number of lines for text variant */
    lines?: number;
    /** Optional className */
    className?: string;
    /** ARIA label for screen readers (hidden visually) */
    label?: string;
    /** Animate shimmer (disabled with prefers-reduced-motion) */
    animate?: boolean;
}
/**
 * Skeleton component.
 */
export declare const Skeleton: React.FC<SkeletonProps>;
export default Skeleton;
//# sourceMappingURL=Skeleton.d.ts.map