import React from "react";
export type KbdSize = "sm" | "md" | "lg";
export type KbdVariant = "primary" | "secondary";
export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
    /** Size token. @default "md" */
    size?: KbdSize;
    /**
     * Visual style. `primary` is a filled light-gray keycap with a bottom edge
     * that reads like a physical key; `secondary` is the flatter outlined chip.
     * @default "primary"
     */
    variant?: KbdVariant;
}
/** Keyboard key indicator: renders a semantic <kbd> styled as a keycap. */
export declare const Kbd: React.ForwardRefExoticComponent<KbdProps & React.RefAttributes<HTMLElement>>;
export default Kbd;
//# sourceMappingURL=Kbd.d.ts.map