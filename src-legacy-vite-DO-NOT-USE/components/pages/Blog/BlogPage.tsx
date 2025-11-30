"use client";

import React from "react";

import ArticleCard from "@dt/ArticleCard";
import HelsinkiClock from "@dt/HelsinkiClock";
import Title from "@dt/Title";
import { useTranslation } from "react-i18next";

import { getBlogPosts } from "../../../data/blogPosts";
import PageLayout from "../../../patterns/PageLayout/PageLayout";
import styles from "./Blog.module.css";

export function BlogPage() {
  const { t } = useTranslation();
  const posts = getBlogPosts();

  return (
    <div className={styles.blog}>
      <PageLayout maxWidth="lg" spacing="comfortable" as="section">
        <HelsinkiClock />
        <Title size="L">{t("blogArticlesTitle")}</Title>
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
      </PageLayout>
    </div>
  );
}
