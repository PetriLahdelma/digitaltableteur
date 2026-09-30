import type { Metadata } from "next";

import { BlogPage } from "@dt-pages/Blog";
import {
  getCollectionPageSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";
import { getVisiblePosts } from "./postMetadata";

const blogDescription =
  "Articles on design systems, component architecture, AI-powered workflows, and DesignOps. Expert insights on React, TypeScript, and Figma.";

export const metadata: Metadata = {
  title: "Blog | Digitaltableteur",
  description: blogDescription,
  openGraph: {
    title: "Blog | Digitaltableteur",
    description: blogDescription,
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Digitaltableteur",
    description: blogDescription,
  },
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": "/blog/feed.xml",
    },
  },
};

export const revalidate = 600;

export default function Blog() {
  const posts = getVisiblePosts();

  return (
    <>
      <script
        id="schema-blog-index"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(
            getCollectionPageSchema({
              name: "Digitaltableteur Blog",
              description: blogDescription,
              url: "/blog",
              items: posts.map((post) => ({
                name: post.title,
                url: `/blog/${post.slug}`,
                description: post.excerpt,
              })),
            }),
          ),
        }}
      />
      <BlogPage />
    </>
  );
}
