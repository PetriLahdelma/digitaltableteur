import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { BlogArticlePage } from "../../shared/components/pages/Blog";
import BlogNav from "@dt/BlogNav/BlogNav";
import { getBlogPostBySlug } from "../data/blogPosts";

const BlogArticle: React.FC = () => {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug ?? "");

  if (!post) {
    return <Navigate to="/not-found" replace />;
  }

  const metaTitle = post.seoTitle ?? `${post.title} | Digitaltableteur`;
  const metaDescription = post.seoDescription ?? post.excerpt ?? "";

  return (
    <HelmetProvider>
      <>
        <Helmet>
          <title>{metaTitle}</title>
          {metaDescription && (
            <meta name="description" content={metaDescription} />
          )}
          <meta property="og:title" content={metaTitle} />
          {metaDescription && (
            <meta property="og:description" content={metaDescription} />
          )}
          <meta property="og:image" content="/logo512.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={metaTitle} />
          {metaDescription && (
            <meta name="twitter:description" content={metaDescription} />
          )}
          <meta name="twitter:image" content="/logo512.png" />
        </Helmet>
        <BlogArticlePage slug={post.slug} nav={<BlogNav />} />
      </>
    </HelmetProvider>
  );
};

export default BlogArticle;
