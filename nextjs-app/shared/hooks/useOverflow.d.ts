import { type RefObject } from "react";
export type OverflowAxis = "x" | "y";
export interface OverflowOptions {
    axis?: OverflowAxis;
    epsilon?: number;
    enabled?: boolean;
}
export interface OverflowState {
    isOverflowing: boolean;
    canScrollStart: boolean;
    canScrollEnd: boolean;
    refresh: () => void;
}
export type ScrollOverflowState = OverflowState;
export declare function useScrollOverflow(ref: RefObject<HTMLElement | null>, options?: OverflowOptions): OverflowState;
export declare function useOverflow(ref: RefObject<HTMLElement | null>, options?: OverflowOptions): Pick<OverflowState, "isOverflowing" | "refresh">;
//# sourceMappingURL=useOverflow.d.ts.map