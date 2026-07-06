"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import AuthorBio from "@dt/AuthorBio/AuthorBio";
import Button from "@dt/Button";
import Link from "@dt/Link";
import Text from "@dt/Text";
import Title from "@dt/Title";

import { getAuthorBySlug } from "../../../data/authors";
import PageLayout from "../../../patterns/PageLayout/PageLayout";
import styles from "./BlogArticle.module.css";

const truncate = (value: string, max = 160) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
};

const buildDescription = (bio?: string) => {
  if (!bio) return "Learn more about this Digitaltableteur author.";
  const condensed = bio.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  return truncate(condensed);
};

export function AuthorPage({ slug }: { slug: string }) {
  const author = getAuthorBySlug(slug ?? "");
  const router = useRouter();
  const { t } = useTranslation();
  if (!author) return null;

  const metaDescription = author.description ?? buildDescription(author.bio);

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
          <p className={styles.releaseDate}>{metaDescription}</p>
        </header>
        <AuthorBio slug={author.slug} />
        {author.email && (
          <Text className={styles.authorContact}>
            {t("authorGetInTouch")}:{" "}
            <Link href={`mailto:${author.email}`}>{author.email}</Link>
          </Text>
        )}
      </PageLayout>
    </article>
  );
}
