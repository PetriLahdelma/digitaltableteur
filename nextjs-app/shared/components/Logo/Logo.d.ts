import React from "react";
export interface LogoProps {
    /** Optional image URL (PNG, JPEG, or SVG) rendered instead of the built-in
     * Digitaltableteur mark. `title` becomes the alt text; `animated` and
     * `background` apply to the built-in mark only and are ignored when `src` is
     * set. */
    src?: string;
    /** Square render box in pixels. Default 24. */
    size?: number;
    /** Pulse the three leading bars while true; a controlled signal driven from the
     * consumer's hover/focus state (respects prefers-reduced-motion). Default false. */
    animated?: boolean;
    /** Render the brand lime circle background behind a contrast mark
     * (`--logo-background` / `--logo-color`). Default false. */
    background?: boolean;
    /** Accessible name for the mark. Ignored when `decorative`. Default "Digitaltableteur". */
    title?: string;
    /** When true the mark is purely decorative and removed from the accessibility tree. Default false. */
    decorative?: boolean;
    /** Optional utility/spacing classes. */
    className?: string;
}
/**
 * Logo atom. By default renders the built-in Digitaltableteur mark — monochrome
 * (inherits `currentColor`) inside a square `size`×`size` box, with the three-bar
 * pulse (`animated`) and lime circle background (`background`) options. Pass `src` to render
 * any custom logo image (PNG, JPEG, or SVG) inside the same square box instead;
 * the image letterboxes via `object-fit: contain` and `title` names it.
 */
export declare const Logo: React.ForwardRefExoticComponent<LogoProps & React.RefAttributes<SVGSVGElement | HTMLImageElement>>;
export default Logo;
//# sourceMappingURL=Logo.d.ts.map