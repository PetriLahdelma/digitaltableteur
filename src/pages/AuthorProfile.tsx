import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import AuthorBio from "@dt/AuthorBio/AuthorBio";
import PageLayout from "../patterns/PageLayout/PageLayout";
import styles from "./Article.module.css";
import { getAuthorBySlug } from "../data/authors";

const truncate = (value: string, max = 160) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
};

const buildDescription = (bio?: string) => {
  if (!bio) return "Learn more about this Digitaltableteur author.";
  const condensed = bio.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  return truncate(condensed);
};

const AuthorProfile: React.FC = () => {
  const { slug } = useParams();
  const author = getAuthorBySlug(slug ?? "");

  if (!author) {
    return <Navigate to="/not-found" replace />;
  }

  const metaTitle = `${author.name} | Digitaltableteur`;
  const metaDescription = buildDescription(author.bio);

  return (
    <HelmetProvider>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        {author.imageUrl && (
          <meta property="og:image" content={author.imageUrl} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {author.imageUrl && (
          <meta name="twitter:image" content={author.imageUrl} />
        )}
      </Helmet>
      <article className={styles.article}>
        <PageLayout maxWidth="md" spacing="comfortable" as="section">
          <header>
            <h1>About the author</h1>
          </header>
          <AuthorBio slug={author.slug} />
        </PageLayout>
      </article>
    </HelmetProvider>
  );
};

export default AuthorProfile;
