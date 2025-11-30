import React, { useMemo } from "react";
import Button from "@dt/Button";
import styles from "./blognav.module.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import path from "path";
import Icon from "@dt/Icon";
import { getBlogPosts } from "../../data/blogPosts";

const normalizePath = (value: string) => value.replace(/\/+$/, "") || "/";

const BlogNav: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentPath = normalizePath(window.location.pathname);

  // Generate blog pages from actual blog post data
  const blogPages = useMemo(() => {
    return getBlogPosts().map((post) => ({
      path: `/blog/${post.slug}`,
      title: post.title,
    }));
  }, []);

  const currentIndex = blogPages.findIndex(
    (p) => normalizePath(p.path) === currentPath,
  );
  const isArticleRoute = currentIndex >= 0;

  return (
    <>
      <div className={styles.blogNavBar}>
        <Button
          variant="tertiary"
          size="m"
          icon={
            <Icon
              name="text-align-left"
              ariaLabel={t("blogNavBackToArticles")}
            />
          }
          onClick={() => navigate("/blog")}
        >
          {t("blogNavBackToArticles")}
        </Button>
        <div className={styles.rightNavGroup}>
          <Button
            variant="tertiary"
            size="m"
            icon={<Icon name="arrow-left" ariaLabel={t("blogNavPrev")} />}
            disabled={!isArticleRoute || currentIndex <= 0}
            onClick={() => {
              if (!isArticleRoute) return;
              if (currentIndex > 0) navigate(blogPages[currentIndex - 1].path);
            }}
          >
            {t("blogNavPrev")}
          </Button>
          <Button
            variant="tertiary"
            size="l"
            endIcon={<Icon name="arrow-right" ariaLabel={t("blogNavNext")} />}
            disabled={!isArticleRoute || currentIndex === blogPages.length - 1}
            onClick={() => {
              if (!isArticleRoute) return;
              if (currentIndex < blogPages.length - 1)
                navigate(blogPages[currentIndex + 1].path);
            }}
          >
            {t("blogNavNext")}
          </Button>
        </div>
      </div>
      <hr className={styles.hrLine} />
    </>
  );
};

export default BlogNav;
