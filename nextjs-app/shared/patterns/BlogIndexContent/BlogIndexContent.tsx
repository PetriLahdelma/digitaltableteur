"use client";

import { useState, useMemo, Suspense } from "react";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { BlogHero } from "../BlogHero";
import { BlogCategoryFilter } from "../../components/BlogCategoryFilter";
import { BlogGrid } from "../../components/BlogGrid";
import { Pagination } from "../../components/Pagination";
import { useBlogFilter } from "../../hooks/useBlogFilter";
import { getBlogPosts, type BlogPostEntry } from "../../data/blogPosts";
import { getAuthorBySlug } from "../../data/authors";
import type { EnhancedArticleCardProps } from "../../components/EnhancedArticleCard";
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

          {/* Grid — single column list on all breakpoints (editorial index) */}
          <BlogGrid
            articles={cardProps}
            layout={gridLayout}
            featuredSlug={filteredPosts[0]?.slug}
            hideImages={hideImages}
            columns={{ sm: 1, md: 1, lg: 1 }}
          />

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
 * Combines BlogHero, BlogCategoryFilter, BlogGrid, and Pagination
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
