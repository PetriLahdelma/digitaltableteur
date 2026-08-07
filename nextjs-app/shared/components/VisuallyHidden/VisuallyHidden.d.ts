import React from "react";
export interface VisuallyHiddenProps {
    children: React.ReactNode;
    /** Element to render (default span) */
    as?: "span" | "div" | "p" | "h2";
    className?: string;
}
/** Screen-reader-only content; visible on focus when wrapped in interactive parents. */
export declare function VisuallyHidden({ children, as: Component, className, }: VisuallyHiddenProps): React.JSX.Element;
export declare namespace VisuallyHidden {
    var displayName: string;
}
export default VisuallyHidden;
//# sourceMappingURL=VisuallyHidden.d.ts.map