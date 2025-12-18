"use client";

import { AuthorPage } from "@dt-pages/Blog";

export default function ClientAuthor({ slug }: { slug: string }) {
  return <AuthorPage slug={slug} />;
}
