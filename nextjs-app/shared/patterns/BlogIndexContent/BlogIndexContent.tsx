"use client";

import { useState, useMemo, Suspense } from "react";
import { EmptyState, Grid } from "@digitaltableteur/react";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { BlogHero } from "../BlogHero";
import { BlogCategoryFilter } from "../../components/BlogCategoryFilter";
import { Pagination } from "../../components/Pagination";
import { FadeIn } from "../../components/animations/FadeIn";
import { useBlogFilter } from "../../hooks/useBlogFilter";
import { useTranslate } from "../../lib/translation";
import { getBlogPosts, type BlogPostEntry } from "../../data/blogPosts";
import { getAuthorBySlug } from "../../data/authors";
import {
  EnhancedArticleCard,
  type EnhancedArticleCardProps,
} from "../../components/EnhancedArticleCard";
import { cn } from "../../lib/cn";

export interface BlogIndexContentProps {
  /** Number of posts per page */
  postsPerPage?: number;
  /** Show hero section */
  showHero?: boolean;
  /** Hero variant */
  heroVariant?: "full" | "compact";
  /** Show filter */
  showFilter?: boolean;
  /** Filter variant */
  filterVariant?: "pills" | "underline" | "minimal";
  /** Show pagination */
  showPagination?: boolean;
  /** Grid layout */
  gridLayout?: "standard" | "featured-first";
  /** Hide images in article cards */
  hideImages?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Transform BlogPostEntry to EnhancedArticleCardProps
 */
function transformToCardProps(post: BlogPostEntry): EnhancedArticleCardProps {
  const author = post.authorSlug ? getAuthorBySlug(post.authorSlug) : undefined;

  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    image: post.mainImageUrl
      ? {
          src: post.mainImageUrl,
          alt: post.mainImageAlt || post.title,
        }
      : undefined,
    author: author
      ? {
          name: author.name,
          slug: author.slug,
          imageUrl: author.imageUrl,
        }
      : post.authorName
        ? { name: post.authorName }
        : undefined,
    publishedAt: post.publishedAt,
    readTime: post.readTime,
  };
}

function BlogIndexContentInner({
  postsPerPage = 9,
  showHero = true,
  heroVariant = "compact",
  showFilter = true,
  filterVariant = "pills",
  showPagination = true,
  gridLayout = "standard",
  hideImages = false,
  className,
}: BlogIndexContentProps) {
  const t = useTranslate();
  const [currentPage, setCurrentPage] = useState(1);

  // Get all posts
  const allPosts = getBlogPosts();

  // Filter posts using hook
  const { filteredPosts, selectedTag, setSelectedTag, allTags, tagCounts } =
    useBlogFilter({ posts: allPosts });

  // Reset page when filter changes
  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  // Paginate filtered posts
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    return filteredPosts.slice(start, end);
  }, [filteredPosts, currentPage, postsPerPage]);

  // Transform to card props
  const cardProps = useMemo(
    () => paginatedPosts.map(transformToCardProps),
    [paginatedPosts],
  );

  // Featured-first promotes one card to a full-width featured slot; the
  // first filtered post wins unless it fell off the current page.
  const featuredCard =
    gridLayout === "featured-first" && cardProps.length > 0
      ? cardProps.find((card) => card.slug === filteredPosts[0]?.slug) ||
        cardProps[0]
      : null;
  const remainingCards = featuredCard
    ? cardProps.filter((card) => card.slug !== featuredCard.slug)
    : cardProps;

  // Calculate total pages
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of content
    const contentEl = document.getElementById("blog-content");
    if (contentEl) {
      contentEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={cn("space-y-0", className)}>
      {/* Hero */}
      {showHero && (
        <BlogHero
          variant={heroVariant}
          showScrollIndicator={heroVariant === "full"}
          scrollTargetId="blog-content"
        />
      )}

      {/* Content */}
      <Section id="blog-content" spacing="follow" background="default">
        <Container size="md">
          {/* Filter */}
          {showFilter && allTags.length > 0 && (
            <div className="mb-8">
              <BlogCategoryFilter
                tags={allTags}
                selectedTag={selectedTag}
                onTagChange={handleTagChange}
                showCounts
                tagCounts={tagCounts}
                variant={filterVariant}
              />
            </div>
          )}

          {/* Grid — single column list on all breakpoints (editorial index).
              DS Grid composition (BlogGrid dissolved per the component
              tribunal: layout = Grid, empty state = EmptyState, cards mapped
              at the pattern level). */}
          {cardProps.length === 0 ? (
            <EmptyState
              icon="article"
              title={t("blogNoPostsFound", "No articles found")}
              headingLevel="h3"
            />
          ) : (
            <div className="space-y-8">
              {featuredCard && (
                <FadeIn direction="up" delay={0} distance={30}>
                  <EnhancedArticleCard
                    {...featuredCard}
                    variant="featured"
                    hideImage={hideImages}
                  />
                </FadeIn>
              )}
              <Grid columns={1} gap="1.5rem">
                {remainingCards.map((card, index) => (
                  <FadeIn
                    key={card.slug}
                    direction="up"
                    delay={featuredCard ? 0.1 + index * 0.05 : index * 0.05}
                    distance={30}
                  >
                    <EnhancedArticleCard
                      {...card}
                      variant="default"
                      hideImage={hideImages}
                    />
                  </FadeIn>
                ))}
              </Grid>
            </div>
          )}

          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}

/**
 * Blog Index Content - Composed pattern
 * Combines BlogHero, BlogCategoryFilter, a DS Grid of article cards, and
 * Pagination
 */
export function BlogIndexContent(props: BlogIndexContentProps) {
  return (
    <Suspense fallback={<BlogIndexContentFallback />}>
      <BlogIndexContentInner {...props} />
    </Suspense>
  );
}

function BlogIndexContentFallback() {
  return (
    <div className="space-y-0">
      {/* Hero skeleton */}
      <Section spacing="lg" background="default">
        <Container size="lg">
          <div className="max-w-3xl space-y-4">
            <div className="h-12 bg-muted animate-pulse rounded w-48" />
            <div className="h-6 bg-muted animate-pulse rounded w-96" />
          </div>
        </Container>
      </Section>

      {/* Grid skeleton */}
      <Section spacing="lg" background="default">
        <Container size="lg">
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 bg-muted animate-pulse rounded-full w-24"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-video bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}

BlogIndexContent.displayName = "BlogIndexContent";
