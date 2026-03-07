import type { Metadata } from "next";

import { getPostMetaBySlug } from "../postMetadata";
import { getArticleSchema, stringifyJsonLd } from "@/app/lib/structuredData";
import ClientArticle from "./ClientArticle";

type Params = { slug: string };

export const dynamic = "force-dynamic";

const siteBase =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://digitaltableteur.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostMetaBySlug(slug);

  if (!post) {
    return {
      title: "Blog | Digitaltableteur",
      description: "Selected articles by Digitaltableteur.",
    };
  }

  const title = post.seoTitle ?? `${post.title} | Digitaltableteur`;
  const description = post.seoDescription ?? post.excerpt;
  const imageUrl = post.mainImageUrl ?? "/logo512.png";
  const url = `${siteBase}/blog/${post.slug}`;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: post.publishedAt,
      images: [{ url: imageUrl, alt: post.mainImageAlt || post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogArticle({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPostMetaBySlug(slug);

  return (
    <>
      {post && (
        <script
          id="schema-article"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: stringifyJsonLd(
              getArticleSchema({
                title: post.title,
                description: post.excerpt ?? "",
                publishedAt: post.publishedAt || new Date().toISOString(),
                modifiedAt: post.modifiedAt ?? undefined,
                slug: post.slug,
                author: post.authorName ?? "Petri Lahdelma",
                authorUrl: post.authorSlug
                  ? `${siteBase}/blog/authors/${post.authorSlug}`
                  : undefined,
                mainImageUrl: post.mainImageUrl ?? undefined,
                mainImageAlt: post.mainImageAlt ?? undefined,
                tags: post.tags ?? [],
              }),
            ),
          }}
        />
      )}
      <ClientArticle slug={slug} />
    </>
  );
}
