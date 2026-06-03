import { getAuthorBySlug } from "@/nextjs-app/shared/data/authors";
import { generatePageOgImage, OG_SIZE } from "../../../lib/og-image-utils";

export const runtime = "edge";
export const alt = "Digitaltableteur Author";
export const size = OG_SIZE;
export const contentType = "image/png";

type Params = { slug: string };

export default async function Image({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);

  return generatePageOgImage({
    title: author?.name ?? "Author",
    subtitle:
      author?.bio?.slice(0, 90) ?? "Articles and insights from Digitaltableteur",
  });
}
