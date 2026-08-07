import { type HTMLAttributes, type ReactNode } from "react";
export interface SectionProps extends HTMLAttributes<HTMLElement> {
    /** Section content. */
    children: ReactNode;
    /** Block padding scale. @default "md" */
    spacing?: "none" | "sm" | "md" | "lg" | "xl" | "hero" | "follow";
    /** Surface background token. @default "default" */
    background?: "default" | "muted" | "accent" | "inverse";
    /** Section class names. */
    className?: string;
    /** Section id (anchor target). */
    id?: string;
    /** Optional stable selector target for host-app guided navigation. */
    spotlightTarget?: string;
}
/**
 * Section component.
 */
export declare const Section: import("react").ForwardRefExoticComponent<SectionProps & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=Section.d.ts.map