import React, { useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { MDXProvider } from "@mdx-js/react";
import BlogNav from "@dt/BlogNav/BlogNav";
import Author from "@dt/Author";
import AuthorBio from "@dt/AuthorBio/AuthorBio";
import Text from "@dt/Text";
import Card from "@dt/Card";
import { SocialShare } from "@dt/SocialShare";
import styles from "./Article.module.css";
import { getBlogPostBySlug, getBlogPosts } from "../data/blogPosts";
import VaultBoy from "../assets/images/pete-vault-boy.jpg";
import PageLayout from "../patterns/PageLayout/PageLayout";

type EmbedProps = {
  provider?: string;
  url: string;
  title?: string;
};

const Embed: React.FC<EmbedProps> = ({ provider = "embed", url, title }) => {
  if (!url) return null;
  const iframeProviders = new Set(["youtube", "vimeo"]);
  if (iframeProviders.has(provider.toLowerCase())) {
    return (
      <div className={styles.embedWrapper}>
        <iframe
          src={url}
          title={title ?? "Embedded media"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <p className={styles.embedLink}>
      <a href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    </p>
  );
};

const mdxComponents = {
  Embed,
  AuthorBio,
};

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const BlogArticle: React.FC = () => {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug ?? "");
  const similar = useMemo(
    () =>
      getBlogPosts()
        .filter((entry) => entry.slug !== slug)
        .slice(0, 3),
    [slug],
  );

  if (!post) {
    return <Navigate to="/not-found" replace />;
  }

  const {
    title,
    seoTitle,
    seoDescription,
    excerpt,
    publishedAt,
    readTime,
    legacyUrl,
    authorName,
    authorSlug,
    mainImageUrl,
    mainImageAlt,
    mainImageCaption,
    Component,
  } = post;

  const metaTitle = seoTitle ?? `${title} | Digitaltableteur`;
  const metaDescription = seoDescription ?? excerpt ?? "";
  const shareUrl =
    (typeof window !== "undefined" && window.location.href) ||
    legacyUrl ||
    `https://digitaltableteur.com/blog/${post.slug}`;
  const authorProfileUrl = authorSlug
    ? `/blog/authors/${authorSlug}`
    : undefined;

  return (
    <HelmetProvider>
      <Helmet>
        <title>{metaTitle}</title>
        {metaDescription && (
          <meta name="description" content={metaDescription} />
        )}
        <meta property="og:title" content={metaTitle} />
        {metaDescription && (
          <meta property="og:description" content={metaDescription} />
        )}
        <meta property="og:image" content="/logo512.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        {metaDescription && (
          <meta name="twitter:description" content={metaDescription} />
        )}
        <meta name="twitter:image" content="/logo512.png" />
      </Helmet>
      <article className={styles.article}>
        <BlogNav />
        <PageLayout maxWidth="md" spacing="comfortable" as="section">
          <header>
            <h1>{title}</h1>
            <div className={styles.metaRow}>
              <Text className={styles.releaseDate}>
                {formatDate(publishedAt)}
              </Text>
              <Author
                name={authorName ?? "Digitaltableteur"}
                imageUrl={VaultBoy}
                size="32px"
                profileUrl={authorProfileUrl}
              />
              <Text className={styles.readTime}>{readTime}</Text>
            </div>
          </header>
        </PageLayout>
        {mainImageUrl && (
          <PageLayout maxWidth="md" spacing="default" as="section">
            <figure className={styles.heroImage}>
              <img
                src={mainImageUrl}
                alt={mainImageAlt || title}
                loading="lazy"
              />
              {mainImageCaption && <figcaption>{mainImageCaption}</figcaption>}
            </figure>
          </PageLayout>
        )}
        <PageLayout maxWidth="md" spacing="comfortable" as="section">
          <MDXProvider components={mdxComponents}>
            <Component />
          </MDXProvider>
          <hr
            style={{
              border: "none",
              borderTop: "2px solid var(--color-primary)",
              margin: "3rem 0 1.5rem",
            }}
          />
          <h2>Share</h2>
          <SocialShare url={shareUrl} title={title} />
        </PageLayout>
        {similar.length > 0 && (
          <PageLayout maxWidth="md" spacing="comfortable" as="section">
            <div className={styles.similar}>
              <h2>Similar Reads</h2>
              <div className={styles.similarList}>
                {similar.map((entry) => (
                  <Card
                    key={entry.slug}
                    title={entry.title}
                    link={`/blog/${entry.slug}`}
                    variant="outlined"
                    hoverable
                    className={`${styles.similarCard}`}
                  />
                ))}
              </div>
            </div>
          </PageLayout>
        )}
      </article>
    </HelmetProvider>
  );
};

export default BlogArticle;
