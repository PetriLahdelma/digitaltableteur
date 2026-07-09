"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, type ReactNode } from "react";

import {
  NavigationProvider,
  type NavigationRuntime,
} from "@digitaltableteur/react";
import { NavigationProvider as LocalNavigationProvider } from "@/nextjs-app/shared/lib/navigation";

type NavigationOptions = Parameters<NavigationRuntime["push"]>[1];

/** Adapts Next App Router navigation to the design-system navigation runtime. */
export function NextNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useMemo(
    () =>
      typeof window === "undefined"
        ? new URLSearchParams()
        : new URLSearchParams(window.location.search),
    [pathname],
  );

  const push = useCallback(
    (href: string, options?: NavigationOptions) => {
      router.push(href, options);
    },
    [router],
  );

  const replace = useCallback(
    (href: string, options?: NavigationOptions) => {
      router.replace(href, options);
    },
    [router],
  );

  const runtime = useMemo<NavigationRuntime>(
    () => ({
      pathname,
      searchParams,
      push,
      replace,
    }),
    [pathname, push, replace, searchParams],
  );

  // Two module instances (npm package + local shared source) hold separate
  // NavigationContexts; provide the runtime into both so local consumers
  // (PageTransition, useNavigation, Donny chat navigation, blog filters) get
  // real client-side routing instead of the window.location fallback.
  return (
    <NavigationProvider runtime={runtime}>
      <LocalNavigationProvider runtime={runtime}>
        {children}
      </LocalNavigationProvider>
    </NavigationProvider>
  );
}
