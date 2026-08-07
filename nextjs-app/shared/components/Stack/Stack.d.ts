import { type ReactNode, type ElementType } from "react";
export interface StackProps {
    /** Stacked children. */
    children: ReactNode;
    /** Stack axis. @default "vertical" */
    direction?: "vertical" | "horizontal";
    /** Gap token between items. @default "md" */
    gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
    /** Cross-axis alignment. @default "stretch" */
    align?: "stretch" | "start" | "center" | "end";
    /** Main-axis distribution. */
    justify?: "start" | "center" | "end" | "between" | "around";
    /** Allow wrapping on horizontal stacks. */
    wrap?: boolean;
    /** Stack class names. */
    className?: string;
    /** Polymorphic element. @default "div" */
    as?: ElementType;
}
/**
 * Stack component.
 */
export declare function Stack({ children, direction, gap, align, justify, wrap, className, as: Component, }: StackProps): import("react").JSX.Element;
//# sourceMappingURL=Stack.d.ts.map