"use client";

import { BlogArticlePage } from "@dt-pages/Blog";
import { NextBlogNav } from "../NextBlogNav";
import { LanguageNotice } from "@/app/components/LanguageNotice";

export default function ClientArticle({ slug }: { slug: string }) {
  return (
    <article lang="en">
      <LanguageNotice contentLanguage="en" />
      <BlogArticlePage
        slug={slug}
        nav={<NextBlogNav />}
        shareBaseUrl={
          process.env.NEXT_PUBLIC_SITE_URL || "https://digitaltableteur.com"
        }
      />
    </article>
  );
}
