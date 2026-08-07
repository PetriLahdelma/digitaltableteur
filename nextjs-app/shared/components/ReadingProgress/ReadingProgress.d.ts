import { type RefObject } from "react";
export interface ReadingProgressProps {
    /** Ref to the content container to track */
    targetRef: RefObject<HTMLElement | null>;
    /** Show percentage text */
    showPercentage?: boolean;
    className?: string;
}
/** Fixed top progress bar for long-form reading (articles, docs). */
export declare function ReadingProgress({ targetRef, showPercentage, className, }: ReadingProgressProps): import("react").JSX.Element | null;
export declare namespace ReadingProgress {
    var displayName: string;
}
export default ReadingProgress;
//# sourceMappingURL=ReadingProgress.d.ts.map