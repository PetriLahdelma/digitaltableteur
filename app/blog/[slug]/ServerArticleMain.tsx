import Image from "next/image";
import Link from "next/link";

import { getPostMetaBySlug } from "@/app/blog/postMetadata";
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
        <aside className="not-prose mt-12 rounded-lg border border-border bg-muted/30 p-6">
          <div className="flex items-start gap-4">
            {author.imageUrl ? (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-muted">
                <Image
                  src={author.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ) : null}
            <div>
              <p className="font-display text-lg font-semibold text-foreground">
                <Link
                  href={`/blog/authors/${author.slug}`}
                  className="underline-offset-2 hover:underline"
                >
                  {author.name}
                </Link>
              </p>
              {author.bio ? (
                <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                  {author.bio}
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      ) : null}

    </>
  );
}
