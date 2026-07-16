"use client";

import React from "react";
import Button from "@dt/Button";
import styles from "./blognav.module.css";
import {
  useNavigationPathname,
  useNavigationRouter,
} from "../../lib/navigation";
import { useTranslate } from "../../lib/translation";
import Icon from "@dt/Icon";

const defaultBlogPages = [
  { path: "/blog/petri-lahdelma-bio" },
  { path: "/blog/digital-craftsmanship" },
  { path: "/blog/figma-mcp-design-systems" },
  { path: "/blog/thoughts-on-future-branding" },
  { path: "/blog/designing-in-2025" },
  { path: "/blog/in-search-of-impact" },
  { path: "/blog/workflow-tips" },
  {
    path: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-1",
  },
  {
    path: "/blog/design-system-meets-ai-building-the-self-evolving-component-library-pt-2",
  },
];

export interface BlogNavPage {
  /** Absolute application path for one article in navigation order. */
  path: string;
}

const normalizePath = (value: string) => value.replace(/\/+$/, "") || "/";

export interface BlogNavProps {
  /**
   * Active route used to compute the prev/next disabled state. Defaults to the
   * current pathname from the router; stories and tests override it to show a
   * given position in the article sequence.
   */
  currentPath?: string;
  /** Ordered article paths. Defaults to the bundled legacy sequence. */
  pages?: readonly BlogNavPage[];
  /** Host navigation callback. Defaults to the configured navigation runtime. */
  onNavigate?: (path: string) => void;
  /** Disables every action while host navigation is pending. @default false */
  disabled?: boolean;
}

/**
 * Blog article sub-navigation: a back-to-articles action plus previous/next
 * controls that step through the article sequence, disabling the button at
 * each edge (and both when the route is not an article). Rendered inside a
 * labelled `nav` landmark.
 */
const BlogNav: React.FC<BlogNavProps> = ({
  currentPath: currentPathProp,
  pages = defaultBlogPages,
  onNavigate,
  disabled = false,
}) => {
  const t = useTranslate();
  const pathname = useNavigationPathname();
  const currentPath = normalizePath(currentPathProp ?? pathname ?? "/");
  const currentIndex = pages.findIndex(
    (p) => normalizePath(p.path) === currentPath,
  );
  const isArticleRoute = currentIndex >= 0;
  const router = useNavigationRouter();
  const navigate = onNavigate ?? router.push;
  return (
    <nav className={styles.blogNavBar} aria-label={t("blogNavLabel")}>
      <Button
        variant="tertiary"
        size="md"
        icon={
          <Icon name="text-align-left" ariaLabel={t("blogNavBackToArticles")} />
        }
        disabled={disabled}
        onClick={() => navigate("/blog")}
      >
        <span className={styles.buttonLabel}>{t("blogNavBackToArticles")}</span>
      </Button>
      <div className={styles.rightNavGroup}>
        <Button
          variant="tertiary"
          size="md"
          icon={<Icon name="arrow-left" ariaLabel={t("blogNavPrev")} />}
          disabled={disabled || !isArticleRoute || currentIndex <= 0}
          onClick={() => {
            if (!isArticleRoute) return;
            if (currentIndex > 0) navigate(pages[currentIndex - 1].path);
          }}
        >
          <span className={styles.buttonLabel}>{t("blogNavPrev")}</span>
        </Button>
        <Button
          variant="tertiary"
          size="md"
          endIcon={<Icon name="arrow-right" ariaLabel={t("blogNavNext")} />}
          disabled={
            disabled || !isArticleRoute || currentIndex === pages.length - 1
          }
          onClick={() => {
            if (!isArticleRoute) return;
            if (currentIndex < pages.length - 1)
              navigate(pages[currentIndex + 1].path);
          }}
        >
          <span className={styles.buttonLabel}>{t("blogNavNext")}</span>
        </Button>
      </div>
    </nav>
  );
};

export default BlogNav;
