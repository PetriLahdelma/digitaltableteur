import React from "react";
export type StatusDotTone = "neutral" | "success" | "warning" | "error" | "info";
export type StatusDotSize = "sm" | "md" | "lg";
export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Semantic tone of the status. @default "neutral" */
    tone?: StatusDotTone;
    /** Size token. @default "md" */
    size?: StatusDotSize;
    /** Animates a soft pulse for live/ongoing states (respects reduced motion). @default false */
    pulse?: boolean;
    /** Accessible label when no visible children are given (e.g. "Online"). */
    label?: string;
    /** Visible label text rendered next to the dot. */
    children?: React.ReactNode;
}
/** Tiny semantic status indicator: a colored dot with a visible or sr-only label. */
export declare const StatusDot: React.ForwardRefExoticComponent<StatusDotProps & React.RefAttributes<HTMLSpanElement>>;
export default StatusDot;
//# sourceMappingURL=StatusDot.d.ts.map