"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import Button from "@dt/Button";
import Icon from "@dt/Icon";
import { sortedProjects } from "@/nextjs-app/shared/data/projects";

import styles from "./NextWorkNav.module.css";

const workPages = sortedProjects.map((p) => ({
  path: `/work/${p.slug}`,
  label: p.title,
}));

export function NextWorkNav() {
  const { t } = useTranslation();
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
          size="md"
          icon={<Icon name="briefcase" ariaLabel={t("projectBackToWork")} />}
          disabled={isPending}
          onClick={() => navigate("/work")}
        >
          <span className={styles.buttonLabel}>{t("projectBackToWork")}</span>
        </Button>
        <div className={styles.navButtons}>
          <Button
            variant="tertiary"
            size="md"
            icon={<Icon name="arrow-left" ariaLabel={t("workNavPrev")} />}
            disabled={navDisabled || currentIndex <= 0}
            onClick={() => {
              if (prevPath) navigate(prevPath);
            }}
          >
            <span className={styles.buttonLabel}>{t("workNavPrev")}</span>
          </Button>
          <Button
            variant="tertiary"
            size="md"
            endIcon={<Icon name="arrow-right" ariaLabel={t("workNavNext")} />}
            disabled={navDisabled || currentIndex === workPages.length - 1}
            onClick={() => {
              if (nextPath) navigate(nextPath);
            }}
          >
            <span className={styles.buttonLabel}>{t("workNavNext")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
