import type { BlogPostMeta } from "@/app/blog/postMetadata";
import { toAbsoluteSiteUrl } from "@/app/lib/siteUrl";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildBlogRssFeed(posts: BlogPostMeta[]): string {
  const channelTitle = "Digitaltableteur Blog";
  const channelDescription =
    "Articles on design systems, component architecture, AI-powered workflows, and DesignOps.";
  const channelUrl = toAbsoluteSiteUrl("/blog");
  const feedUrl = toAbsoluteSiteUrl("/blog/feed.xml");
  const lastBuildDate =
    posts[0]?.publishedAt != null
      ? new Date(posts[0].publishedAt).toUTCString()
      : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const itemUrl = toAbsoluteSiteUrl(`/blog/${post.slug}`);
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : lastBuildDate;

      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${itemUrl}</link>
  <guid isPermaLink="true">${itemUrl}</guid>
  <description>${escapeXml(post.excerpt ?? post.title)}</description>
  <pubDate>${pubDate}</pubDate>${post.authorName ? `\n  <author>${escapeXml(post.authorName)}</author>` : ""}
</item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelUrl}</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />
${items}
  </channel>
</rss>`;
}
