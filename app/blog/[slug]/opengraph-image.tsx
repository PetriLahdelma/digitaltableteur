import { getPostMetaBySlug } from "../postMetadata";
import { generateBlogOgImage, OG_SIZE } from "../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Digitaltableteur Blog";
export const size = OG_SIZE;
export const contentType = "image/png";

type Params = { slug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPostMetaBySlug(slug);

  return generateBlogOgImage({
    title: post?.title ?? "Blog Post",
    author: post?.authorName ?? "Petri Lahdelma",
    date: post?.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : undefined,
    readTime: post?.readTime,
  });
}
