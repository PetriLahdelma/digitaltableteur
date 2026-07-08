"use client";

import { useRef, type ReactNode } from "react";
import { MDXProvider } from "@mdx-js/react";
import { ArticleLayout } from "../ArticleLayout";
import { ArticleHero } from "../ArticleHero";
import { RelatedPosts } from "../RelatedPosts";
import { ArticleContent, ArticleProse } from "../../components/ArticleContent";
import { TableOfContents } from "../../components/TableOfContents";
import { EnhancedAuthorCard } from "../../components/EnhancedAuthorCard";
import { ArticleShareSection } from "../../components/ArticleShareSection";
import { useTableOfContents } from "../../hooks/useTableOfContents";
import { getAuthorBySlug } from "../../data/authors";
import type { BlogPostEntry } from "../../data/blogPosts";

// MDX component imports preserved from original
import AuthorBio from "@dt/AuthorBio/AuthorBio";
import CodeBlockWindow from "@dt/CodeBlockWindow";
import { DashLeadList } from "@dt/DashLeadList";
import { MdxImage } from "../../components/MdxImage";
import { cn } from "../../lib/cn";
import React from "react";
import figureStyles from "./ArticleFigure.module.css";

type WithChildrenProps = { children?: React.ReactNode };
type DataProps = { [key: string]: unknown; children?: React.ReactNode };

type FigureLayout = "full" | "center";

const FigureLayoutContext = React.createContext<FigureLayout | null>(null);

const getFigureLayout = (
  props: DataProps,
  className?: string,
): FigureLayout => {
  const layoutProp = props.layout;
  if (layoutProp === "center") return "center";
  if (layoutProp === "full") return "full";
  const data = props["data-layout"] ?? props["dataLayout"];
  if (data === "center") return "center";
  if (data === "full") return "full";
  if (typeof className === "string") {
    if (className.includes("figure-center")) return "center";
    if (className.includes("figure-full")) return "full";
  }
  return "full";
};

const isFigcaptionElement = (child: React.ReactNode): boolean => {
  if (!React.isValidElement(child)) return false;
  if (child.type === MdxFigcaption) return true;
  return typeof child.type === "string" && child.type.toLowerCase() === "figcaption";
};

const isParagraphElement = (
  child: React.ReactNode,
): child is React.ReactElement<{ children?: React.ReactNode }> =>
  React.isValidElement(child) &&
  typeof child.type === "string" &&
  child.type.toLowerCase() === "p";

const renderFigureCaption = (child: React.ReactNode, key: number) => {
  if (isFigcaptionElement(child) && React.isValidElement(child)) {
    const captionProps = child.props as React.ComponentPropsWithoutRef<"figcaption">;
    return (
      <figcaption
        key={key}
        {...captionProps}
        className={cn(figureStyles.caption, captionProps.className)}
      >
        {captionProps.children}
      </figcaption>
    );
  }
  return child;
};

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

