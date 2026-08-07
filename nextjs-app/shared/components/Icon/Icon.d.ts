import React from "react";
import type { IconWeight } from "@phosphor-icons/react";
export declare const iconVariants: (props?: ({
    size?: "sm" | "md" | "lg" | "xl" | "xs" | "2xl" | "2xs" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
type NamedSize = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type LegacyStyle = "solid" | "regular" | "light" | "thin" | "duotone" | "brands";
export type IconProps = Omit<React.HTMLAttributes<HTMLElement>, "color"> & {
    /**
     * Phosphor icon name. Accepts PascalCase (e.g., "ShareNetwork") or slug ("share-network").
     */
    name: string;
    /**
     * Optional Phosphor weight override.
     */
    weight?: IconWeight;
    /**
     * Legacy FontAwesome-style weight string kept for backward compatibility.
     */
    legacyStyle?: LegacyStyle;
    /** Tokenized or explicit pixel size. @default "md" */
    size?: NamedSize | number;
    /** SVG color override; defaults to the inherited current color. */
    color?: string;
    /** Quarter-turn rotation applied to the glyph. */
    rotate?: 0 | 90 | 180 | 270;
    /** Mirror the glyph along one or both axes. */
    flip?: "horizontal" | "vertical" | "both";
    /** Apply the continuous rotation animation. */
    spin?: boolean;
    /** Apply the pulse animation when spin is not active. */
    pulse?: boolean;
    /** Use Phosphor's horizontal mirroring. */
    mirrored?: boolean;
    /** Accessible name for a meaningful icon. */
    ariaLabel?: string;
    /** Hide the icon from assistive technology. Defaults to true without ariaLabel. */
    decorative?: boolean;
};
/** Phosphor icon wrapper with size tokens, motion affordances, and accessible naming. */
declare const Icon: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLElement>, "color"> & {
    /**
     * Phosphor icon name. Accepts PascalCase (e.g., "ShareNetwork") or slug ("share-network").
     */
    name: string;
    /**
     * Optional Phosphor weight override.
     */
    weight?: IconWeight;
    /**
     * Legacy FontAwesome-style weight string kept for backward compatibility.
     */
    legacyStyle?: LegacyStyle;
    /** Tokenized or explicit pixel size. @default "md" */
    size?: NamedSize | number;
    /** SVG color override; defaults to the inherited current color. */
    color?: string;
    /** Quarter-turn rotation applied to the glyph. */
    rotate?: 0 | 90 | 180 | 270;
    /** Mirror the glyph along one or both axes. */
    flip?: "horizontal" | "vertical" | "both";
    /** Apply the continuous rotation animation. */
    spin?: boolean;
    /** Apply the pulse animation when spin is not active. */
    pulse?: boolean;
    /** Use Phosphor's horizontal mirroring. */
    mirrored?: boolean;
    /** Accessible name for a meaningful icon. */
    ariaLabel?: string;
    /** Hide the icon from assistive technology. Defaults to true without ariaLabel. */
    decorative?: boolean;
} & React.RefAttributes<HTMLSpanElement>>;
export default Icon;
//# sourceMappingURL=Icon.d.ts.map