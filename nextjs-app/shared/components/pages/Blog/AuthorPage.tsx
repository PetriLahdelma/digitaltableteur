"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import AuthorBio from "@dt/AuthorBio/AuthorBio";
import Button from "@dt/Button";
import Title from "@dt/Title";

import { getAuthorBySlug } from "../../../data/authors";
import PageLayout from "../../../patterns/PageLayout/PageLayout";
import styles from "./BlogArticle.module.css";

export function AuthorPage({ slug }: { slug: string }) {
  const author = getAuthorBySlug(slug ?? "");
  const router = useRouter();
  const { t } = useTranslation();
  if (!author) return null;

  // Return to wherever the reader came from; fall back to the blog index when
  // there is no in-app history (direct visit, new tab).
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/blog");
    }
  };

  return (
    <article className={styles.article}>
      <PageLayout maxWidth="md" spacing="comfortable" as="section">
        <Button
          className={styles.authorBack}
          variant="tertiary"
          size="sm"
          icon="arrow-left"
          onClick={handleBack}
        >
          {t("back")}
        </Button>
        <header>
          <Title level={1}>{t("articleAboutAuthor")}</Title>
        </header>
        <AuthorBio slug={author.slug} showContact />
      </PageLayout>
    </article>
  );
}
