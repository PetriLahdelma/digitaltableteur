import { type ReactNode } from "react";
import type { ToastPosition, ToastTone } from "../components/Toast";
export interface ShowToastOptions {
    duration?: number;
    tone?: ToastTone;
    position?: ToastPosition;
}
export interface ToastRuntime {
    /** Second argument accepts a bare duration (legacy) or an options object. */
    showToast: (message: string, options?: number | ShowToastOptions) => void;
}
export interface ToastRuntimeProviderProps {
    children: ReactNode;
    value: ToastRuntime;
}
export declare function ToastRuntimeProvider({ children, value, }: ToastRuntimeProviderProps): import("react").JSX.Element;
export declare function useToast(): ToastRuntime;
//# sourceMappingURL=toast.d.ts.map