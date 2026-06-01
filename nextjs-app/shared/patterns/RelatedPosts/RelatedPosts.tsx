"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Container } from "../../components/Container";
import { Section } from "../../components/Section";
import { EnhancedArticleCard } from "../../components/EnhancedArticleCard";
import { FadeIn } from "../../components/animations/FadeIn";
import { getBlogPosts, getBlogPostBySlug } from "../../data/blogPosts";

export interface RelatedPostsProps {
  /** Current article slug to exclude */
  currentSlug: string;
  /** Maximum number of related posts */
  maxPosts?: number;
  /** Section title */
  title?: string;
  /** Custom className */
  className?: string;
}

/**
 * RelatedPosts - Display related articles based on shared tags
 */
export function RelatedPosts({
  currentSlug,
  maxPosts = 3,
  title,
  className,
}: RelatedPostsProps) {
  const { t } = useTranslation();
  const displayTitle = title || t("articleRelatedTitle", "Related Articles");

  // Get related posts based on shared tags
  const relatedPosts = useMemo(() => {
    const currentPost = getBlogPostBySlug(currentSlug);
    const currentTags = currentPost?.tags || [];
    const allPosts = getBlogPosts();

    // Filter out current post
    const otherPosts = allPosts.filter((post) => post.slug !== currentSlug);

    // If current post has tags, score by shared tags
    if (currentTags.length > 0) {
      const scored = otherPosts.map((post) => {
        const postTags = post.tags || [];
        const sharedTags = postTags.filter((tag) => currentTags.includes(tag));
        return {
          post,
          score: sharedTags.length,
        };
      });

      // Sort by score (descending), then by date
      scored.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        const dateA = a.post.publishedAt
          ? new Date(a.post.publishedAt).getTime()
          : 0;
        const dateB = b.post.publishedAt
          ? new Date(b.post.publishedAt).getTime()
          : 0;
        return dateB - dateA;
      });

      return scored.slice(0, maxPosts).map((s) => s.post);
    }

    // Fallback: just return most recent posts
    return otherPosts.slice(0, maxPosts);
  }, [currentSlug, maxPosts]);

  // Don't render if no related posts
  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <Section
      id="related-posts"
      spacing="lg"
      background="muted"
      className={className}
    >
      <Container size="lg">
        {/* Section header */}
        <FadeIn direction="up" delay={0} distance={20}>
          <h2
            className={cn(
              "font-display font-bold",
              "text-2xl tablet:text-3xl",
              "text-foreground mb-8",
            )}
          >
            {displayTitle}
          </h2>
        </FadeIn>

        {/* Posts grid */}
        <div className="grid grid-cols-1 items-stretch gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
          {relatedPosts.map((post, index) => (
            <FadeIn
              key={post.slug}
              direction="up"
              delay={0.1 + index * 0.05}
              distance={30}
              className="flex h-full min-h-0 w-full"
            >
              <EnhancedArticleCard
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                publishedAt={post.publishedAt}
                readTime={post.readTime}
                variant="default"
                hideImage
                showAuthor={false}
                className="h-full"
              />
            </FadeIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}

RelatedPosts.displayName = "RelatedPosts";
