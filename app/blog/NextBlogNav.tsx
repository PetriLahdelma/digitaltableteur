"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button, Icon } from "@digitaltableteur/react";
import { getVisiblePosts } from "./postMetadata";

import styles from "./NextBlogNav.module.css";

const normalizePath = (path: string) =>
  path === "/" ? path : path.replace(/\/+$/, "");

export function NextBlogNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  // Generate blog pages from actual blog post metadata
  const blogPages = useMemo(() => {
    return getVisiblePosts().map((post) => ({
      path: `/blog/${post.slug}`,
      label: post.title,
    }));
  }, []);

  const currentIndex = blogPages.findIndex(
    (p) => normalizePath(p.path) === normalizePath(pathname || ""),
  );
  const isArticleRoute = currentIndex >= 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <Button
          variant="tertiary"
          size="md"
          icon={
            <Icon
              name="text-align-left"
              ariaLabel={t("blogNavBackToArticles")}
            />
          }
          onClick={() => router.push("/blog")}
        >
          <span className={styles.buttonLabel}>
            {t("blogNavBackToArticles")}
          </span>
        </Button>
        <div className={styles.navButtons}>
          <Button
            variant="tertiary"
            size="md"
            icon={<Icon name="arrow-left" ariaLabel={t("blogNavPrev")} />}
            disabled={!isArticleRoute || currentIndex <= 0}
            onClick={() => {
              if (!isArticleRoute) return;
              if (currentIndex > 0)
                router.push(blogPages[currentIndex - 1].path);
            }}
          >
            <span className={styles.buttonLabel}>{t("blogNavPrev")}</span>
          </Button>
          <Button
            variant="tertiary"
            size="md"
            endIcon={<Icon name="arrow-right" ariaLabel={t("blogNavNext")} />}
            disabled={
              !isArticleRoute || currentIndex === blogPages.length - 1
            }
            onClick={() => {
              if (!isArticleRoute) return;
              if (currentIndex < blogPages.length - 1)
                router.push(blogPages[currentIndex + 1].path);
            }}
          >
            <span className={styles.buttonLabel}>{t("blogNavNext")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
