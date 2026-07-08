"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, type ReactNode } from "react";

import {
  NavigationProvider,
  type NavigationOptions,
  type NavigationRuntime,
} from "@/nextjs-app/shared/lib/navigation";

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

  return <NavigationProvider runtime={runtime}>{children}</NavigationProvider>;
}
