"use client";

import React from "react";
import Button from "@dt/Button";
import styles from "./blognav.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Icon from "@dt/Icon";

const blogPages = [
  { path: "/blog/petri-lahdelma-bio", labelKey: "blogNavPetriLahdelmaBio" },
  {
    path: "/blog/digital-craftsmanship",
    labelKey: "blogNavDigitalCraftsmanship",
  },
  { path: "/blog/figma-mcp-design-systems", labelKey: "blogNavFigmaMcp" },
  {
    path: "/blog/thoughts-on-future-branding",
    labelKey: "blogNavThoughtsOnFutureBranding",
  },
  { path: "/blog/designing-in-2025", labelKey: "blogNavDesigning2025" },
  {
    path: "/blog/in-search-of-impact",
    labelKey: "blogNavInSearchOfImpact",
  },
  { path: "/blog/workflow-tips", labelKey: "blogNavWorkflowTips" },
  {
    path: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-1",
    labelKey: "blogNavDesignSystemAiPt1",
  },
  {
    path: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-2",
    labelKey: "blogNavDesignSystemAiPt2",
  },
];

const normalizePath = (value: string) => value.replace(/\/+$/, "") || "/";

const BlogNav: React.FC = () => {
  const { t } = useTranslation();
  const currentPath = normalizePath(usePathname() ?? "/");
  const currentIndex = blogPages.findIndex(
    (p) => normalizePath(p.path) === currentPath,
  );
  const isArticleRoute = currentIndex >= 0;
  const router = useRouter();
  return (
    <>
      <div className={styles.blogNavBar}>
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
        <div className={styles.rightNavGroup}>
          <Button
            variant="tertiary"
            size="md"
            icon={<Icon name="arrow-left" ariaLabel={t("blogNavPrev")} />}
            disabled={!isArticleRoute || currentIndex <= 0}
            onClick={() => {
              if (!isArticleRoute) return;
              if (currentIndex > 0) router.push(blogPages[currentIndex - 1].path);
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
    </>
  );
};

export default BlogNav;
