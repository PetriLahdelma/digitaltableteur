import { NextResponse } from "next/server";

import { getVisiblePosts } from "@/app/blog/postMetadata";
import { buildPostMarkdown } from "@/app/lib/postMarkdown";
import { getSiteUrl } from "@/app/lib/siteUrl";

/**
 * Markdown version of a blog post for AI agents. Also served at the post URL
 * for Accept: text/markdown and at /blog/<slug>.md, through the proxy.
 * next.config adds a canonical Link header back to the HTML post.
 */

// Content changes only on deploy, so the Markdown is built once per build.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getVisiblePosts().map((post) => ({ slug: post.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getVisiblePosts().find((entry) => entry.slug === slug);
  const markdown = post ? buildPostMarkdown(post, getSiteUrl()) : null;
  if (!markdown) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      Vary: "Accept",
    },
  });
}
