import type { Metadata } from "next";

import { getAuthorBySlug } from "@/shared/data/authors";
import ClientAuthor from "./ClientAuthor";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return {};
  const title = `${author.name} | Digitaltableteur`;
  const description = author.bio?.slice(0, 160) || "Learn more about this Digitaltableteur author.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: author.imageUrl ? [author.imageUrl] : ["/logo512.png"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: author.imageUrl ? [author.imageUrl] : ["/logo512.png"],
    },
  };
}

export default async function AuthorProfile({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return <ClientAuthor slug={slug} />;
}
