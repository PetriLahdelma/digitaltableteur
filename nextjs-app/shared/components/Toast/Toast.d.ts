export type ToastTone = "neutral" | "success" | "error" | "warning" | "info";
export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
export interface ToastProps {
    /** Controls visibility. */
    open?: boolean;
    /** Semantic colour. @default "neutral" */
    tone?: ToastTone;
    /** Position on screen. @default "bottom-center" */
    position?: ToastPosition;
    /** Size. @default "md" */
    size?: "sm" | "md" | "lg";
    /** Message text displayed in the toast. */
    message: string;
    /** Auto-dismiss delay in ms. @default 3000 */
    duration?: number;
    /** Called when the auto-dismiss timer fires. */
    onClose?: () => void;
    /**
     * Render in normal document flow instead of fixed-positioning itself; a
     * parent (ToastStack) owns placement. `position` is ignored when set.
     */
    inline?: boolean;
}
/**
 * Transient toast notification with tone and auto-dismiss. The element stays
 * mounted as a live region (the message swaps in/out) so assistive tech reliably
 * announces it; visibility is animated via opacity/translate rather than an
 * AnimatePresence mount/unmount, which would defeat the live region.
 */
declare const Toast: import("react").ForwardRefExoticComponent<ToastProps & import("react").RefAttributes<HTMLDivElement>>;
export default Toast;
//# sourceMappingURL=Toast.d.ts.map