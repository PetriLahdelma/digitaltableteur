import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPostMetaBySlug } from "../postMetadata";
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
      ...(post.mainImageUrl
        ? {
            images: [
              {
                url: post.mainImageUrl,
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
      ...(post.mainImageUrl ? { images: [post.mainImageUrl] } : {}),
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

  if (!post) {
    notFound();
  }

  return <ClientArticle slug={slug} />;
}
