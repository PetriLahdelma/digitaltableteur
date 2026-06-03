import type { Metadata } from "next";
import Link from "next/link";

import { BlogPage } from "@dt-pages/Blog";
import Title from "@dt/Title";
import {
  getCollectionPageSchema,
  stringifyJsonLd,
} from "@/app/lib/structuredData";
import { toAbsoluteSiteUrl } from "@/app/lib/siteUrl";
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
      <section aria-labelledby="blog-index-heading" className="sr-only">
        <Title as="h2" unstyled id="blog-index-heading">
          Blog articles
        </Title>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              {post.excerpt ? <p>{post.excerpt}</p> : null}
            </li>
          ))}
        </ul>
        <p>
          RSS feed:{" "}
          <a href={toAbsoluteSiteUrl("/blog/feed.xml")}>Subscribe</a>
        </p>
      </section>
      <BlogPage />
    </>
  );
}
