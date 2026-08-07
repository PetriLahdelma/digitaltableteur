import * as React from "react";
export interface SlideButtonProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
    /** Visible, i18n-resolved label. Names the destination, not the gesture. */
    label: string;
    /** Destination. Rendered as a real `<a>`, so it is focusable and keyboard-activated. */
    href: string;
    /** Phosphor icon name for the sliding disc. @default "Lightning" */
    icon?: string;
    /**
     * Side the icon rests on before it slides across on hover. "left" starts at the
     * leading edge and travels to the trailing edge; "right" is the mirror.
     * @default "left"
     */
    iconSide?: "left" | "right";
}
/**
 * A pill call-to-action whose icon disc slides across the button on hover while the
 * label shifts to make room and the disc rolls a full turn. The motion is a hover hint
 * only; it is suppressed under `prefers-reduced-motion` with no change to layout, label,
 * or activation.
 */
export declare const SlideButton: React.ForwardRefExoticComponent<SlideButtonProps & React.RefAttributes<HTMLAnchorElement>>;
//# sourceMappingURL=SlideButton.d.ts.map