import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAuthorBySlug } from "@/nextjs-app/shared/data/authors";
import { getPersonSchema, stringifyJsonLd } from "@/app/lib/structuredData";
import { toAbsoluteSiteUrl } from "@/app/lib/siteUrl";
import ClientAuthor from "./ClientAuthor";

type Params = { slug: string };

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return {};

  const title = `${author.name} | Digitaltableteur`;
  const description =
    author.description ||
    author.bio?.slice(0, 160) ||
    "Learn more about this Digitaltableteur author.";
  const url = toAbsoluteSiteUrl(`/blog/authors/${slug}`);
  const imageUrl = author.imageUrl?.startsWith("/")
    ? toAbsoluteSiteUrl(author.imageUrl)
    : author.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      ...(imageUrl ? { images: [{ url: imageUrl, alt: author.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function AuthorProfile({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  const authorUrl = toAbsoluteSiteUrl(`/blog/authors/${slug}`);
  const imageUrl = author.imageUrl?.startsWith("/")
    ? toAbsoluteSiteUrl(author.imageUrl)
    : author.imageUrl;

  return (
    <>
      <script
        id="schema-author"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(
            getPersonSchema({
              name: author.name,
              description: author.bio,
              url: authorUrl,
              image: imageUrl,
            }),
          ),
        }}
      />
      <ClientAuthor slug={slug} />
    </>
  );
}
