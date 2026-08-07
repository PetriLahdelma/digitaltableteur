import { type ReactNode, type ElementType } from "react";
export interface CenterProps {
    /** Content to center inside the flex container. */
    children: ReactNode;
    /** Additional CSS class names (often a height constraint). */
    className?: string;
    /** Polymorphic wrapper element. @default "div" */
    as?: ElementType;
}
export declare function Center({ children, className, as: Component, }: CenterProps): import("react").JSX.Element;
//# sourceMappingURL=Center.d.ts.map