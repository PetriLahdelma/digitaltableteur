"use client";

import React, { useMemo } from "react";
import { MDXProvider } from "@mdx-js/react";
import { useTranslation } from "react-i18next";

import Author from "@dt/Author";
import AuthorBio from "@dt/AuthorBio/AuthorBio";
import Card from "@dt/Card";
import CodeSnippet, { type SupportedLanguage } from "@dt/CodeSnippet";
import { SocialShare } from "@dt/SocialShare";
import Text from "@dt/Text";
import Title from "@dt/Title";

import VaultBoy from "../../../assets/images/pete-vault-boy.jpg";
import { getBlogPostBySlug, getBlogPosts } from "../../../data/blogPosts";
import { getAuthorBySlug } from "../../../data/authors";
import PageLayout from "../../../patterns/PageLayout/PageLayout";
import styles from "./BlogArticle.module.css";

type EmbedProps = {
  provider?: string;
  url: string;
  title?: string;
};

type AuthorBioProps = React.ComponentProps<typeof AuthorBio>;

const Embed = ({ provider = "embed", url, title }: EmbedProps) => {
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

const MdxAuthorBio = (props: AuthorBioProps) => {
  return <AuthorBio {...props} />;
};

// Custom img wrapper to prevent p > img nesting
const MdxImage = (props: React.ComponentPropsWithoutRef<"img">) => {
  return <img {...props} />;
};

// Custom figcaption wrapper
const MdxFigcaption = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"figcaption">) => {
  return <figcaption {...props}>{children}</figcaption>;
};

const languageAliases: Record<string, SupportedLanguage> = {
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  tsx: "typescript",
  typescript: "typescript",
  json: "json",
  bash: "bash",
  sh: "bash",
  shell: "bash",
  py: "python",
  python: "python",
  go: "go",
  rs: "rust",
  rust: "rust",
  md: "markdown",
  markdown: "markdown",
  html: "markdown",
  xml: "markdown",
};

const normalizeLanguage = (className?: string): SupportedLanguage => {
  if (!className) return "markdown";
  const match = className.match(/language-([\w-]+)/i);
  const raw = (match?.[1] || className).toLowerCase();
  return languageAliases[raw] ?? "markdown";
};

const getTextContent = (value: React.ReactNode): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(getTextContent).join("");
  }
  if (React.isValidElement(value)) {
    return getTextContent(value.props.children);
  }
  return "";
};

const MdxCode = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"code">) => {
  if (className?.includes("language-")) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
  const code = getTextContent(children);
  return (
    <CodeSnippet
      code={code}
      language="markdown"
      variant="inline"
      allowCopy={false}
    />
  );
};

// Render fenced code blocks with CodeSnippet for consistent styling.
const MdxPre = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"pre">) => {
  const childArray = React.Children.toArray(children);
  const codeChild = childArray.find((child) => React.isValidElement(child));
  if (!codeChild || !React.isValidElement(codeChild)) {
    return <pre {...props}>{children}</pre>;
  }
  const className =
    typeof codeChild.props.className === "string"
      ? codeChild.props.className
      : undefined;
  const code = getTextContent(codeChild.props.children);
  return (
    <CodeSnippet
      code={code}
      language={normalizeLanguage(className)}
      variant="multi"
      showLineNumbers={false}
    />
  );
};

const mdxComponents = {
  Embed,
  AuthorBio: MdxAuthorBio,
  img: MdxImage,
  figcaption: MdxFigcaption,
  pre: MdxPre,
  code: MdxCode,
};

const formatDate = (iso?: string, locale?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const resolvedLocale =
    locale || (typeof navigator !== "undefined" ? navigator.language : "en");
  return new Intl.DateTimeFormat(resolvedLocale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export function BlogArticlePage({
  slug,
  nav,
  shareBaseUrl,
}: {
  slug: string;
  nav?: React.ReactNode;
  shareBaseUrl?: string;
}) {
  const { i18n } = useTranslation();
  const post = getBlogPostBySlug(slug ?? "");
  const similar = useMemo(
    () =>
      getBlogPosts()
        .filter((entry) => entry.slug !== slug)
        .slice(0, 3),
    [slug],
  );

  if (!post) return null;

  const {
    title,
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

  const shareUrl =
    legacyUrl ||
    (shareBaseUrl ? `${shareBaseUrl.replace(/\/$/, "")}/blog/${slug}` : "");

  const authorProfileUrl = authorSlug
    ? `/blog/authors/${authorSlug}`
    : undefined;
  const author = authorSlug ? getAuthorBySlug(authorSlug) : undefined;
  const authorImage = author?.imageUrl || VaultBoy;

  return (
    <article className={styles.article}>
      {nav}
      <PageLayout maxWidth="md" spacing="comfortable" as="section">
        <header>
          <Title level={1}>{title}</Title>
          <div className={styles.metaRow}>
            <div className={styles.metaLeft}>
              <Author
                name={authorName ?? "Digitaltableteur"}
                imageUrl={authorImage}
                size="2rem"
                profileUrl={authorProfileUrl}
              />
              <Text className={styles.releaseDate}>
                {formatDate(publishedAt, i18n.language)}
              </Text>
            </div>
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
        <Title level={2} size="M">
          Share
        </Title>
        <SocialShare url={shareUrl} title={title} />
      </PageLayout>
      {similar.length > 0 && (
        <PageLayout maxWidth="md" spacing="comfortable" as="section">
          <div className={styles.similar}>
            <Title level={2}>Similar Reads</Title>
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
  );
}
