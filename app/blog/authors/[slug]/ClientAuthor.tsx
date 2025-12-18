"use client";

import { AuthorPage } from "../../../../nextjs-app/shared/components/pages/Blog";

export default function ClientAuthor({ slug }: { slug: string }) {
  return <AuthorPage slug={slug} />;
}
