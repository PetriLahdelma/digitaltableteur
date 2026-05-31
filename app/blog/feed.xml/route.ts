import { NextResponse } from "next/server";

import { buildBlogRssFeed } from "@/app/lib/blog/rss";
import { getVisiblePosts } from "../postMetadata";

export const revalidate = 600;

export async function GET() {
  const body = buildBlogRssFeed(getVisiblePosts());

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
