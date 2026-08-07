import type { ReactNode } from "react";
export declare function TooltipProvider({ delayDuration, children, }: {
    delayDuration?: number;
    children: ReactNode;
}): import("react").JSX.Element;
export declare function Tooltip({ children, open, defaultOpen, onOpenChange, }: {
    children: ReactNode;
    /** Controlled open state. */
    open?: boolean;
    /** Initial open state when uncontrolled. */
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}): import("react").JSX.Element;
export declare function TooltipTrigger({ asChild, children, }: {
    asChild?: boolean;
    children: ReactNode;
}): import("react").JSX.Element;
/**
 * Props for `TooltipContent`, the content bubble and the tooltip's primary
 * documented control surface.
 */
export interface TooltipProps {
    /** Extra class on the content bubble. */
    className?: string;
    /** Preferred placement relative to the trigger; flips when out of room. */
    side?: "top" | "right" | "bottom" | "left";
    /** Gap in px between the trigger and the bubble. */
    sideOffset?: number;
    /** Hint content — a short phrase, never interactive. */
    children: ReactNode;
}
export declare function TooltipContent({ className, side, sideOffset, children, }: TooltipProps): import("react").JSX.Element;
//# sourceMappingURL=Tooltip.d.ts.map