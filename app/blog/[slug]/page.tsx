import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import {
  PREVIEW_DRAFTS_COOKIE,
  shouldShowUnpublishedPosts,
} from "@/lib/blog/postVisibility";
import { getPostMetaBySlug } from "../postMetadata";
import { getArticleSchema, stringifyJsonLd } from "@/app/lib/structuredData";
import ClientArticle from "./ClientArticle";

type Params = { slug: string };

export const dynamic = "force-dynamic";

const siteBase =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://digitaltableteur.com";

async function getPreviewOptions() {
  const cookieStore = await cookies();
  const showUnpublished = shouldShowUnpublishedPosts({
    previewCookie: cookieStore.get(PREVIEW_DRAFTS_COOKIE)?.value,
  });
  return { showUnpublished };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostMetaBySlug(slug, await getPreviewOptions());

  if (!post) {
    return {
      title: "Blog | Digitaltableteur",
      description: "Selected articles by Digitaltableteur.",
    };
  }

  const title = post.seoTitle ?? `${post.title} | Digitaltableteur`;
  const description = post.seoDescription ?? post.excerpt;
  const url = `${siteBase}/blog/${post.slug}`;
  const ogImageUrl = post.mainImageUrl?.startsWith("/")
    ? `${siteBase}${post.mainImageUrl}`
    : post.mainImageUrl;

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: post.publishedAt,
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                alt: post.mainImageAlt || post.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
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
  const post = getPostMetaBySlug(slug, await getPreviewOptions());

  if (!post) {
    notFound();
  }

  return (
    <>
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
      <ClientArticle slug={slug} />
    </>
  );
}
