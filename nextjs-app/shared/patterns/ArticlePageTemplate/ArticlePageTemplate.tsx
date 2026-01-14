"use client";

import { useRef, type ReactNode } from "react";
import { MDXProvider } from "@mdx-js/react";
import { cn } from "@/lib/utils";
import { ArticleLayout } from "../ArticleLayout";
import { ArticleHero } from "../ArticleHero";
import { RelatedPosts } from "../RelatedPosts";
import { ArticleContent } from "../../components/ArticleContent";
import { TableOfContents } from "../../components/TableOfContents";
import { EnhancedAuthorCard } from "../../components/EnhancedAuthorCard";
import { ArticleShareSection } from "../../components/ArticleShareSection";
import { useTableOfContents } from "../../hooks/useTableOfContents";
import { getAuthorBySlug } from "../../data/authors";
import type { BlogPostEntry } from "../../data/blogPosts";

// MDX component imports preserved from original
import AuthorBio from "@dt/AuthorBio/AuthorBio";
import CodeSnippet, { type SupportedLanguage } from "@dt/CodeSnippet";
import { MdxImage } from "../../components/MdxImage";
import React from "react";

// ============================================
// MDX Component Mappings (preserved from original)
// ============================================

type EmbedProps = {
  provider?: string;
  url: string;
  title?: string;
};

const Embed = ({ provider = "embed", url, title }: EmbedProps) => {
  if (!url) return null;
  const iframeProviders = new Set(["youtube", "vimeo"]);
  if (iframeProviders.has(provider.toLowerCase())) {
    return (
      <div className="relative w-full aspect-video my-8 rounded-lg overflow-hidden bg-muted">
        <iframe
          src={url}
          title={title ?? "Embedded media"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }
  return (
    <p className="my-4">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline"
      >
        {url}
      </a>
    </p>
  );
};

const MdxAuthorBio = (props: React.ComponentProps<typeof AuthorBio>) => {
  return <AuthorBio {...props} />;
};

// MdxImage wrapper - uses optimized Next.js Image component
const MdxImageWrapper = (props: React.ComponentPropsWithoutRef<"img">) => {
  // Extract and convert props to MdxImageProps format
  const { src, alt, width, height, title, className } = props;
  return (
    <MdxImage
      src={typeof src === "string" ? src : undefined}
      alt={alt}
      width={typeof width === "number" ? width : undefined}
      height={typeof height === "number" ? height : undefined}
      title={title}
      className={className}
    />
  );
};

const MdxFigcaption = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"figcaption">) => {
  return (
    <figcaption
      {...props}
      className="text-sm text-center text-muted-foreground mt-3"
    >
      {children}
    </figcaption>
  );
};

// Language aliases for syntax highlighting
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
  html: "html",
  xml: "xml",
};

const normalizeLanguage = (className?: string): SupportedLanguage => {
  if (!className) return "markdown";
  const match = className.match(/language-([\w-]+)/i);
  const raw = (match?.[1] || className).toLowerCase();
  return languageAliases[raw] ?? "markdown";
};

type WithChildrenProps = { children?: React.ReactNode };
type CodeElementProps = { children?: React.ReactNode; className?: string };

const getTextContent = (value: React.ReactNode): string => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(getTextContent).join("");
  }
  if (React.isValidElement<WithChildrenProps>(value)) {
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

const MdxPre = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"pre">) => {
  const childArray = React.Children.toArray(children);
  const codeChild = childArray.find((child) =>
    React.isValidElement<CodeElementProps>(child)
  );
  if (!codeChild || !React.isValidElement<CodeElementProps>(codeChild)) {
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
  img: MdxImageWrapper,
  figcaption: MdxFigcaption,
  pre: MdxPre,
  code: MdxCode,
};

// ============================================
// ArticlePageTemplate
// ============================================

export interface ArticlePageTemplateProps {
  /** Blog post data */
  post: BlogPostEntry;
  /** Navigation slot */
  nav?: ReactNode;
  /** Base URL for share links */
  shareBaseUrl?: string;
  /** Show table of contents */
  showTOC?: boolean;
  /** Show related posts */
  showRelated?: boolean;
  /** Show reading progress */
  showReadingProgress?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * ArticlePageTemplate - Composed article page with all sections
 */
export function ArticlePageTemplate({
  post,
  nav,
  shareBaseUrl,
  showTOC = false,
  showRelated = true,
  showReadingProgress = true,
  className,
}: ArticlePageTemplateProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { items, activeId, scrollTo } = useTableOfContents({
    containerRef: contentRef,
  });

  const {
    slug,
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
    tags,
    Component,
  } = post;

  // Build share URL
  const shareUrl =
    legacyUrl ||
    (shareBaseUrl ? `${shareBaseUrl.replace(/\/$/, "")}/blog/${slug}` : "");

  // Get author data
  const author = authorSlug ? getAuthorBySlug(authorSlug) : undefined;

  return (
    <ArticleLayout
      nav={nav}
      hero={
        <ArticleHero
          title={title}
          image={
            mainImageUrl
              ? {
                  src: mainImageUrl,
                  alt: mainImageAlt || title,
                  caption: mainImageCaption,
                }
              : undefined
          }
          author={
            author
              ? {
                  name: author.name,
                  slug: author.slug,
                  imageUrl: author.imageUrl,
                }
              : authorName
                ? { name: authorName }
                : undefined
          }
          publishedAt={publishedAt}
          readTime={readTime}
          tags={tags}
          variant="contained"
        />
      }
      sidebar={
        showTOC && items.length > 0 ? (
          <TableOfContents
            items={items}
            activeId={activeId}
            onItemClick={scrollTo}
            sticky
          />
        ) : undefined
      }
      relatedPosts={
        showRelated ? <RelatedPosts currentSlug={slug} maxPosts={3} /> : undefined
      }
      showReadingProgress={showReadingProgress}
      contentRef={contentRef}
      className={className}
    >
      <ArticleContent ref={contentRef}>
        <MDXProvider components={mdxComponents}>
          <Component />
        </MDXProvider>

        {/* Author card */}
        {author && (
          <div className="mt-12 pt-8 border-t border-border">
            <EnhancedAuthorCard
              name={author.name}
              slug={author.slug}
              imageUrl={author.imageUrl}
              bio={author.bio}
              variant="inline"
              showMoreLink
            />
          </div>
        )}

        {/* Share section */}
        {shareUrl && (
          <div className="mt-8 pt-8 border-t border-border">
            <ArticleShareSection url={shareUrl} title={title} showTitle />
          </div>
        )}
      </ArticleContent>
    </ArticleLayout>
  );
}

ArticlePageTemplate.displayName = "ArticlePageTemplate";
