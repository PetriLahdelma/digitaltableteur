import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import styles from "./Blog.module.css";
import { posts } from "./posts";
import ArticleCard from "@dt/ArticleCard";
import Title from "@dt/Title";
import HelsinkiClock from "@dt/HelsinkiClock";
import { useTranslation } from "react-i18next";

interface Post {
  title: string;
  lead: string;
  link: string;
  readTime: string;
  color: string;
  date: string;
  component: React.FC;
}

const Blog = () => {
  const { t } = useTranslation();
  const sortedPosts = posts.sort((a: Post, b: Post) => {
    const dateA = new Date(a.date.split(".").reverse().join("-"));
    const dateB = new Date(b.date.split(".").reverse().join("-"));
    return dateB.getTime() - dateA.getTime();
  });

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
          {sortedPosts.map((post: Post) => (
            <ArticleCard
              key={post.link}
              title={post.title}
              lead={post.lead}
              link={post.link}
              readTime={post.readTime}
              className={styles.card}
            />
          ))}
        </div>
      </div>
    </HelmetProvider>
  );
};

export default Blog;
