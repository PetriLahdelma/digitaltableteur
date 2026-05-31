import type { Metadata } from "next";
import Link from "next/link";

import { BlogPage } from "@dt-pages/Blog";
import { getVisiblePosts } from "./postMetadata";

export const metadata: Metadata = {
  title: "Blog | Digitaltableteur",
  description:
    "Articles on design systems, component architecture, AI-powered workflows, and DesignOps. Expert insights on React, TypeScript, and Figma.",
  openGraph: {
    title: "Blog | Digitaltableteur",
    description:
      "Articles on design systems, component architecture, AI-powered workflows, and DesignOps. Expert insights on React, TypeScript, and Figma.",
    type: "website",
    siteName: "Digitaltableteur",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Digitaltableteur",
    description:
      "Articles on design systems, component architecture, AI-powered workflows, and DesignOps. Expert insights on React, TypeScript, and Figma.",
  },
  alternates: {
    canonical: "/blog",
  },
};

export const revalidate = 600;

export default function Blog() {
  const posts = getVisiblePosts();

  return (
    <>
      <section aria-labelledby="blog-index-heading" className="sr-only">
        <h2 id="blog-index-heading">Blog articles</h2>
        <ul>
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              {post.excerpt ? <p>{post.excerpt}</p> : null}
            </li>
          ))}
        </ul>
      </section>
      <BlogPage />
    </>
  );
}
