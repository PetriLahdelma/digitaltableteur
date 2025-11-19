import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./Blog.module.css";
import ArticleCard from "@dt/ArticleCard";
import Title from "@dt/Title";
import HelsinkiClock from "@dt/HelsinkiClock";
import { useTranslation } from "react-i18next";
import { getBlogPosts } from "../data/blogPosts";

const Blog = () => {
  const { t } = useTranslation();
  const posts = getBlogPosts();

  return (
    <HelmetProvider>
      <Helmet>
        <title>{t("blogMetaTitle")}</title>
        <meta name="description" content={t("blogMetaDescription")} />
        <meta property="og:title" content={t("blogMetaTitle") as string} />
        <meta
          property="og:description"
          content={t("blogMetaDescription") as string}
        />
        <meta property="og:image" content="/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t("blogMetaTitle") as string} />
        <meta
          name="twitter:description"
          content={t("blogMetaDescription") as string}
        />
        <meta name="twitter:image" content="/logo512.png" />
      </Helmet>
      <div className={styles.blog}>
        <Title size="L">{t("blogArticlesTitle")}</Title>
        <HelsinkiClock />
        <div className={styles.list}>
          {posts.map((post) => (
            <ArticleCard
              key={post.slug}
              title={post.title}
              lead={post.excerpt ?? ""}
              link={`/blog/${post.slug}`}
              readTime={post.readTime ?? undefined}
              className={styles.card}
            />
          ))}
        </div>
      </div>
    </HelmetProvider>
  );
};

export default Blog;
