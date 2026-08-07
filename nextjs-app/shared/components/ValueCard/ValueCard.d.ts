import { type ReactNode } from "react";
export interface ValueCardProps {
    /** Icon element */
    icon: ReactNode;
    /** Card title */
    title: string;
    /** Card description */
    description: string;
    /** Optional className for the icon wrapper */
    iconClassName?: string;
    /** Card variant */
    variant?: "default" | "bordered" | "elevated";
    /** Custom className */
    className?: string;
}
export declare function ValueCard({ icon, title, description, iconClassName, variant, className, }: ValueCardProps): import("react").JSX.Element;
export declare namespace ValueCard {
    var displayName: string;
}
//# sourceMappingURL=ValueCard.d.ts.map