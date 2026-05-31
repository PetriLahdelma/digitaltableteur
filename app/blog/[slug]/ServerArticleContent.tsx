import Image from "next/image";
import Link from "next/link";

import { getPostMetaBySlug } from "@/app/blog/postMetadata";
import { getAuthorBySlug } from "@/nextjs-app/shared/data/authors";
import { Container } from "@/nextjs-app/shared/components/Container";
import { toAbsoluteSiteUrl } from "@/app/lib/siteUrl";
import { BlogArticleMdxBody } from "./BlogArticleMdxBody";
import { ServerRelatedPosts } from "./ServerRelatedPosts";

function formatPublishedDate(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ServerArticleContent({
  slug,
  showUnpublished = false,
}: {
  slug: string;
  showUnpublished?: boolean;
}) {
  const post = getPostMetaBySlug(slug, { showUnpublished });
  if (!post) return null;

  const {
    title,
    excerpt,
    publishedAt,
    modifiedAt,
    readTime,
    authorName,
    authorSlug,
    mainImageUrl,
    mainImageAlt,
    mainImageCaption,
  } = post;

  const author = authorSlug ? getAuthorBySlug(authorSlug) : undefined;
  const shareUrl = toAbsoluteSiteUrl(`/blog/${slug}`);
  const showUpdated =
    modifiedAt &&
    publishedAt &&
    modifiedAt.slice(0, 10) !== publishedAt.slice(0, 10);

  return (
    <article lang="en">
      <header className="border-b border-border bg-background">
        <Container size="md" className="py-10 tablet:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-body text-sm text-muted-foreground">
              {publishedAt ? (
                <time dateTime={publishedAt}>
                  {formatPublishedDate(publishedAt)}
                </time>
              ) : null}
              {showUpdated && modifiedAt ? (
                <>
                  {" · Updated "}
                  <time dateTime={modifiedAt}>
                    {formatPublishedDate(modifiedAt)}
                  </time>
                </>
              ) : null}
              {readTime ? ` · ${readTime}` : ""}
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground tablet:text-5xl">
              {title}
            </h1>
            {excerpt ? (
              <p className="mt-4 font-body text-lg leading-relaxed text-muted-foreground">
                {excerpt}
              </p>
            ) : null}
            {author || authorName ? (
              <p className="mt-6 font-body text-sm text-muted-foreground">
                By{" "}
                {author?.slug ? (
                  <Link
                    href={`/blog/authors/${author.slug}`}
                    className="font-medium text-foreground underline underline-offset-2"
                  >
                    {author.name}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">
                    {author?.name ?? authorName}
                  </span>
                )}
              </p>
            ) : null}
          </div>
          {mainImageUrl ? (
            <figure className="mx-auto mt-10 max-w-4xl">
              <Image
                src={mainImageUrl}
                alt={mainImageAlt || title}
                width={1600}
                height={900}
                priority
                className="h-auto w-full rounded-lg"
                sizes="(max-width: 768px) 100vw, 960px"
              />
              {mainImageCaption ? (
                <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                  {mainImageCaption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </Container>
      </header>

      <Container size="md" className="py-8 tablet:py-12">
        <div className="min-w-0">
          <BlogArticleMdxBody slug={slug} showUnpublished={showUnpublished} />

          {author ? (
            <aside className="not-prose mt-12 rounded-lg border border-border bg-muted/30 p-6">
              <div className="flex items-start gap-4">
                {author.imageUrl ? (
                  <Image
                    src={author.imageUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="size-16 rounded-full object-cover"
                  />
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

          <footer className="not-prose mt-8 border-t border-border pt-8">
            <p className="font-body text-sm text-muted-foreground">
              Share:{" "}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                className="text-foreground underline underline-offset-2"
              >
                LinkedIn
              </a>
              {" · "}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
                className="text-foreground underline underline-offset-2"
              >
                X
              </a>
            </p>
          </footer>
        </div>
      </Container>

      <ServerRelatedPosts currentSlug={slug} />
    </article>
  );
}
