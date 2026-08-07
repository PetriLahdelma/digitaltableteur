export interface ScrollIndicatorProps {
    /** ID of the target element to scroll to */
    targetId?: string;
    /** Optional text label */
    label?: string;
    /** Icon variant */
    variant?: "arrow" | "mouse" | "chevron";
    /** Horizontal position */
    position?: "center" | "left" | "right";
    /** Looping motion applied to the icon as a hint to scroll. */
    motion?: "bounce" | "pulse" | "fade" | "none";
    /** Duration of one motion half-cycle, in seconds. */
    speed?: number;
    /** Vertical travel of the bounce motion, in pixels (bounce only). */
    distance?: number;
    /** Custom className for styling */
    className?: string;
}
export declare function ScrollIndicator({ targetId, label, variant, position, motion, speed, distance, className, }: ScrollIndicatorProps): import("react").JSX.Element;
export declare namespace ScrollIndicator {
    var displayName: string;
}
//# sourceMappingURL=ScrollIndicator.d.ts.map