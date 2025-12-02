import type { Metadata } from "next";

import { getAuthorBySlug } from "@/nextjs-app/shared/data/authors";
import ClientAuthor from "./ClientAuthor";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return {};

  // Convert imageUrl to string for metadata
  const imageUrlString =
    typeof author.imageUrl === "string"
      ? author.imageUrl
      : author.imageUrl &&
          typeof author.imageUrl === "object" &&
          "default" in author.imageUrl
        ? author.imageUrl.default
        : author.imageUrl &&
            typeof author.imageUrl === "object" &&
            "src" in author.imageUrl
          ? author.imageUrl.src
          : "/logo512.png";

  const title = `${author.name} | Digitaltableteur`;
  const description =
    author.bio?.slice(0, 160) ||
    "Learn more about this Digitaltableteur author.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrlString }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrlString],
    },
  };
}

export default async function AuthorProfile({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return <ClientAuthor slug={slug} />;
}
