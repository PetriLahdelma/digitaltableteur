"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import Button from "@dt/Button";
import Icon from "@dt/Icon";
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
      <div className={styles.row}>
        <Button
          variant="tertiary"
          size="m"
          icon={<Icon name="briefcase" ariaLabel="Back to work" />}
          isDisabled={isPending}
          onClick={() => navigate("/work")}
        >
          <span className={styles.buttonLabel}>Back to work</span>
        </Button>
        <div className={styles.navButtons}>
          <Button
            variant="tertiary"
            size="m"
            icon={<Icon name="arrow-left" ariaLabel="Previous" />}
            isDisabled={navDisabled || currentIndex <= 0}
            onClick={() => {
              if (prevPath) navigate(prevPath);
            }}
          >
            <span className={styles.buttonLabel}>Previous</span>
          </Button>
          <Button
            variant="tertiary"
            size="m"
            endIcon={<Icon name="arrow-right" ariaLabel="Next" />}
            isDisabled={navDisabled || currentIndex === workPages.length - 1}
            onClick={() => {
              if (nextPath) navigate(nextPath);
            }}
          >
            <span className={styles.buttonLabel}>Next</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
