import Image from "next/image";
import Link from "next/link";

import { getPostMetaBySlug } from "@/app/blog/postMetadata";
import { getAuthorBySlug } from "@/nextjs-app/shared/data/authors";
import { Container } from "@/nextjs-app/shared/components/Container";

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

/** Crawlable article hero (title, meta, image) — rendered on the server. */
export function ServerArticleHero({
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
  const showUpdated =
    modifiedAt &&
    publishedAt &&
    modifiedAt.slice(0, 10) !== publishedAt.slice(0, 10);

  return (
    <div className="bg-background">
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
    </div>
  );
}
