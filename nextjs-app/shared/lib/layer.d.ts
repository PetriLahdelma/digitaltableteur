import { type ReactNode } from "react";
export type LayerRole = "modal" | "popover" | "toast" | "tooltip";
export interface LayerProviderProps {
    children: ReactNode;
    /** Portal target for layered UI. Defaults to document.body when available. */
    container?: HTMLElement | null;
    /** Base z-index for modal layers. */
    baseZIndex?: number;
}
export interface LayerOptions {
    role?: LayerRole;
    level?: number;
}
export interface LayerRuntime {
    container: HTMLElement | null;
    role: LayerRole;
    zIndex: number;
}
export type LayerState = LayerRuntime;
export declare function LayerProvider({ children, container, baseZIndex, }: LayerProviderProps): import("react").JSX.Element;
export declare function useLayer(options?: LayerOptions): LayerRuntime;
//# sourceMappingURL=layer.d.ts.map