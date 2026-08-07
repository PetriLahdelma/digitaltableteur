import { type ReactNode, type ElementType } from "react";
export interface ContainerProps {
    /** Page content inside the width constraint. */
    children: ReactNode;
    /** Max-width token. @default "lg" */
    size?: "sm" | "md" | "lg" | "xl" | "full";
    /** Center the container horizontally. */
    center?: boolean;
    /** Wrapper class names. */
    className?: string;
    /** Polymorphic element. @default "div" */
    as?: ElementType;
}
/**
 * Container component.
 */
export declare function Container({ children, size, center, className, as: Component, }: ContainerProps): import("react").JSX.Element;
//# sourceMappingURL=Container.d.ts.map