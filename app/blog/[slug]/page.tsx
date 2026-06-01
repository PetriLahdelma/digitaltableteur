import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import {
  PREVIEW_DRAFTS_COOKIE,
  shouldShowUnpublishedPosts,
} from "@/lib/blog/postVisibility";
import { getSiteUrl, toAbsoluteSiteUrl } from "@/app/lib/siteUrl";
import { getPostMetaBySlug, getVisiblePosts } from "../postMetadata";
import {
  getArticleSchema,
  getBreadcrumbSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";
import ClientArticleShell from "./ClientArticleShell";
import { ServerArticleHero } from "./ServerArticleHero";
import { ServerArticleMain } from "./ServerArticleMain";
import { RelatedPosts } from "@/nextjs-app/shared/patterns/RelatedPosts";

type Params = { slug: string };

export const revalidate = 600;

async function getPreviewOptions() {
  const cookieStore = await cookies();
  const showUnpublished = shouldShowUnpublishedPosts({
    previewCookie: cookieStore.get(PREVIEW_DRAFTS_COOKIE)?.value,
  });
  return { showUnpublished };
}

export function generateStaticParams() {
  return getVisiblePosts().map((post) => ({ slug: post.slug }));
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
  const url = toAbsoluteSiteUrl(`/blog/${post.slug}`);
  const ogImageUrl = post.mainImageUrl?.startsWith("/")
    ? toAbsoluteSiteUrl(post.mainImageUrl)
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
      ...(post.modifiedAt ? { modifiedTime: post.modifiedAt } : {}),
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
  const previewOptions = await getPreviewOptions();
  const post = getPostMetaBySlug(slug, previewOptions);

  if (!post) {
    notFound();
  }

  const siteUrl = getSiteUrl();

  return (
    <>
      <script
        id="schema-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd([
            getArticleSchema({
              title: post.title,
              description: post.excerpt ?? "",
              publishedAt: post.publishedAt || new Date().toISOString(),
              modifiedAt: post.modifiedAt ?? undefined,
              slug: post.slug,
              author: post.authorName ?? "Petri Lahdelma",
              authorUrl: post.authorSlug
                ? `${siteUrl}/blog/authors/${post.authorSlug}`
                : undefined,
              mainImageUrl: post.mainImageUrl ?? undefined,
              mainImageAlt: post.mainImageAlt ?? undefined,
              tags: post.tags ?? [],
            }),
            getBreadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Blog", url: "/blog" },
              { name: post.title, url: `/blog/${post.slug}` },
            ]),
          ]),
        }}
      />
      <ClientArticleShell
        hero={
          <ServerArticleHero
            slug={slug}
            showUnpublished={previewOptions.showUnpublished}
          />
        }
        relatedPosts={<RelatedPosts currentSlug={slug} />}
      >
        <ServerArticleMain
          slug={slug}
          showUnpublished={previewOptions.showUnpublished}
        />
      </ClientArticleShell>
    </>
  );
}
