
import { getPostMetaBySlug } from "@/app/blog/postMetadata";
import { AuthorBio } from "@digitaltableteur/react";
import { getAuthorBySlug } from "@/nextjs-app/shared/data/authors";
import { toAbsoluteSiteUrl } from "@/app/lib/siteUrl";
import { BlogArticleMdxBody } from "./BlogArticleMdxBody";
import { BlogArticleShare } from "./BlogArticleShare";
import { ArticleOfferBlock } from "./ArticleOfferBlock";

/** Article body, author aside, and share links (hero is separate for layout shell). */
export function ServerArticleMain({
  slug,
  showUnpublished = false,
}: {
  slug: string;
  showUnpublished?: boolean;
}) {
  const post = getPostMetaBySlug(slug, { showUnpublished });
  if (!post) return null;

  const { title, authorSlug } = post;
  const author = authorSlug ? getAuthorBySlug(authorSlug) : undefined;
  const shareUrl = toAbsoluteSiteUrl(`/blog/${slug}`);

  return (
    <>
      <BlogArticleMdxBody slug={slug} showUnpublished={showUnpublished} />

      <ArticleOfferBlock engagementSlug={post.engagement} />

      <BlogArticleShare url={shareUrl} title={title} />

      {author ? (
        <AuthorBio
          slug={author.slug}
          profileHref={`/blog/authors/${author.slug}`}
          variant="compact"
          className="mt-12"
        />
      ) : null}
    </>
  );
}