// Standalone MDX images use MdxImage; figures use native img for reliable width.
const MdxImageWrapper = (props: React.ComponentPropsWithoutRef<"img">) => {
  const figureLayout = React.useContext(FigureLayoutContext);
  const { src, alt, width, height, title, className } = props;

  if (figureLayout !== null) {
    if (typeof src !== "string" || !src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element -- figure layout needs plain img width control
      <img
        src={src}
        alt={alt ?? ""}
        title={title}
        className={className}
        loading="lazy"
        decoding="async"
      />
    );
  }

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
  className,
  ...props
}: React.ComponentPropsWithoutRef<"figcaption">) => {
  const figureLayout = React.useContext(FigureLayoutContext);

  if (figureLayout !== null) {
    return (
      <figcaption
        {...props}
        className={cn(figureStyles.caption, className)}
      >
        {children}
      </figcaption>
    );
  }

  return (
    <figcaption
      {...props}
      className={cn(
        "mt-3 w-full text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {children}
    </figcaption>
  );
};

const hasDataAttribute = (props: DataProps, attr: string) =>
  Object.prototype.hasOwnProperty.call(props, attr);

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

const isPreElement = (
  node: React.ReactNode,
): node is React.ReactElement<React.ComponentPropsWithoutRef<"pre">> =>
  React.isValidElement(node) && node.type === "pre";

const MdxFigure = ({
  children,
  className,
  layout: layoutProp,
  ...props
}: React.ComponentPropsWithoutRef<"figure"> & { layout?: FigureLayout }) => {
  const isPrettyCodeFigure = hasDataAttribute(
    props as DataProps,
    "data-rehype-pretty-code-figure",
  );

  if (!isPrettyCodeFigure) {
    const layout =
      layoutProp ?? getFigureLayout(props as DataProps, className);
    const childArray = React.Children.toArray(children);
    const media: React.ReactNode[] = [];
    const captions: React.ReactNode[] = [];

    childArray.forEach((child) => {
      if (isFigcaptionElement(child)) {
        captions.push(child);
        return;
      }
      if (isParagraphElement(child)) {
        React.Children.forEach(child.props.children, (nested) => {
          if (isFigcaptionElement(nested)) {
            captions.push(nested);
          } else if (nested != null && nested !== "\n") {
            media.push(nested);
          }
        });
        return;
      }
      media.push(child);
    });

    return (
      <FigureLayoutContext.Provider value={layout}>
        <figure
          className={cn(
            "not-prose",
            figureStyles.figure,
            layout === "full" ? figureStyles.figureFull : figureStyles.figureCenter,
            className,
          )}
          {...props}
        >
          {media.length > 0 ? (
            <div className={figureStyles.media}>{media}</div>
          ) : null}
          {captions.map((caption, index) => renderFigureCaption(caption, index))}
        </figure>
      </FigureLayoutContext.Provider>
    );
  }

  const childArray = React.Children.toArray(children);
  let title: string | undefined;
  let caption: string | undefined;
  let preElement: React.ReactElement<
    React.ComponentPropsWithoutRef<"pre">
  > | null = null;
  let languageValue: string | undefined;

  childArray.forEach((child) => {
    if (!React.isValidElement(child)) return;
    const childProps = child.props as DataProps;
    if (hasDataAttribute(childProps, "data-rehype-pretty-code-title")) {
      title = getTextContent(childProps.children);
      return;
    }
    if (hasDataAttribute(childProps, "data-rehype-pretty-code-caption")) {
      caption = getTextContent(childProps.children);
      return;
    }
    if (isPreElement(child)) {
      preElement = child;
      const dataLanguage = (childProps as DataProps)["data-language"];
      if (typeof dataLanguage === "string") {
        languageValue = dataLanguage;
      }
    }
  });

  if (!preElement) {
    return (
      <figure className={className} {...props}>
        {children}
      </figure>
    );
  }

  return (
    <CodeBlockWindow
      title={title}
      caption={caption}
      language={languageValue}
      context="article"
      className={className}
    >
      {preElement}
    </CodeBlockWindow>
  );
};

/** MDX lower-case `<figure>` bypasses MDXProvider; use `<ArticleFigure>` in content. */
type ArticleFigureProps = React.ComponentPropsWithoutRef<"figure"> & {
  layout?: FigureLayout;
};

const ArticleFigure = ({
  layout = "full",
  children,
  className,
  ...props
}: ArticleFigureProps) => (
  <MdxFigure layout={layout} className={className} {...props}>
    {children}
  </MdxFigure>
);

const mdxComponents = {
  Embed,
  AuthorBio: MdxAuthorBio,
  ArticleFigure,
  DashLeadList,
  img: MdxImageWrapper,
  figcaption: MdxFigcaption,
  figure: MdxFigure,
};

/** Shared MDX component map for blog article bodies (App Router + Storybook). */
export const articleMdxComponents = mdxComponents;

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
        showRelated ? (
          <RelatedPosts currentSlug={slug} maxPosts={3} />
        ) : undefined
      }
      showReadingProgress={showReadingProgress}
      contentRef={contentRef}
      className={className}
    >
      <ArticleContent ref={contentRef}>
        <ArticleProse>
          <MDXProvider components={mdxComponents}>
            <Component />
          </MDXProvider>
        </ArticleProse>

        {/* Author card — outside prose so avatar is not styled as article imagery */}
        {author && (
          <div className="not-prose mt-12">
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
          <div className="not-prose mt-8 pt-8 border-t border-border">
            <ArticleShareSection url={shareUrl} title={title} showTitle />
          </div>
        )}
      </ArticleContent>
    </ArticleLayout>
  );
}

ArticlePageTemplate.displayName = "ArticlePageTemplate";
