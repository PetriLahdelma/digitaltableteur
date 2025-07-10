import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { posts } from "../../src/pages/posts";

interface Props {
  slug: string;
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: posts.map((p) => ({ params: { slug: p.link.replace("/blog/", "") } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => ({
  props: { slug: params!.slug as string },
});

export default function BlogPostPage({ slug }: Props) {
  const post = posts.find((p) => p.link === `/blog/${slug}`);
  if (!post) return null;
  const Component = post.component as React.ComponentType;
  return <Component />;
}
