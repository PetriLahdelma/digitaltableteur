import { ServerArticleHero } from "./ServerArticleHero";
import { ServerArticleMain } from "./ServerArticleMain";
import { ServerRelatedPosts } from "./ServerRelatedPosts";

/**
 * Composed SSR article page (used when a single server boundary is enough).
 * Production route prefers ClientArticleShell + split hero/main for article nav.
 */
export function ServerArticleContent({
  slug,
  showUnpublished = false,
}: {
  slug: string;
  showUnpublished?: boolean;
}) {
  return (
    <article lang="en">
      <ServerArticleHero slug={slug} showUnpublished={showUnpublished} />
      <div className="py-8 tablet:py-12">
        <div className="mx-auto min-w-0 max-w-3xl px-4 tablet:px-6">
          <ServerArticleMain slug={slug} showUnpublished={showUnpublished} />
        </div>
      </div>
      <ServerRelatedPosts currentSlug={slug} />
    </article>
  );
}
