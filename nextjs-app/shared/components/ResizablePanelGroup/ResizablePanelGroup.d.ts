import React from "react";
export type ResizablePanel = {
    /** Stable panel identifier. */
    id: string;
    /** Accessible region name. */
    ariaLabel: string;
    /** Panel content. */
    content: React.ReactNode;
    /** Initial percentage. Defaults to an equal share. */
    initialSize?: number;
    /** Minimum percentage. @default 10 */
    minSize?: number;
};
export interface ResizablePanelGroupProps {
    /** Two or more ordered panels. */
    panels: ResizablePanel[];
    /** Resize axis. @default "horizontal" */
    orientation?: "horizontal" | "vertical";
    /** Keyboard resize increment in percentage points. @default 5 */
    keyboardStep?: number;
    /** Receives the current percentage per panel id. */
    onSizesChange?: (sizes: Record<string, number>) => void;
    className?: string;
}
/** Two-or-more-panel layout with pointer and keyboard-accessible separators. */
export declare function ResizablePanelGroup({ panels, orientation, keyboardStep, onSizesChange, className, }: ResizablePanelGroupProps): React.JSX.Element | null;
export declare namespace ResizablePanelGroup {
    var displayName: string;
}
export default ResizablePanelGroup;
//# sourceMappingURL=ResizablePanelGroup.d.ts.map