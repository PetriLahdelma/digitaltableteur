"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type NavigationOptions = {
  scroll?: boolean;
};

export type NavigationSearchParams = Pick<
  URLSearchParams,
  "get" | "has" | "toString"
>;

export interface NavigationRuntime {
  pathname: string | null;
  searchParams: NavigationSearchParams;
  push: (href: string, options?: NavigationOptions) => void;
  replace: (href: string, options?: NavigationOptions) => void;
}

const emptySearchParams = new URLSearchParams();

function assignLocation(href: string) {
  if (typeof window === "undefined") return;
  window.location.assign(href);
}

function replaceLocation(href: string) {
  if (typeof window === "undefined") return;
  window.location.replace(href);
}

const defaultRuntime: NavigationRuntime = {
  pathname: null,
  searchParams: emptySearchParams,
  push: assignLocation,
  replace: replaceLocation,
};

const NavigationContext = createContext<NavigationRuntime>(defaultRuntime);

export interface NavigationRuntimeProviderProps {
  children: ReactNode;
  runtime: NavigationRuntime;
}

export function NavigationProvider({
  children,
  runtime,
}: NavigationRuntimeProviderProps) {
  return (
    <NavigationContext.Provider value={runtime}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationRuntime(): NavigationRuntime {
  return useContext(NavigationContext);
}

export function useNavigationPathname(): string | null {
  return useNavigationRuntime().pathname;
}

export function useNavigationSearchParams(): NavigationSearchParams {
  const { pathname, searchParams } = useNavigationRuntime();
  const [currentSearchParams, setCurrentSearchParams] =
    useState<NavigationSearchParams>(searchParams);

  useEffect(() => {
    if (typeof window === "undefined") {
      setCurrentSearchParams(searchParams);
      return;
    }

    const readLocationSearch = () => {
      setCurrentSearchParams(new URLSearchParams(window.location.search));
    };

    readLocationSearch();
    window.addEventListener("popstate", readLocationSearch);
    return () => window.removeEventListener("popstate", readLocationSearch);
  }, [pathname, searchParams]);

  return currentSearchParams;
}

export function useNavigationRouter(): Pick<
  NavigationRuntime,
  "push" | "replace"
> {
  const { push, replace } = useNavigationRuntime();
  return useMemo(() => ({ push, replace }), [push, replace]);
}
