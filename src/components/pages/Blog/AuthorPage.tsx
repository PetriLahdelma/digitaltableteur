"use client";

import React from "react";

import AuthorBio from "@dt/AuthorBio/AuthorBio";

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
  if (!author) return null;

  const metaTitle = `${author.name} | Digitaltableteur`;
  const metaDescription = buildDescription(author.bio);

  return (
    <article className={styles.article}>
      <PageLayout maxWidth="md" spacing="comfortable" as="section">
        <header>
          <h1>{metaTitle}</h1>
          <p className={styles.releaseDate}>{metaDescription}</p>
        </header>
        <AuthorBio slug={author.slug} />
      </PageLayout>
    </article>
  );
}
