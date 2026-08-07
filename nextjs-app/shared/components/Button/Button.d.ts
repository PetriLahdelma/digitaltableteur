import React from "react";
/** Visual weight of the button. */
export type ButtonVariant = "primary" | "secondary" | "tertiary";
/** Semantic color, matching the design-token palette. */
export type ButtonTone = "neutral" | "error" | "warning" | "success" | "info";
/** Surface the button sits on, for contrast-safe styling (static CSS, no ancestor sampling). */
export type ButtonSurface = "default" | "onDark" | "onBrand";
/** Control size scale. */
export type ButtonSize = "sm" | "md" | "lg";
/** Properties shared by the button and link renderings. */
interface BaseButtonProps {
    /** Visual weight. @default "primary" */
    variant?: ButtonVariant;
    /** Semantic color, orthogonal to `variant`. @default "neutral" */
    tone?: ButtonTone;
    /** Size. @default "md" */
    size?: ButtonSize;
    /** Surface the button renders on; prefer this over absolute colors on tinted bands. @default "default" */
    surface?: ButtonSurface;
    /** Disables interaction and dims the control. @default false */
    disabled?: boolean;
    /** Shows a loading state and blocks interaction; sets `aria-busy`. @default false */
    loading?: boolean;
    /** Fully rounded (pill) corners. @default false */
    rounded?: boolean;
    /** Leading icon: a React node, a component, or a Phosphor icon name (e.g. `"arrow-left"`). */
    icon?: React.ReactNode | string;
    /** Trailing icon: a React node, a component, or a Phosphor icon name. */
    endIcon?: React.ReactNode | string;
    /** Button label. */
    children?: React.ReactNode;
    /** Accessible name; required for icon-only buttons. Maps to `aria-label`. */
    accessibleName?: string;
    /** id of an element that labels this button. Maps to `aria-labelledby`. */
    accessibleNameRef?: string;
    /** Extra context for assistive tech. Maps to `aria-describedby`. */
    accessibleDescription?: string;
    /** Native tooltip text; also used as an accessible-name fallback for icon-only buttons. */
    tooltip?: string;
}
/** Button rendered as a native `<button>`. */
export interface ButtonAsButton extends BaseButtonProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
    /** When true, sets `type="submit"`. @default false */
    submits?: boolean;
    /**
     * Async click handler. `onClick` still fires first if both are provided.
     * While the returned promise is pending, the button shows its `loading`
     * state, sets `aria-busy`, and disables itself (deduping repeat clicks).
     * Rejections are swallowed after clearing the pending state; callers own
     * error UX (e.g. surface a toast from within `clickAction` itself).
     */
    clickAction?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    href?: never;
    target?: never;
    rel?: never;
}
/** Button rendered as an `<a>` for navigation. */
export interface ButtonAsLink extends BaseButtonProps, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
    /** Destination URL. When provided, the button renders as an anchor. */
    href: string;
    submits?: never;
    clickAction?: never;
}
/**
 * Primary action control with an orthogonal `variant` (visual weight) and `tone`
 * (semantic color) model, optional loading state, and polymorphic button/link rendering.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={save}>Save</Button>
 * <Button variant="secondary" tone="error">Delete</Button>
 * <Button variant="tertiary" icon="arrow-left">Back</Button>
 * <Button href="/about" variant="secondary">Learn more</Button>
 * <Button variant="primary" surface="onDark">On a dark band</Button>
 * ```
 */
export type ButtonProps = ButtonAsButton | ButtonAsLink;
/** Primary action control with `variant` (visual weight) and `tone` (semantic color), loading state, and polymorphic button/link rendering. */
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement | HTMLAnchorElement>>;
export default Button;
//# sourceMappingURL=Button.d.ts.map