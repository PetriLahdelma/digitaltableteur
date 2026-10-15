
import { getPostMetaBySlug } from "@/app/blog/postMetadata";
import AuthorBio from "@/nextjs-app/shared/components/AuthorBio/AuthorBio";
import { getAuthorBySlug } from "@/nextjs-app/shared/data/authors";
import { toAbsoluteSiteUrl } from "@/app/lib/siteUrl";
import { BlogArticleMdxBody } from "./BlogArticleMdxBody";
import { BlogArticleShare } from "./BlogArticleShare";

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
