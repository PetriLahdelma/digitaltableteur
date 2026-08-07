import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { type ButtonProps } from "@dt/Button";
export interface IconButtonProps extends Omit<ComponentPropsWithoutRef<"button">, "children"> {
    /** Icon glyph: a rendered element (e.g. <CaretRight />) or a Phosphor icon name (e.g. "x"). */
    icon: ReactNode | string;
    /** Accessible name when `aria-labelledby` is not set */
    label: string;
    /** Visual weight. @default "tertiary" */
    variant?: "primary" | "secondary" | "tertiary";
    /** Semantic colour, orthogonal to `variant`. @default "neutral" */
    tone?: ButtonProps["tone"];
    /** Surface the control sits on; prefer over color overrides on tinted bands. @default "default" */
    surface?: ButtonProps["surface"];
    size?: "sm" | "md" | "lg";
    /** Native tooltip text shown on hover; the `label` stays the accessible name. */
    tooltip?: string;
}
/**
 * Icon-only action control; `label` is required and becomes the accessible name.
 *
 * Delegates all styling to @dt/Button (rounded, icon-only form) — css-less by
 * design, so weight/tone/surface stay in lockstep with Button.
 *
 * `className` is applied on a wrapper span so Tailwind responsive utilities (e.g.
 * `lg:hidden`) are not overridden by @dt/Button CSS module `display: inline-flex`.
 */
export declare const IconButton: import("react").ForwardRefExoticComponent<IconButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
//# sourceMappingURL=IconButton.d.ts.map