import React from "react";
export interface DividerProps {
    /** Horizontal rule or vertical separator */
    orientation?: "horizontal" | "vertical";
    /** When true, removed from accessibility tree (purely visual) */
    decorative?: boolean;
    /** Optional spacing token class — use margin utilities on className */
    className?: string;
}
/** Semantic separator using production border tokens. */
export declare function Divider({ orientation, decorative, className, }: DividerProps): React.JSX.Element;
export declare namespace Divider {
    var displayName: string;
}
export default Divider;
//# sourceMappingURL=Divider.d.ts.map