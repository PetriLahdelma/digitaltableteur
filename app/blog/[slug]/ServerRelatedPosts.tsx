import Link from "next/link";

import {
  getPostMetaBySlug,
  getVisiblePosts,
} from "@/app/blog/postMetadata";
import { Container } from "@/nextjs-app/shared/components/Container";
import Title from "@dt/Title";

/**
 * Minimal SSR related links. Production uses {@link RelatedPosts} + EnhancedArticleCard.
 */
export function ServerRelatedPosts({
  currentSlug,
  maxPosts = 3,
}: {
  currentSlug: string;
  maxPosts?: number;
}) {
  const currentPost = getPostMetaBySlug(currentSlug);
  const currentTags = new Set(currentPost?.tags ?? []);

  const related = getVisiblePosts()
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const sharedTags = (post.tags ?? []).filter((tag) => currentTags.has(tag));
      return { post, score: sharedTags.length };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const dateA = a.post.publishedAt ? new Date(a.post.publishedAt).getTime() : 0;
      const dateB = b.post.publishedAt ? new Date(b.post.publishedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, maxPosts)
    .map(({ post }) => post);

  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-posts-heading" className="border-t border-border bg-muted/20 py-12">
      <Container size="lg">
        <Title
          as="h2"
          unstyled
          id="related-posts-heading"
          className="mb-6 font-display text-2xl font-bold text-foreground"
        >
          Related articles
        </Title>
        <ul className="grid gap-4 tablet:grid-cols-3">
          {related.map((post) => (
            <li key={post.slug} className="rounded-lg border border-border bg-background p-5">
              <Link
                href={`/blog/${post.slug}`}
                className="font-display text-lg font-semibold text-foreground underline-offset-2 hover:underline"
              >
                {post.title}
              </Link>
              {post.excerpt ? (
                <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
