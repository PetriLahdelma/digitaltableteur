import { type ToastPosition, type ToastTone } from "../Toast/Toast";
export declare const toastStackVariants: (props?: ({
    position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface ToastStackItem {
    /** Stable identity for dismissal and list rendering. */
    id: string;
    /** Message text displayed in the toast. */
    message: string;
    /** Semantic colour. */
    tone?: ToastTone;
    /** Auto-dismiss delay in ms. @default 3000 */
    duration?: number;
    /** Size. @default "md" */
    size?: "sm" | "md" | "lg";
}
export interface ToastStackProps {
    /** Toasts to display, oldest first; new toasts are appended by the caller. */
    toasts: ToastStackItem[];
    /** Screen corner/edge the stack docks to. @default "bottom-center" */
    position?: ToastPosition;
    /** Called with the toast id when its auto-dismiss timer fires. */
    onDismiss?: (id: string) => void;
    /**
     * Maximum toasts rendered at once; older ones wait (their timers only run
     * while rendered), so bursts drain in order. @default 5
     */
    max?: number;
    /** Optional classes on the stack wrapper. */
    className?: string;
}
/**
 * Docked stack of transient toasts. Owns the fixed placement that a lone
 * `Toast` handles itself: children render inline and the stack lays them out
 * with the newest toast nearest the docked screen edge. Each toast keeps its
 * own live region and auto-dismiss timer, so messages announce independently
 * instead of replacing each other.
 */
declare const ToastStack: import("react").ForwardRefExoticComponent<ToastStackProps & import("react").RefAttributes<HTMLDivElement>>;
export default ToastStack;
//# sourceMappingURL=ToastStack.d.ts.map