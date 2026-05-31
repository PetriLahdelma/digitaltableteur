"use client";

import { LanguageNotice } from "@/app/components/LanguageNotice";
import { NextBlogNav } from "../NextBlogNav";

export default function ClientArticleChrome() {
  return (
    <>
      <LanguageNotice contentLanguage="en" />
      <NextBlogNav />
    </>
  );
}
