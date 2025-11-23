"use client";

import { AuthorPage } from "../../../../shared/components/pages/Blog";

export default function ClientAuthor({ slug }: { slug: string }) {
  return <AuthorPage slug={slug} />;
}
