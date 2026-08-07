import { type ReactNode } from "react";
export type NavigationOptions = {
    scroll?: boolean;
};
export type NavigationSearchParams = Pick<URLSearchParams, "get" | "has" | "toString">;
export interface NavigationRuntime {
    pathname: string | null;
    searchParams: NavigationSearchParams;
    push: (href: string, options?: NavigationOptions) => void;
    replace: (href: string, options?: NavigationOptions) => void;
}
export interface NavigationRuntimeProviderProps {
    children: ReactNode;
    runtime: NavigationRuntime;
}
export declare function NavigationProvider({ children, runtime, }: NavigationRuntimeProviderProps): import("react").JSX.Element;
export declare function useNavigationRuntime(): NavigationRuntime;
export declare function useNavigationPathname(): string | null;
export declare function useNavigationSearchParams(): NavigationSearchParams;
export declare function useNavigationRouter(): Pick<NavigationRuntime, "push" | "replace">;
//# sourceMappingURL=navigation.d.ts.map