import React from "react";
export interface MacWindowFrameProps {
    /** Translation key for the window title */
    titleKey?: string;
    /** Optional label for the action button */
    actionLabelKey?: string;
    /** Called when the action button is pressed */
    onAction?: () => void;
    /** Density variant */
    density?: "comfortable" | "compact";
    /** Content to render inside the frame */
    children: React.ReactNode;
    /** Optional className passthrough */
    className?: string;
}
/**
 * MacWindowFrame component.
 */
export declare const MacWindowFrame: React.FC<MacWindowFrameProps>;
export default MacWindowFrame;
//# sourceMappingURL=MacWindowFrame.d.ts.map