"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import WorkNav from "@/nextjs-app/shared/components/WorkNav/WorkNav";
import { sortedProjects } from "@/nextjs-app/shared/data/projects";

import styles from "./NextWorkNav.module.css";

const workPages = sortedProjects.map((p) => ({
  path: `/work/${p.slug}`,
  label: p.title,
}));

export function NextWorkNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigatingRef = useRef(false);
  const currentIndex = workPages.findIndex((p) => p.path === pathname);

  const prevPath = currentIndex > 0 ? workPages[currentIndex - 1].path : null;
  const nextPath =
    currentIndex >= 0 && currentIndex < workPages.length - 1
      ? workPages[currentIndex + 1].path
      : null;

  useEffect(() => {
    navigatingRef.current = false;
  }, [pathname]);

  useEffect(() => {
    router.prefetch("/work");
    if (prevPath) router.prefetch(prevPath);
    if (nextPath) router.prefetch(nextPath);
  }, [nextPath, prevPath, router]);

  const navigate = useCallback(
    (path: string) => {
      if (navigatingRef.current || isPending || pathname === path) return;
      navigatingRef.current = true;
      startTransition(() => {
        router.push(path);
      });
    },
    [isPending, pathname, router],
  );

  const navDisabled = isPending || currentIndex < 0;

  return (
    <div className={styles.wrapper}>
      <WorkNav
        currentPath={pathname ?? undefined}
        pages={workPages}
        onNavigate={navigate}
        disabled={navDisabled}
      />
    </div>
  );
}
