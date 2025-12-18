"use client";

import { BlogArticlePage } from "../../../nextjs-app/shared/components/pages/Blog";
import { NextBlogNav } from "../NextBlogNav";

export default function ClientArticle({ slug }: { slug: string }) {
  return (
    <BlogArticlePage
      slug={slug}
      nav={<NextBlogNav />}
      shareBaseUrl={process.env.NEXT_PUBLIC_SITE_URL || "https://digitaltableteur.com"}
    />
  );
}
